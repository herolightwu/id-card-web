import React from 'react'
import { navigate } from 'gatsby'
import axios from 'axios'
import Container from '@material-ui/core/Container'
import TextField from '@material-ui/core/TextField'
import { useDispatch, useSelector } from 'react-redux'
import useStyles from '../../utils/styles'
import { MainLayout } from '../../components/Layout'
import { Button, Grid } from '@material-ui/core'
import AlertDialog from '../../components/Dialog/AlertDialog'
import {serverURL} from '../../utils/RestAPI'

const API_URL = serverURL + '/api/password/';
class ChangePwd extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLogin: true,
      showLoader: false,
      oldpassword:'',
      newpassword:'',
      confirmpassword:'',
      message: '',
      showError:false
    }
    // this.handleChange = this.handleChange.bind(this);
    this.alertRef = React.createRef()
  }

  componentDidMount() {
    const { dispatch, userData, basicData } = this.props
  }
  handleChangeOPwd = event => {
    this.setState({oldpassword: event.target.value});
 }

 handleChangeNPwd = event => {
  this.setState({newpassword: event.target.value});
}

handleChangecfrmPwd = event => {
  this.setState({confirmpassword: event.target.value});
}

  onSave = () => {
    const token = localStorage.getItem('token');
    const userid = localStorage.getItem('userId');
    const email = localStorage.getItem('user_email');
    console.log('email ; ', email)
    const urlAPI = API_URL + userid.toString();
    const beartoken = "Bearer " + token;

    if (this.state.oldpassword.length == 0 ){
      this.setState({
        showError:true,
        message:'Please type the current password'
      });
      return
    }
    if (this.state.newpassword.length == 0 ){
      this.setState({
        showError:true,
        message:'Please type the new password'
      });
      return
    }

    const body = {
      old_password: this.state.oldpassword,
      new_password: this.state.newpassword,
      email: email,
    };
    const headers = { 
      'Authorization': beartoken
    };
    var matchPass = true;
    // Validate correct the new password and confirm password
    if (this.state.newpassword.toString() !== this.state.confirmpassword.toString()){
      this.setState({
        showError:true,
        message:'New Password and Confirm Password does not match!'
      });
      matchPass = false;
    }
    if(matchPass){
      axios.put(urlAPI, body,{ headers })
      .then(response => {
        this.setState({showLoader: false})
        if(response.data.status ==='unauthorized'){          
          if (this.alertRef) {
            this.alertRef.current.showDialog('', 'Unauthorized', () => {
                navigate('/')
              }
            )
          } else{
            this.setState({showError:true, message: "Unauthorized"})
          }
        } else{
          if (this.alertRef) {
            this.alertRef.current.showDialog('', 'Your password has been reset', () => {
                navigate('/')
              }
            )
          } else{
            this.setState({showError:true, message: response.data.message})
          }
        }
      })
      .catch((error) => {
        let err_str = error.toString()
        if (error.response){
          err_str = error.response.data.message
        }
        this.setState({showLoader: false, showError:true, message: err_str})
      })  

      this.setState({ showLoader: true })
    }
  }

  render() {
    const { userData, classes } = this.props

    return (
      <MainLayout menuIndex={4} loader={this.state.showLoader}>
        <Container maxWidth="sm"className={classes.rootContainer}>
          <Grid container spacing={3} style={{ marginTop: 20 }}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
            <div  style={{ width: '100%', textAlign: 'center', color:'red'}}>
                {this.state.showError ? this.state.message : null}
            </div>
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <TextField
                required
                id="current-pas"
                label="Current Password"
                type="password"
                variant="filled"
                fullWidth
                onChangeCapture={(e) => this.handleChangeOPwd(e)}
              />
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <TextField
                required
                id="new-pas"
                label="New Password"
                type="password"
                // defaultValue="Hello World"
                variant="filled"
                fullWidth
                onChangeCapture={(e) => this.handleChangeNPwd(e)}
              />
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <TextField
                required
                id="confirmed-pas"
                label="Confirm New Password"
                type="password"
                // defaultValue="Hello World"
                variant="filled"
                fullWidth
                onChangeCapture={(e) => this.handleChangecfrmPwd(e)}
              />
            </Grid>
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <Button
                color="primary"
                variant="contained"
                size="medium"
                style={{ float: 'right' }}
                onClick={this.onSave}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </Container>
        <AlertDialog ref={this.alertRef} okTitle={'Continue'} />
      </MainLayout>
    )
  }
}

export default function(props) {
  const dispatch = useDispatch()
  const userData = useSelector(state => state.app.userData)
  const classes = useStyles()

  return (
    <ChangePwd
      {...props}
      dispatch={dispatch}
      userData={userData}
      classes={classes}
    />
  )
}
