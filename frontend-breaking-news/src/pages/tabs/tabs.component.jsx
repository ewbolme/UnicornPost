import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import HomeMainLayout from '../home/index';
import NewArticleMainLayout from '../newArticle';
import PersonalizedNewsLetterMainLayout from '../personalizedNewsLetter';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import ResponsiveAppBar from '../../components/appBar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import BottomBar from '../../components/bottomBar/bottomBar.component';
import { handleAuthCheck, handleUpdateSessionState } from '../../services/auth.service';
import './tabs.css';
import { useSelector } from 'react-redux';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF8E27',
    },
    secondary:{
      main: '#9BA7B6',
    },
    tertiary:{
      main:'#04273A'
    }
  },
});

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default function ColorTabs() {

  /* Use Selector */
  const { AuthStateData } = useSelector((state) => ({
    AuthStateData: state.auth,
  }));

  const [value, setValue] = React.useState(0);

  useEffect(() => {
    if(AuthStateData && AuthStateData?.IsSessionTimeout === true){
      window.location.href = '/';
    }
  },[AuthStateData])

  useEffect(() => {
    handleAuthCheckForSession();
  },[]);

  const handleAuthCheckForSession = async () =>{
    const result = await handleAuthCheck();

    if(result === true && AuthStateData.IsSessionTimeout === false){
      await handleUpdateSessionState(result);
    }
  };

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', background: '#EEEEF3', minHeight: "100vh" }}>

        <ResponsiveAppBar />
        <Box sx={{ borderBottom: 1, borderColor: 'divider', padding: '40px 40px 0px 68px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="base"
            >
              <Tab sx={{ fontWeight: value=== 0 ? '700' : '500', fontSize: '20px', textTransform: 'none', color:  value=== 0 ? '': '#9BA7B6', lineHeight:'30px'  }} label="Home" />
              <Tab sx={{ fontWeight: value=== 1 ? '700' : '500', fontSize: '20px', textTransform: 'none', color:  value=== 1 ? '': '#9BA7B6', lineHeight:'30px'  }} label="New Article" />
              <Tab sx={{ fontWeight: value=== 2 ? '700' : '500', fontSize: '20px', textTransform: 'none', color:  value=== 2 ? '': '#9BA7B6' , lineHeight:'30px' }} label="Personalized Newsletter" />
            </Tabs>

            {
              value === 0 && (
                <Button className='add-article-button' startIcon={<AddIcon />} onClick={(e)=>handleChange(e,1)} sx={{ textTransform: 'unset !important', '&:hover': {backgroundColor: '#ED8322'},fontWeight: '800', borderRadius: "40px", width: 'max-content', height: "45px", background: "#FF8E27", margin: "0 25px 0 0", color: 'white', border: '2px', fontSize: '18px', overflow: 'ellipse', boxShadow: 'none' }} variant="contained">
                  <div>{"Add new article"}</div>
                </Button>
              )
            }
          </div>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <HomeMainLayout />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <NewArticleMainLayout />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <PersonalizedNewsLetterMainLayout />
        </CustomTabPanel>
        <BottomBar></BottomBar>
      </Box>
    </ThemeProvider>
  );
}