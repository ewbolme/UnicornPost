import { useEffect, useState } from "react";
import ColumnContainer from "../../components/columnContainer/columnContainer.component"
import { Grid, Slider, Typography, Checkbox, FormControlLabel, Button,CircularProgress, Tooltip } from "@mui/material"
import './personalized.css';
import * as constants from './constants.js';
import { WSS_URL } from "../../api/_config.js";
import { handleCreateNewsLetter, handleStorePersonalPageDataForDataMapped, handleUpdateIsEmailValid } from "../../services/home.service.js";
import { useSelector } from "react-redux";
import LinkyText from "../../components/linkify/linkify.jsx";
import { handleLocalAuthFetch } from "../../services/storage.service.js";
import {handleMaintainGenAiCheck,handleUpdateDiversitySliderValuePersonalized,handleUpdateNewsLetterTemplateData,handleUpdateCreateInProgress} from "../../services/home.service.js";
import { handleDefaultNotificationPopUp } from "../../services/validator.service.js";

export default function  PersonalizedNewsLetterMainLayout () {


    const { homeStateData, gen_ai_enabled, create_in_progress } = useSelector((state) => ({
        homeStateData: state.home,
        gen_ai_enabled:state.home.gen_ai_enabled,
        create_in_progress:state.home.create_in_progress
      }));


    const [selectedDiversity, setSelectedDiversity] = useState(homeStateData?.diversity_state_personalized || 1);
    const [newsLetterTextValue, setNewsLetterValue] = useState(constants.defaultNewsletterValue);
    const [genAiEnabled, setGenAiEnabled] = useState(false);
    const [newsLetterTemplateData, setNewsLetterTemplateData] = useState(constants.defaultNewsletterValue);
    const [createInProgress, setCreateInProgress] = useState(false);
    const [userTypeAllowed, setUserTypeAllowed] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    

    useEffect(() => {
        handleUserTypeCheck();
        setSelectedDiversity(homeStateData?.diversity_state_personalized ||1 );
        setNewsLetterTemplateData(homeStateData?.news_letter_template_data);
        setIsEmailValid(homeStateData?.is_current_email_valid || false);
    },[]);

    useEffect(() => {
        setCreateInProgress(create_in_progress);
    },[create_in_progress]);

    useEffect(() => {
        handlePersonalizeNewsLetter();
      },[selectedDiversity]) 

    useEffect(() =>{
        handleGeneratedNewsletter();  
    },[newsLetterTemplateData])

    console.log("newsLetterTemplateData : ",newsLetterTemplateData);

    useEffect(() => {
        setGenAiEnabled(gen_ai_enabled || false);
    },[gen_ai_enabled]);

    useEffect(() => {
        if(homeStateData?.new_article_response){
            handleMorphData(homeStateData?.new_article_response);
        }
    },[homeStateData?.new_article_response]);

    const handleUserTypeCheck = async () => {
        const typeData = await handleLocalAuthFetch("user_email");
        setUserTypeAllowed(JSON.parse(typeData)?.data.includes("@amazon") || false);
    }

    const handlePersonalizeNewsLetter = async () => {
        await handleUpdateDiversitySliderValuePersonalized(selectedDiversity);
    }

    const handleCreateInProgress = async (explicitValue = null) =>{
        await handleUpdateCreateInProgress(explicitValue !== null ? explicitValue : createInProgress);
    }

    const handleStorePersonalPageData = async (aiEnabled = false, sliderValue) => {
        await handleStorePersonalPageDataForDataMapped(aiEnabled, sliderValue);
    }

    const  handleGeneratedNewsletter = async () => {
        await handleUpdateNewsLetterTemplateData(newsLetterTemplateData)
    }  

    const handleCreateApiCall = async () => {
        const placeholders = ["{customer_name}","Human:","Assistant:","<instructions>","<example></example>","<article></article>","</instructions>","<article>","</article>","</example>","<example>"];
        const test = placeholders.every(i=>newsLetterTextValue.includes(i));
       
        if(!test && userTypeAllowed && genAiEnabled){
            await handleDefaultNotificationPopUp("warning","Required Placeholders were not provided!");
        }
        else{
            setCreateInProgress(true);
            await handleCreateInProgress(true);

            HandleResetTemplateData();

            const userData = await handleLocalAuthFetch("user_data");
            const bearerToken = await handleLocalAuthFetch("token");
           
            await handleStorePersonalPageData(genAiEnabled, selectedDiversity);
            await handleWebSocketProcess({
                "desired_items": selectedDiversity,
                "is_gen": `${genAiEnabled}`,
                "prompts": userTypeAllowed === true ? newsLetterTextValue : constants.defaultNewsletterValue,
                "user_id": JSON.parse(userData)?.data?.user_id || "",
                "user_name": JSON.parse(userData)?.data?.user_name || ""
            }, JSON.parse(bearerToken));
        }
    }

    const HandleResetTemplateData = async () => {
        setNewsLetterTemplateData("");
        await handleCreateNewsLetter([]);
    }
    
    const handleWebSocketProcess = async (data, bearerToken) => {
            
            const encodedURI = encodeURI(WSS_URL + "?auth=" + bearerToken?.data?.id_token);

            const ws = new WebSocket(encodedURI);

            ws.onopen = () => {
                ws.send(JSON.stringify({
                    "action": "get-report",
                    "data": data
                }));
            }

            ws.onmessage = async (message) => {
                const dataParsed = JSON.parse(message?.data);
                handleMorphData(dataParsed?.body || "");

                await handleCreateNewsLetter(dataParsed?.body);

                await handleCreateInProgress(false);
                setCreateInProgress(false);

                ws.close();
            }

            ws.onerror = (error) => {
                console.log('WebSocket error ', error);
                ws.close();
            };
                
            ws.onclose = (e) => {
                console.log("Bye Socket",e);
                setCreateInProgress(false);
            }
    }

    const handleMorphData = (dataParsed = "") => {
  
        if(dataParsed?.email == null || dataParsed?.email === ""){
            setIsEmailValid(false);
            handleUpdateIsEmailValid(false);
        }else{
            setIsEmailValid(true);
            handleUpdateIsEmailValid(true);
        }

        const morphedString = replaceWithLinks(dataParsed?.email || "", dataParsed?.articles);
        setNewsLetterTemplateData(morphedString || "");
 
    }

    const handleNewsLetterTextValueChange = (event) =>{
        setNewsLetterValue(event.target.value);
    }

    const handleGenAiCheckChange = (event, value) => {
        handleMaintainGenAiCheck(value);
        setGenAiEnabled(value);
    }

    const replaceWithLinks = (baseValue = "", articleListData = []) => {
        return <LinkyText articleListing={articleListData} text={baseValue} genAIEnabled={homeStateData?.current_personal_page_data?.checkBoxValue || false}></LinkyText>
    }

    
    return <Grid
                container
                direction="column"
                justifyContent="space-evenly"
                alignItems="flex-start"
            >
                <ColumnContainer  sx={{  padding: '40px 40px 40px 40px'  }}>
                <div className="slider-text stp" >
                        New Article Diversity Slider 
                    </div>
                    <div className='prompt-section-div' >
                    
                        <div style={{ width: '40%'}}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '26px', lineHeight: '30px' }} variant={'h6'}>Gen AI prompt</Typography>
                        </div>
                        <div style={{ width: '205px' ,paddingBottom: '1%'}}>
                            <Tooltip title={createInProgress === true ? "Please wait while we get latest result." : ""}>

                                <Slider
                                    aria-label="Small steps"
                                    defaultValue={selectedDiversity}
                                    disabled={createInProgress}
                                    step={1}
                                    marks={constants.marks}
                                    min={1}
                                    max={5}
                                    color="tertiary"
                                    valueLabelDisplay="auto"
                                    value={selectedDiversity}
                                    onChange={(_,v) => {
                                        setSelectedDiversity(v);
                                    }}
                                    sx={{
                                        '& .MuiSlider-thumb': {
                                        color: '#fff',
                                        border:'solid',
                                        borderColor:'#04273A',
                                        borderWidth:'2px',
                                        },
                                    }}
                                />
                            </Tooltip>
                        </div>
                    </div>

                    <div className="personalized-container" >
                        <div className='p-c-sub-div' >
                            <FormControlLabel 
                                style={{ marginLeft: 'auto' }}
                                control={
                                <Tooltip title={createInProgress === true ? "Please wait while we get latest result." : ""}>
                                    <Checkbox 
                                        disabled={createInProgress} 
                                        checked={gen_ai_enabled} 
                                        onChange={handleGenAiCheckChange}
                                    />
                                </Tooltip>
                                } label="Gen AI Prompt" />
                        </div>
                        <div className='text-area-root-div'>
                            <textarea
                                id='text-area'
                                disabled={userTypeAllowed === true && genAiEnabled === true ? false : true}
                                readOnly={userTypeAllowed === true && genAiEnabled === true ? false : true}
                                value={userTypeAllowed === true ? newsLetterTextValue :constants.defaultNewsletterValue}
                                onChange={handleNewsLetterTextValueChange}

                            ></textarea>
                        </div>

                        <div className='p-c-sub-div2' >
                            <Button
                                sx={{ color: 'white', '&:hover': {backgroundColor: '#ED8322'}, padding: '20px 50px',  fontWeight: 'bold', borderRadius: "40px", height: "34px", background: "#FF8E27", margin: "0", fontSize: '14px',  width: '12rem' }}
                                variant="contained"
                                onClick={handleCreateApiCall}
                            >
                                {
                                    createInProgress === true
                                    ? <CircularProgress 
                                        size={20}
                                        sx={{
                                          color: 'white',
                                        }}
                                        />
                                    : <p style={{textTransform: 'none', fontSize: '18px'}}>Create</p>
                                }
                            </Button>
                        </div>
                    </div>
                    <div className='note-div' >
                         <p className='gen-ai-note'>Note: </p>
                         <p className='gen-ai-note-text'>Ensure that the placeholder &#123;customer_name&#125; remain unchanged within their designated contexts. Maintain the consistent usage of "Human:" and "Assistant:" without alterations. Please change the content within &#60;instructions&#62;, &#60;article&#62;, and &#60;example&#62; tags and do not remove any of the tag.</p> 
                    </div>
                </ColumnContainer>
                <ColumnContainer sx={{ padding: '0 40px 40px 40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ width: '40%'}}>
                            <Typography sx={{ fontWeight: 'bold', fontSize: '26px', paddingBottom: '30px' }} variant={'h6'}>Personalized Newsletter </Typography>
                        </div>
                    </div>
                    <div className='template-cover-root-div'>
                        <div className={isEmailValid === false || createInProgress === true  ? "template-cover-no-data" : "template-cover" } data-text="Create a Prompt" >
                            {isEmailValid === false  && homeStateData?.news_letter_template_data===undefined
                            ? <p style={{ textTransform: 'none', fontSize:'18px',color:'#000000',opacity:'0.5' }}>Create a prompt</p> 
                            : createInProgress === true 
                                ? <CircularProgress 
                                    size={'3rem'}
                                    sx={{
                                        color: '#FF8E27',
                                    }}
                                />
                                : newsLetterTemplateData}
                        </div>
                    </div>
                    
                </ColumnContainer>

            </Grid>
  
}