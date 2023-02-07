import React from 'react'
import { Link } from 'gatsby'

import {
  Button,
  Toolbar,
  IconButton,
  AppBar,
  Drawer,
  List,
  Divider,
  ListItem,
  ListItemText,
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

import Typography from '@material-ui/core/Typography'

import logoTrans from '../../assets/icon-trans.png'
import useStyles from '../../utils/styles'

import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { VColor } from '../../utils/constants'
import Utils from '../../utils/utils'

const menuItems_admin = [
  // { label: 'SCAN CARD', link: '/scan-card' },
  // { label: 'NFC READ', link: '/nfc-read' },
  { label: 'ORDER CARD', link: '/order-card' },
  { label: 'MANAGE CARDS', link: '/manage-cards' },
  { label: 'USERS', link: '/users' },
  { label: 'ADMIN', link: '/admin' },
  { label: 'CHANGE PASSWORD', link: '/change-password' },
]

const menuItems_holder = [
  // { label: 'SCAN CARD', link: '/scan-card' },
  // { label: 'NFC READ', link: '/nfc-read' },
  { label: 'ORDER CARD', link: '/order-card' },
  { label: 'CHANGE PASSWORD', link: '/change-password' },
]

const menuItems = [
  // { label: 'SCAN CARD', link: '/scan-card' },
  // { label: 'NFC READ', link: '/nfc-read' },
  { label: 'ORDER CARD', link: '/order-card' },
  { label: 'MANAGE CARDS', link: '/manage-cards' },
  { label: 'USERS', link: '/users' },
  { label: 'CHANGE PASSWORD', link: '/change-password' },
]

const Header = ({ menuIndex }) => {
  const classes = useStyles()
  const theme = useTheme()
  // const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const isDesktop = useMediaQuery('(min-width:1030px)')
  const isAdmin = localStorage.getItem('user_role') === 'Administrator'
  const isHolder = localStorage.getItem('user_role') === 'CardHolder'
  let menu_items = menuItems
  if (isAdmin){
    menu_items = menuItems_admin
  } else if (isHolder){
    menu_items = menuItems_holder
  }
  

  const [openDrawer, setOpenDrawer] = React.useState(false)

  const toggleDrawer = open => event => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }

    setOpenDrawer(open)
  }

  const list = () => (
    <div
      className={classes.menuList}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        { menu_items.map((item, index) => (
          <Link to={item.link} key={Utils.getKey()}>
            <ListItem
              button
              key={item.label}
              style={{ marginTop: 6, backgroundColor: menuIndex == index ? VColor.opacityBlue : VColor.white }}
            >
              <ListItemText primary={item.label}/>             
            </ListItem>
          </Link>
        ))}
      </List>
      <Divider />
      <List>
        {['SIGN OUT'].map((text, index) => (
          <Link to={'/'} key={Utils.getKey()}>
            <ListItem button key={text}>
              <ListItemText primary={text} 
                onClick={()=> {
                  localStorage.setItem('token', '')
                  localStorage.setItem('domain', '')
                  localStorage.setItem('camera_access', 'false')
                  localStorage.setItem('userId', '')
                  localStorage.setItem('user_permissions', '')
                  localStorage.setItem('user_programs', '')
                }}/>
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  )

  return (
    <AppBar position="static" style={{ marginBottom: 10 }}>
      <Toolbar className={classes.tollbar}>
        <img src={logoTrans} style={{ width: 32, height: 32, margin: 0 }} />
        <Typography
          variant="body1"
          style={{ marginLeft: 10, fontSize: 24, fontWeight: '200' }}
        >
          Veritec
        </Typography>
        {isDesktop ? (
          <>
            <div style={{ margin: '8px 0 0 20px' }}>
              {menu_items.map((one, index) => {
                return (
                  <Link to={one.link} key={Utils.getKey()}>
                    <Button  style={{ position: 'relative', color: VColor.opacityBlue }}>
                      {one.label}
                      {index == menuIndex ? (
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            bottom: -5,
                            width: '100%',
                            height: 3,
                            backgroundColor: 'white',
                          }}
                        ></div>
                      ) : null}
                    </Button>
                  </Link>
                )
              })}
            </div>
            <div className={classes.grow} />
            <div style={{ margin: '8px 0 0 20px' }}>
              <Link to={'/'} replace>
                <Button 
                  style={{color: VColor.opacityBlue}}
                  onClick={()=>{
                    localStorage.setItem('token', '')
                    localStorage.setItem('domain', '')
                    localStorage.setItem('camera_access', 'false')
                    localStorage.setItem('userId', '')
                    localStorage.setItem('user_permissions', '')
                    localStorage.setItem('user_programs', '')
                  }}>sign out</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className={classes.grow} />
            <IconButton
              edge="start"
              // className={classes.menuButton}
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </>
        )}
      </Toolbar>
      <Drawer anchor={'right'} open={openDrawer} onClose={toggleDrawer(false)}>
        {list('right')}
      </Drawer>
    </AppBar>
  )
}

export default Header
