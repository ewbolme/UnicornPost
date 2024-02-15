import { useEffect, useState } from "react";
import {Routes, Route} from "react-router-dom";
import ColorTabs from "./pages/tabs/tabs.component";
import Login from './pages/login'
import SignUp from "./pages/signUp";
import './static/fonts/AmazonEmber.ttf'
import './App.css'
import { Alert, Snackbar } from "@mui/material";
import { useSelector } from "react-redux";
import { handleClearPopUp } from "./services/validator.service";

export default function App (){

  const [isShowPopUp, setIsShowPopUp] = useState(false);
  const [popUpSeverity, setPopUpSeverity] = useState("warning");
  const [popUpMessage, setPopUpMessage] = useState("");


  const { pop_up } = useSelector((state) => ({
    pop_up : state.auth.pop_up
  }))


  useEffect(() => {
    const initialValue = document.body.style.zoom;
    document.body.style.zoom = "100%";
    return () => {
      document.body.style.zoom = initialValue;
    };
  }, []);

  useEffect(() => {
    if(pop_up){
      setPopUpSeverity(pop_up.priority);
      setPopUpMessage(pop_up.message);
      setIsShowPopUp(true);
    }
  },[pop_up])

  const handlePopUpClose = () => {
    handleClearPopUp();
    setIsShowPopUp(false);
  };

  return (
    <>
    <Routes >
      <Route path="/" element={ <Login /> } />
      <Route path="/home" element={ <ColorTabs /> } />
      <Route path="/sign-up" element={ <SignUp /> } />
    </Routes>
    {
        isShowPopUp && (
          <Snackbar
          open={isShowPopUp === true}
          autoHideDuration={5000}
          onClose={handlePopUpClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handlePopUpClose} severity={popUpSeverity} sx={{ width: '100%' }}>
            {popUpMessage}
          </Alert>
        </Snackbar>
        )
      }
    </>
  );
}
