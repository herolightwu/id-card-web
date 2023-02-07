import React from 'react'

import { Link, navigate } from 'gatsby'
import axios from 'axios'
import ThemeLayout from '../components/ThemeLayout'
import Container from '@material-ui/core/Container'
import { useDispatch, useSelector } from 'react-redux'
import {forgotPwdStyles} from '../utils/styles'

import barLogo from '../assets/images/bar-logo.png'
import {
  Paper,
  Button,
  TextField,
} from '@material-ui/core'
import FormControl from '@material-ui/core/FormControl'
import Typography from '@material-ui/core/Typography'
import {serverURL} from '../utils/RestAPI'

const API_URL = serverURL;
const urlAPI = API_URL + '/api/forgotpassword';
var navLink = "/forgotpwd/"

class Forgot extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLogin: true,
      email: '',
      nav: navLink,
      massage: "Email Incorrect!",
      showError:false
    }
  }

  componentDidMount() {
    const { dispatch, userData, basicData } = this.props
  }

  onSignup = () => {}

  onSignin = () => {}

  handleChange = event => {
    this.setState({ email: event.target.value })
  }

  handleSubmit = () =>{
 //   const token = localStorage.getItem('token');
//  const tokenBearer = 'Bearer ' + token;
    axios
      .put(urlAPI, {
        email: this.state.email
      })
      .then(response => {
        navigate('/pwdreset/');
      })
      .catch(error => {
        navigate("/forgotpwd/");
        this.setState({showError:true})
      })
    }

  render() {
    const { userData, classes } = this.props

    return (
      <ThemeLayout>
        <Container maxWidth="md" className={classes.rootContainer}>
          <Paper className={classes.paper} elevation={3}>
            <div style={{ width: '100%', textAlign: 'center' }}>
              <img alt="" src={barLogo} width={250} />
            </div>
            <div  style={{ width: '100%', textAlign: 'center', color:'red'}}>
                {this.state.showError ? this.state.massage : null}
            </div>
            <div style={{ padding: '0 30px', marginTop: 40 }}>
              <Typography variant="h6" gutterBottom>
                Forgot Password
              </Typography>
              <Typography
                variant="body1"
                gutterBottom
                style={{ marginBottom: 60 }}
              >
                Enter your email address and we will send you a temporary
                password.
              </Typography>
              <form className={classes.formRoot} autoComplete="off">
                <FormControl variant="outlined" fullWidth>
                  <TextField
                    id="email"
                    label="Email"
                    variant="outlined"
                    value={this.state.email}
                    // InputLabelProps={{ shrink: this.state.pwd && this.state.pwd.length }}
                    onChange={this.handleChange}
                  />
                </FormControl>

                <div>
                  <Link to="/" replace>
                    <Button variant="contained" color="primary">
                      back
                    </Button>
                  </Link>
                  <Link to= {this.state.nav}>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.signin}
                      // type="submit"
                      onClick= {this.handleSubmit}
                    >
                      submit
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          </Paper>
          <Typography
            variant="subtitle2"
            gutterBottom
            style={{ position: 'absolute', bottom: 10, fontStyle: 'normal' }}
          >
            Powered by Veritec © 2020
          </Typography>
        </Container>
      </ThemeLayout>
    )
  }
}

export default function(props) {
  const dispatch = useDispatch()
  const userData = useSelector(state => state.app.userData)
  const classes = forgotPwdStyles()

  return (
    <Forgot
      {...props}
      dispatch={dispatch}
      userData={userData}
      classes={classes}
    />
  )
}
