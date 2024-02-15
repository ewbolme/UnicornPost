import React, {useEffect} from 'react';
import { useState } from 'react';
import { Skeleton, Slider, Typography } from '@mui/material';
import ColumnContainer from '../../components/columnContainer/columnContainer.component.jsx';
import './home.css'
import '../../App.css'
import CardsComponent from '../../components/cards/cards.component.jsx';
import BasicSelect from '../../components/basicSelect/basicSelect.component.jsx';
import { useSelector } from 'react-redux';
import BottomBar from '../../components/bottomBar/bottomBar.component.jsx';
import * as constants from "./constants.js";
import { handleGetBreakingNews,handleGetGenreNews, handleGetGenreTypes, handleStoreSelectedGenreValue, handleUpdateDiversitySliderValue} from '../../services/home.service.js';


export default function HomeTab () {

  /* Use Selector */
  const { homeStateData } = useSelector((state) => ({
    homeStateData: state.home,
  }));

  /* use States */
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedDiversity, setSelectedDiversity] = useState(2);
  const [listData, setListData] = useState({
    breaking_news: null,
    news_for_you: null,
    genre_news: null
  })
  
  const [genreTypesList, setGenreTypesList] = useState([]);
  const [hasMoreNoGenreData, setHasMoreNoGenreData] = useState(false);
  const [hasMoreGenreData, setHasMoreGenreData] = useState(false);

  const [noGenrePage, setNoGenrePage] = useState(1);
  const [genrePage, setGenrePage] = useState(1);

  const [brLoad, setBrLoad] = useState(false);
  const [nrLoad, setNrLoad] = useState(false);
  const [grLoad, setGrLoad] = useState(false);


  /* use Effects */
  useEffect(() => {
    if(homeStateData?.breaking_list == null || homeStateData?.no_genre_list == null || homeStateData?.genre_list == null){
      handleGetGenreTypes();
      handleApiCallsForHomePage();
    }
  },[])

  useEffect(() => {
    setListData({
      breaking_news: homeStateData?.breaking_list,
      news_for_you: homeStateData?.no_genre_list,
      genre_news: homeStateData?.genre_list
    });
    setSelectedDiversity(homeStateData?.diversity_state || 2);

    
    if(homeStateData?.genres_types !== null){
      mapGenreList();
    }

    setSelectedDiversity(homeStateData?.diversity_state || 2);
    if(homeStateData?.has_more_genre_data !== null){
      setHasMoreGenreData(homeStateData?.has_more_genre_data);
      setGenrePage(homeStateData?.genre_page);
    }
    if(homeStateData?.has_more_no_genre_data !== null){
      setHasMoreNoGenreData(homeStateData?.has_more_no_genre_data);
      setNoGenrePage(homeStateData?.no_genre_page);
    }
  },[homeStateData])

  useEffect(() => {
    if(selectedGenre && selectedGenre !== "" && homeStateData?.genre_list == null){

      handleApiCallsForHomePage("gn",selectedGenre);
    }
  },[selectedGenre])



  /* Handler Functions */
  const mapGenreList = () => {
    const morphedData = homeStateData?.genres_types?.genres_available.map((item) => {
      if(item==='ai'){
        return{
          name: item.toUpperCase(),
          value: item
        }
      }
      return {
        name: item.charAt(0).toUpperCase() + item.slice(1),
        value: item
      }
    });
    setGenreTypesList(morphedData);
    
    if(morphedData && morphedData.length){
      if(!homeStateData?.current_selected_genre === false){
        setSelectedGenre(homeStateData?.current_selected_genre);
      }else{
        setSelectedGenre(selectedGenre === "" ? morphedData[0].value : selectedGenre);
      }
    }
  }

  const handleApiCallsForHomePage = async (code = null, value = "", is_reset_genre_select = false) =>{
    switch (code) {
      case "br":
        setBrLoad(true);
        await handleUpdateDiversitySliderValue(value !== "" ? value : selectedDiversity);
        await handleGetBreakingNews(value !== "" ? value : selectedDiversity);
        setBrLoad(false);
        break;
      case "gn":
        setGrLoad(true);
        await handleGetGenreNews(value,is_reset_genre_select === true ? 1 : genrePage-1 || 1);
        setGrLoad(false);
        break;
    
      default:
        setBrLoad(true);
        await handleGetBreakingNews(value !== "" ? value : selectedDiversity);
        setBrLoad(false);

        setGrLoad(true);
        await handleGetGenreNews("",noGenrePage);
        setGrLoad(false);

        if(selectedGenre){
          setNrLoad(true);
          await handleGetGenreNews(selectedGenre,genrePage);
          setNrLoad(false);
        }
        
        break;
    }
  }

  const handleGenreChange = (v) => {
    setSelectedGenre(v);
    handleStoreSelectedGenreValue(v);
    handleApiCallsForHomePage("gn", v, true);
  }

  return (
    <ColumnContainer background={'#EEEEF3'} sx={{  padding: '40px 40px 40px 40px' }}>

      {/* Section A */}
      <ColumnContainer>
      <div className="slider-text" >
      New Article Diversity Slider 
      </div>
        <div className='flex jsb w-full' >
              <div className='' style={{ width: '40%', padding: '0 0 20px 5px'}}>
                  <Typography sx={{ fontWeight: 'bold', fontSize: '26px', lineHeight: '30px' }} variant={'h6'}>Breaking News</Typography>
              </div>
              <div style={{ width: '205px' }}>
                  <Slider
                      aria-label="Small steps"
                      defaultValue={selectedDiversity}
                      step={2}
                      marks={constants.marks}
                      min={2}
                      max={10}
                      color="tertiary"
                      valueLabelDisplay="auto"
                      value={selectedDiversity}
                      onChange={(_,v) => {
                        setSelectedDiversity(v);
                        handleApiCallsForHomePage("br",v)
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
              </div>
          </div>
          {
            !brLoad && listData?.breaking_news
            ? <CardsComponent cardList={listData?.breaking_news} />
            : <div style={{ width: "27vw", height: '200px'}}>
                  {
                      [1,2,3,4].map((i) => {
                          return (
                              <Skeleton key={`i_${i}`} animation="wave" />
                          )
                      })
                  }
              </div>
          }
      </ColumnContainer>

      
      {/* Section B */}
      <ColumnContainer sx={{ padding: '40px 0 0 0 ' }}>
        <div style={{ width: '40%', padding: '0 0 20px 5px'}}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '26px', lineHeight: '30px' }} variant={'h6'}>News for you</Typography>
        </div>
        {
            !nrLoad && listData?.news_for_you !== null && listData?.news_for_you
            ? <CardsComponent showMore={hasMoreNoGenreData} showMoreSelectedGenre={""} showMoreCurrentPage={noGenrePage} showMoreCaller={handleGetGenreNews} cardList={listData?.news_for_you} tracker={true}/>
            : <div style={{ width: "27vw", height: '200px'}}>
                  {
                      [1,2,3,4].map((i) => {
                          return (
                              <Skeleton key={`j_${i}`} animation="wave" />
                          )
                      })
                  }
              </div>
          }
      </ColumnContainer>

      {/* Section C */}
      <ColumnContainer sx={{ padding: '40px 0 0 0'}}>
        <div className='flex jsb' style={{ width: '100%' }}>
          <div style={{ width: '40%', padding: '0 0 20px 5px'}}>
              <Typography sx={{ fontWeight: 'bold', fontSize: '26px', lineHeight: '30px' }} variant={'h6'}>Genre of news</Typography>
          </div >
          <div style={{ width: 'max-content', position: 'relative', left: '10px' }}>
            <BasicSelect items={genreTypesList} setParentValue={handleGenreChange} value={selectedGenre}></BasicSelect>
          </div>
        </div>
        <div className='flex' sx={{ flexDirection: 'column' }}>
        {
            !grLoad && listData?.genre_news
            ? <CardsComponent showMore={hasMoreGenreData} showMoreSelectedGenre={selectedGenre} showMoreCurrentPage={genrePage} showMoreCaller={handleGetGenreNews} cardList={listData?.genre_news} tracker={true}/>
            : <div style={{ width: "27vw", height: '200px'}}>
                  {
                      [1,2,3,4].map((i) => {
                          return (
                              <Skeleton key={`k_${i}`} animation="wave" />
                          )
                      })
                  }
              </div>
          }
        </div>
      </ColumnContainer>
      <BottomBar></BottomBar>
    </ColumnContainer>
  )
}