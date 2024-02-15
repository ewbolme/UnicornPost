import React from 'react';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import CloseIcon from '@mui/icons-material/Close';
import './cardsComponent.css';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { ScrollContainer } from 'react-indiana-drag-scroll';
import './style.css';
import { useState } from 'react';

import { handleInteractionCheck } from '../../services/home.service';
import { handleLocalAuthFetch } from '../../services/storage.service';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

import corrupted from '../../image.assets/corrupted.png';
import { CircularProgress } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: '16px',
  p: 4,
  padding: '40px 40px 40px 40px',
  width: '60%',
  height: 'max-content'
};


export default function CardsComponent({ cardList = [], tracker = false, showMore=false, showMoreCaller = null, showMoreSelectedGenre = null, showMoreCurrentPage = 1 }) {

    const [isLoading, setIsLoading] = useState(false);

    const handleShowMoreCall = async () =>{
        setIsLoading(true);
        await showMoreCaller(showMoreSelectedGenre, showMoreCurrentPage);
        setIsLoading(false);
    }
    

    return (
        <div className='sx'>
            {
               cardList && cardList.length
               ? <ScrollContainer className="sx-con">
                        {
                            Array(1)
                            .fill(0)
                            .map((_, row) => (
                                <div className={'sx-row'} key={row}>
                                    {Array(cardList.length )
                                        .fill(0)
                                        .map((_, col) => (
                                            <div key={`${row}_${col}`}>
                                                {
                                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                        <Card
                                                            key={cardList[col]?.article_id}
                                                            indexNumber={cardList[col]}
                                                            title={cardList[col].article_title}
                                                            tagLine={cardList[col]?.article_hook}
                                                            duration={cardList[col]?.posted_on}
                                                            summary={cardList[col]?.article_summary}
                                                            articleId={cardList[col]?.article_id}
                                                            tracker={tracker}
                                                        />
                                                        {(cardList[cardList.length - 1]) === cardList[col] 
                                                        ? <div className='see-more-root-div' >{
                                                            showMore===true
                                                            ? isLoading === true 
                                                                ? <div className='loader-show-more-root-div'><CircularProgress thickness={6} className='white progress-indicator'/> </div>
                                                                : <div className='loader-show-more-root-div' ><KeyboardDoubleArrowRightIcon onClick={handleShowMoreCall} className='pointer white'/></div>
                                                            :null}</div>
                                                        : null}
                                                    </div>
                                                }
                                            </div>
                                        ))}
                                </div>
                            ))
                        }
                    </ScrollContainer>
               : <div className='no-data-root-div'>
                    <img src={corrupted} alt="Logo" style={{  cursor: 'pointer', maxWidth: 100, marginLeft: 40 }} />
                    <div style={{ fontSize: '20px', textAlign: 'center' }}>No articles found !</div>
                    <p style={{ fontSize: '14px', textAlign: 'center' }}>Unfortunately, no article found at the moment. </p>
                </div>
            }
        </div>
    );
}


function Card({indexNumber, title, tagLine, duration, summary, articleId, tracker }) {

    const [openModal, setOpenModal] = React.useState(false);
    const handleModal = () => {
        if(!openModal && tracker){
            handleInteractionLogger();
        }
        setOpenModal(!openModal)
    };

    const getTimeAgo = (timestamp) => {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const secondsAgo = currentTimestamp - timestamp;
    
        const minutesAgo = Math.floor(secondsAgo / 60);
        const hoursAgo = Math.floor(minutesAgo / 60);
        const daysAgo = Math.floor(hoursAgo / 24);
        const weeksAgo = Math.floor(daysAgo / 7);
        const monthsAgo = Math.floor(daysAgo / 30);
        const yearsAgo = Math.floor(daysAgo / 365);
    
        if (secondsAgo < 60) {
            return secondsAgo + ' seconds ago';
        } else if (minutesAgo < 60) {
            return minutesAgo + ' minutes ago';
        } else if (hoursAgo < 24) {
            return hoursAgo + ' hours ago';
        } else if (daysAgo < 7) {
            return daysAgo + ' days ago';
        } else if (daysAgo < 28) {
            const remainingDays = daysAgo % 7;
            return weeksAgo + ' weeks ' + (remainingDays > 0 ? remainingDays + ' days' : '') + ' ago';
        } else if (monthsAgo < 12) {
            const remainingDays = daysAgo % 30;
            const remainingWeeks = weeksAgo % 4;
            return monthsAgo + ' months ' + (remainingWeeks > 0 ? remainingWeeks + ' weeks ' : '') +
                (remainingDays > 0 ? remainingDays + ' days' : '') + ' ago';
        } else {
            return yearsAgo + ' years ago';
        }
    };
 
    const splitAfterEveryThreeFullStops = (str) => {
        let arr = str.split('.');
        let result = [];
        for(let i=0; i<arr.length; i++) {
            if((i+1)%4 === 0 || i===arr.length-1) {
                result.push(arr.slice(i-3, i+1).join('.'));
            }
        }
        return result.map((item)=> <p>{item.endsWith(".") ? item: item+"."}</p>);
     }
     
    const handleInteractionLogger = async () => {
        try {
            const userData = JSON.parse(await handleLocalAuthFetch("user_data"));
            if(userData){
                await handleInteractionCheck({
                    "user_id": userData?.data?.user_id,
                    "article_id": articleId,
                    "interaction_timestamp": `${new Date().toISOString()}`
                  });
            }
        } catch (error) {
            console.log("Error in interaction Logger: ",error);
        }
    }

    return (
        <div className="main-container"
            style={{
                minHeight: '16rem',
                padding: indexNumber === 0 ? '10px 10px 10px 5px' : '10px',
                display: 'flex',
               
                flexDirection: 'column',
                marginRight: '30px'
            }}
            tabIndex={0}
        >

            {openModal && (
                    <Modal
                        open={true}
                        onClose={handleModal}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description">
                        <Box sx={modalStyle}>
                            <div className="card-date cd">
                                    <div>{getTimeAgo(duration)}</div>
                                    <div><CloseIcon
                                        onClick={handleModal}
                                        sx={{
                                            cursor:'pointer',
                                            marginLeft: '95%',
                                            color:'#414D5C'
                                        }}></CloseIcon>
                                    </div>
                                    
                                </div>
                                <div className="modal-content mc" >
                                
                                <div
                                    className="card-title ct">{title}</div>
                                <div
                                    className="card-content cc">
                                    <p>{tagLine}</p>
                                </div>
                                <div
                                    className="card-date cd2">Generated Article Summary</div>
                                <div
                                    className="card-content cc2">
                                    {splitAfterEveryThreeFullStops(summary)}  
                                </div>
                            </div>
                        </Box>
                    </Modal>
                )}

            <div  
                className="card"
                onClick={handleModal}
            >
                {/* Duration Section */}
                <div
                    className="card-date"
                    style={{
                        overflowY: 'hidden',
                        height: '15%'
                    }}
                >
                    {getTimeAgo(duration)}
                </div>

                {/* Title Section */}
                <div
                    className="card-title"
                    style={{
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        width: '100%',
                        height: 'calc(30%)'
                    }}
                >
                    {title.length > 70 ? title.slice(0,70)+"..."  : title}
                </div>


                {/* Tagline Section */}
                <div
                    className="card-content"
                    style={{
                        overflow: 'hidden',
                        height: 'calc(50%)',
                        width: '100%',
                        textOverflow: 'ellipsis'
                    }}
                >
                    <p>{tagLine.length > 170 ? tagLine.slice(0,170)+"..."  : tagLine}</p>
                </div>
            </div>
        </div>

    );
}