import React, { useState } from 'react';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import UserImage from "../../static/images/Mask-group.svg";
import Radio from '@mui/material/Radio';
import { handleGetArticlesByUser, handleGetUserId, handleSetGettingUserArticleInProgress } from '../../services/home.service';
import './interested-user-scrollbar.css';
import { ScrollContainer } from 'react-indiana-drag-scroll';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import { useEffect } from 'react';


export default function InterestedUserScrollMenu({ itemList, preSelectedUserID = null }) {

  const [selectedUser, setSelectedUser] = useState("");

  useEffect(()=>{
    handleGetUserId(selectedUser);
  },[selectedUser])
  

  return (
    <div>
      <ScrollContainer className="sx-con">
      {
          Array(1)
          .fill(0)
          .map((_, row) => (
              <div className={'sx-row'} key={row}>
                  {Array(itemList.length )
                      .fill(0)
                      .map((_, col) => (
                          <div key={`${row}_${col}`}>
                              <Card
                                itemId={itemList[col]?.user_id}
                                name={itemList[col]?.user_name}
                                key={itemList[col]?.user_id}
                                logo={itemList[col]?.profile_image_url}
                                selectedUser={preSelectedUserID !== null ? preSelectedUserID : selectedUser}
                                handleSetUser={setSelectedUser}
                              />
                          </div>
                      ))}
              </div>
          ))
      }
      </ScrollContainer>
    </div>
  );
}

const Card = ({ name, itemId, logo, selectedUser, handleSetUser }) => {

  const processRequest = async () => {

    handleSetGettingUserArticleInProgress(true);

    handleSetUser(itemId);
    await handleGetArticlesByUser(itemId);

    handleSetGettingUserArticleInProgress(false);
  }

  const handleGetUserArticles = async (e) =>{
    if(e.target.checked !== null && e.target.checked === true){

      processRequest();
    }
  }

  
  return (
    <div
      className='scroll-root-div'
      tabIndex={0}
    >
      <div className='pointer card-inner' onClick={processRequest} style={{ border: selectedUser===itemId? '2px orange solid' : 'none' } }>
            <div className='inner-checkbox-div' > 
              <Radio checked={selectedUser === itemId} onClick={handleGetUserArticles}/> 
            </div>
            <div>  <img src={logo || UserImage} className="card-user-img" alt="user" /></div>
            <div style={{ paddingBottom: '10px', fontWeight: 'bold' }}>{name}</div>
      </div>
    </div>
  );
}

