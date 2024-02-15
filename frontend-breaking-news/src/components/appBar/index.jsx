import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import logo_newsletter from '../../static/images/unicorn-logo-dark.png';
import CssBaseline from '@mui/material/CssBaseline';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { Grid } from '@mui/material';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { handleLocalAuthClear } from '../../services/storage.service';
import LogoutTwoToneIcon from '@mui/icons-material/LogoutTwoTone';

const settings = [

{
  title: 'Logout',
  isEnabled: true,
  logo: <LogoutTwoToneIcon></LogoutTwoToneIcon>
}];

function ResponsiveAppBar() {
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSettingOptionClick = () =>{
      handleLocalAuthClear();
      window.location.href = "/";
  }

  const redirectToHome = () => {
    window.location.href = "/home";
  }

  return (
    <Box sx={{ display: 'flex', boxShadow: 'none' }}>
      <CssBaseline />
      <AppBar position="static" >
        <Toolbar style={{ justifyContent: 'space-between', background: '#04273A', paddingRight: '59px' }}>
          <img src={logo_newsletter} onClick={redirectToHome} alt="Logo" style={{  cursor: 'pointer', maxWidth: 100, marginLeft: 40 }} />
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Grid sx={{ gap: "5px" }} alignItems="center" container direction="row">
                <PersonOutlineOutlinedIcon style={{fill: "white"}}/>
                <Typography sx={{color: "white", fontWeight: 'bold'}}>Profile</Typography>
                <KeyboardArrowDownOutlinedIcon style={{fill: "white"}}/>
              </Grid>
            </IconButton>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-app-bar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
          {settings.map((setting) => (
            <MenuItem disabled={!setting.isEnabled} key={setting.title} sx={{ width: '100%', padding: '10px 20px 10px 20px' }} onClick={handleSettingOptionClick}>
              <>
                <div style={{ display: 'flex', flexDirection: 'row', paddingRight: '10px', alignItems: 'flex-start'}}>{setting.logo ?? null}</div>
                <Typography textAlign="center">{setting.title}</Typography>
              </>
            </MenuItem>
          ))}
        </Menu>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
export default ResponsiveAppBar;