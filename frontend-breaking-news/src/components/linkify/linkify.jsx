import React, { useEffect, useState } from 'react';
import { handleGetArticleById } from '../../services/home.service';
import { Modal, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './linkify.css';

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

export default function LinkyText ( {articleListing, text, genAIEnabled } ) {

  const [openModal, setOpenModal] = useState(false);
  const [fulList, setFullList] = useState([]);
  const [details, setDetails] = useState({})

  const handleModal = () => setOpenModal(!openModal);

  useEffect(() => {
    if(articleListing){
      setFullList(articleListing || []);
    }
  },[articleListing]);

  const handleClick = async (event) => {
    const index = event.target.textContent.slice(event.target.textContent.lastIndexOf('[') + 1, event.target.textContent.lastIndexOf(']'));
    const mappedArticle = fulList[index];

    const response = await handleGetArticleById(mappedArticle?.article_id, mappedArticle?.article_cluster_id);

    if(response && response.length > 0){
      setDetails(
        {
          indexNumber:"",
          title: response[0]?.article_title || "", 
          tagLine: response[0]?.article_hook || "", 
          duration:response[0]?.posted_on || "", 
          summary: response[0]?.article_summary || ""
        }
      );
      setTimeout(() => {
        setOpenModal(true);
      }, 100);
    }
  };

  const handleRedirectHomeClick = async () => {
    window.location.href = "/home";
  }

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

  const parseText = (input) => {
    const morphed = input.replaceAll("[", " ").replaceAll("]"," ").split("\n");
    return morphed.map((item)=>{
      return <>{item.toString()}<br></br></>
    });
  };

  const normalParse = (input) => {
      const regex = /\[(.*?)\]/g;
      let lastIndex = 0;
      let linkIndex = 0;
      const elements = [];
  
      let match;
      while ((match = regex.exec(input)) !== null) {
        
        const plainText = input.substring(lastIndex, match.index);
        if (plainText) {
          const noDashText = plainText.replaceAll("-", "") || "";
          if(noDashText.includes("Dear")){
            elements.push(<>
              {noDashText.split(",")[0]+","}
            </>);
            elements.push(<><br></br><br></br>{noDashText.split(",")[1]}</>);
          }else if(noDashText.includes("For more breaking news visit")){
            elements.push(<>
              {noDashText.split("For more breaking news visit")[0]}
              <br></br><br></br><br></br>
              For more breaking news visit,
            </>);
          }else{
            elements.push(noDashText.startsWith(".") ? noDashText.slice(2, -1) : noDashText);
          }
        }
  
        const linkText = match[1];
        elements.push(
          <span
            key={linkIndex}
            onClick={(event) => handleClick(event)}
            style={{ color: 'blue', cursor: 'pointer' }}
          >
            {!linkText.includes("www.unicornpost.com") 
            ? <><br></br><br></br>{"- "}{linkText}{"["+linkIndex+"] : "}</>
            : <></>
            }
            
          </span>
        );
  
        lastIndex = regex.lastIndex;
        linkIndex++;
      }
  
      const remainingText = input.substring(lastIndex);
      if (remainingText) {
        if(remainingText.includes("For more breaking news") && remainingText.includes("Sincerely")){
          
          elements.push(remainingText.split("For more breaking news")[0].startsWith(".") ? remainingText.split("For more breaking news")[0].slice(2, -1) : remainingText.split("For more breaking news")[0]);
          elements.push(<>
            <br></br>
            <p>{"For more breaking news"+remainingText.split("For more breaking news")[1].split("Sincerely")[0]}</p>
            <p>{"Sincerely,"}</p>
            <p>{remainingText.split("For more breaking news")[1].split("Sincerely,")[1]}</p>
          </>
          );
        }else if(!remainingText.includes("For more breaking news") && remainingText.includes("Sincerely")){
          
          elements.push(<>
            <span
              key={linkIndex}
              onClick={(event) => handleRedirectHomeClick(event)}
              style={{ color: 'blue', cursor: 'pointer' }}
            >
              www.unicornpost.com
            </span>
            <br></br><br></br>
            Sincerely,
          </>);
          elements.push(<><br></br>{remainingText.split(",")[1]}</>);
        }else if(remainingText.includes("For more breaking news") && !remainingText.includes("Sincerely")){
          
          elements.push(<>
            {remainingText.split(",")[0].split("Sincerely")[0]}
            <br></br><br></br>
            Sincerely,
          </>);
          elements.push(<><br></br>{remainingText.split(",")[1]}</>);
        }else{
  
          elements.push(remainingText);
        }
      }
  
      return elements;
  }

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

  return <>
    <div>{genAIEnabled === true ? parseText(text) : normalParse(text)}</div>
    {openModal && (
        <Modal
            open={true}
            onClose={handleModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description">
            <Box sx={modalStyle}>
                <div className="card-date cdl" >
                        <div>{getTimeAgo(details?.duration)}</div>
                        <div><CloseIcon
                            onClick={handleModal}
                            sx={{
                                cursor:'pointer',
                                marginLeft: '95%',
                                color:'#414D5C'
                            }}></CloseIcon>
                        </div>
                        
                    </div>
                    <div className="modal-content mcl">
                    
                    <div
                        className="card-title ctl" >{details?.title}</div>
                    <div
                        className="card-content ccl">
                        <p>{details?.tagLine}</p>
                    </div>
                    <div
                        className="card-date cdl2">Generated Article Summary</div>
                    <div
                        className="card-content ccl2">
                        {splitAfterEveryThreeFullStops(details?.summary)}  
                    </div>
                </div>
            </Box>
        </Modal>
    )}
  </>;
};

