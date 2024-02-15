import { Typography, Grid, CircularProgress } from '@mui/material';
import ColumnContainer from '../../components/columnContainer/columnContainer.component.jsx';
import './newArticle.css'
import Button from '@mui/material/Button';
import InterestedUserScrollMenu from '../../components/interested-users-scrollbar/interested-user-scrollbar.js'
import CardsComponent from '../../components/cards/cards.component.jsx';
import { useEffect, useState } from 'react';
import { Skeleton } from '@mui/material';
import { handleClearArticlePageData, handleCreateNewArticle, handleMaintainNewArticleContent,handleUpdateCreateInProgressNew } from '../../services/home.service.js';
import { useSelector } from 'react-redux';
import { handleDefaultNotificationPopUp } from '../../services/validator.service.js';
import corrupted from '../../image.assets/corrupted.png';



export default function NewArticleMainLayout() {

    /* Use Selector */
    const { viewedArticles, article_create_list, content_data, current_user, articles_in_progress, create_in_progress_new } = useSelector((state) =>
    ({
        viewedArticles: state.home.articles_by_user_list || [],
        article_create_list: state.home.article_create_response || [],
        content_data: state.home.new_article_create_content || "",
        current_user: state.home.current_user_selection || "0",
        articles_in_progress: state.home.getting_new_article_for_user || false,
        create_in_progress_new:state.home.create_in_progress_new
    }));

    const [createInProgressNew, setCreateInProgress] = useState(false);
    const [userRecommendation, setUserRecommendation] = useState([]);
    const [currentCreationContent, setCurrentCreationContent] = useState("");

    useEffect(() => {
        if(content_data) {
            handleUpdateStateCreationContent(content_data);
        }
    },[content_data])

    useEffect(() => {
        setCreateInProgress(create_in_progress_new);
    },[create_in_progress_new]);

    useEffect(() => {
        if(article_create_list && article_create_list.length){
                handleUpdateArticleList();
            }
    },[article_create_list])

    const handleUpdateStateCreationContent = (data) => {
        setCurrentCreationContent(data);
    }

    const handleCreateInProgress = async (explicitValue = null) =>{
        await handleUpdateCreateInProgressNew(explicitValue !== null ? explicitValue : createInProgressNew);
    }

    const handleUpdateArticleList = () => {
        setUserRecommendation(article_create_list);
    }

    const handleChangeArticleContent = async (e) => {
        setCurrentCreationContent(e.target.value);
        await handleMaintainNewArticleContent(e.target.value);
    }

    const handleSubmitArticle = async () => {
        if (content_data === "") {
            handleDefaultNotificationPopUp("warning", "Minimum of 200 words are required to create Article. Got 0 words.");

        } else if (content_data && content_data.trim().split(/\s+/).length >= 200) {

            handleClearArticlePageData();
            setUserRecommendation([]);

            setCreateInProgress(true);
            await handleCreateInProgress(true);

            const userRecommended = await handleCreateNewArticle({ data: content_data });

            if (userRecommended) {
                setUserRecommendation(userRecommended);

                setCreateInProgress(false);
                await handleCreateInProgress(false);
                if (userRecommended.status === false) {
                    handleDefaultNotificationPopUp("warning", "Entered input is either invalid or not sufficient to process.");
                }

            } else {

                handleDefaultNotificationPopUp("warning", "Something is not right! we are working on it!!");
                setCreateInProgress(false);
                await handleCreateInProgress(false);
            }
        } else {
            handleDefaultNotificationPopUp("warning", `Minimum of 200 words are required to create Article. Got ${content_data.trim().split(/\s+/).length} words.`);
        }
    }
    

    return (
        <ColumnContainer sx={{ padding: '40px 40px 40px 40px' }}>

            <Grid
                container
                direction="column"
                justifyContent="space-evenly"
                alignItems="flex-start"
            >
                <ColumnContainer sx={{ padding: '0 0 40px 0 ' }}>
                    <div className='title-main-div' >
                        <div style={{ width: '40%' }}>
                            <Typography sx={{ fontWeight: '700', fontSize: '26px', lineHeight: '30px' }} >Add New Article</Typography>
                        </div>
                    </div>

                    <div className="personalized-container-small" >

                        <div style={{ width: '97.5%', height: '100%', overflow: 'hidden' }}>
                            <textarea
                                disabled={createInProgressNew === true? true : false}
                                className="new-article-area"
                                value={currentCreationContent}
                                onChange={handleChangeArticleContent}
                                resize='none'
                            >
                            
                            </textarea>
                        </div>

                        <div className='submit-section-div' >
                            <Button
                                className='submit-button-sx'
                                sx={{ color: 'white', padding: '20px 50px', '&:hover': { backgroundColor: '#ED8322' }, width: '12rem', fontWeight: 'bold', borderRadius: "40px", height: "34px", background: "#FF8E27", margin: "0", fontSize: '14px' }}
                                variant="contained"
                                onClick={handleSubmitArticle}
                            >
                                {
                                    createInProgressNew === true
                                        ? <CircularProgress
                                            size={20}
                                            sx={{
                                                color: 'white',
                                            }}
                                        />
                                        : <p style={{ textTransform: 'none', fontSize: '18px' }}>Submit</p>
                                }
                            </Button>
                        </div>
                    </div>
                </ColumnContainer>
            </Grid>

            {
                userRecommendation && userRecommendation.length > 0
                    ? <>
                        <ColumnContainer>
                            <div style={{ paddingBottom: '20px' }}>
                                <Typography sx={{ fontWeight: '700', fontSize: '26px', lineHeight: '30px' }} variant={'h6'}>Sample List of Interested Users</Typography>
                            </div>
                            <InterestedUserScrollMenu preSelectedUserID={current_user} itemList={userRecommendation}></InterestedUserScrollMenu>

                        </ColumnContainer>
                    </>
                    : null
            }

            {
                userRecommendation && userRecommendation.length > 0 && viewedArticles && viewedArticles.length > 0 
                ? <ColumnContainer>
                    <div style={{ paddingBottom: '20px', paddingTop: '40px' }}>
                        <Typography sx={{ fontWeight: '700', fontSize: '26px', lineHeight: '30px' }} variant={'h6'}>List of Articles Last Viewed by the User</Typography>
                    </div>
                    {
                        viewedArticles && viewedArticles.length > 0 
                            ? articles_in_progress === false
                                ? <CardsComponent cardList={viewedArticles} />
                                : <div style={{ width: "27vw", height: '200px', marginTop:'40px' }}>
                                    {
                                        [1, 2, 3, 4].map((i) => {
                                            return (
                                                <Skeleton animation="wave" />
                                            )
                                        })
                                    }
                                </div>
                            :
                                <div className='no-data-root-div-create-new-article'>
                                    <img src={corrupted} alt="Logo" style={{ cursor: 'pointer', maxWidth: 100, marginLeft: 40 }} />
                                    <div style={{ fontSize: '20px', textAlign: 'center' }}>No articles found !</div>
                                    <p style={{ fontSize: '14px', textAlign: 'center' }}>Unfortunately, no article found at the moment. </p>
                                </div>
                    }
                </ColumnContainer>   
                    :null
            } 
        </ColumnContainer>
    )
}