import { makeStyles } from '@material-ui/core/styles'
import { VColor } from './constants'

const useStyles = makeStyles(theme => ({
    formRoot: {
      '& > *': {
        marginBottom: theme.spacing(0),
      },
    },
    grow:{
      flexGrow:1,
    },
    tollbar: {
      minHeight: '55px !important',
    },
    backdrop: {
      position:'fixed',
      zIndex: '1000000 !important',
      color: '#fff',
    },
    menuList:{    
      width: 220,    
      marginLeft: 10,
      marginRight: 10,
      marginTop: 5
    },
    rootContainer: {
      padding: 0,  
      paddingLeft: 10, paddingRight: 10,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      overflow: 'hidden',
    },

    paper: {
      maxWidth: 350,
      width: '80%',
      paddingTop: 60,
      paddingBottom: 30,
    },
    aboutTermScrollRoot:{
      maxWidth: '80vw',
      maxHeight: 'calc(100vh - 180px)', 
      flexGrow:1,
      overflow: 'auto',  
    },
    descScrollRoot:{
      
      maxHeight: '35vh', 
      
      overflow: 'auto',  
      
    },
    signin: {
        float: 'right',
    },

    cardViewGrid: {
      padding: theme.spacing(2),      
      color: theme.palette.text.secondary,
      flexGrow:1 
    },

    cardViewGridLeft:{
      padding: theme.spacing(2),      
      color: theme.palette.text.secondary,
      flexGrow:1 ,
      minWidth: 300,
      maxWidth: '338px !important',
    },

    cardViewRoot:{
      maxWidth: '100vw !important',
      padding: 20,
      paddingBottom: 5,
      height:'calc(100vh - 70px)',
      overflow:'auto',
      position:'relative',
      
    },

    cardTitle:{
      fontSize: 14,
      fontWeight: 600,
      color: VColor.black,      
      marginBottom: -5
    },
    cardNumber:{
      fontSize: 14,
      fontWeight: 600,
      color: VColor.red,    
      marginBottom: -5
    },

    labelText:{
      fontSize: 12,
      color: VColor.darkGray,      
    },

    mainText:{
      fontSize: 16,
      color: VColor.darkGray,      
    },

    errorText:{
      marginLeft: 10,
      fontSize: 10,
      color: VColor.red,      
    },

    cellText:{
      align: 'center'
    }

  }))
  
  export const forgotPwdStyles = makeStyles(theme => ({
    formRoot: {
      '& > *': {
        marginBottom: theme.spacing(4),
      },
    },
    signin: {
      float: 'right',
    },
    rootContainer: {
      padding: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    paper: {
      maxWidth: 400,
      width: '80%',
      paddingTop: 60,
    },

  }))
  
  export const indexStyles = makeStyles(theme => ({
    root: {
      '& > *': {
        marginBottom: theme.spacing(4),
      },
    },
    signin: {
      float: 'right',
    },
    rootContainer: {
      padding: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    paper: {
      maxWidth: 400,
      width: '80%',
      paddingTop: 60,
    },
  }))
  
  export const pwdResetStyles = makeStyles(theme => ({
    formRoot: {
      '& > *': {
        marginBottom: theme.spacing(4),
      },
    },
    signin: {
      float: 'right',
    },
    rootContainer: {
      padding: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    paper: {
      maxWidth: 400,
      width: '80%',
      paddingTop: 60,
      paddingBottom: 30,
    },
  }))
  

  


  export default useStyles;