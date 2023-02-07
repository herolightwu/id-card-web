import React from 'react'

import axios from 'axios'
import { Link, navigate } from 'gatsby'
import ThemeLayout from '../components/ThemeLayout'
import Container from '@material-ui/core/Container'
import { useDispatch, useSelector } from 'react-redux'

import barLogo from '../assets/images/bar-logo.png'
import {
  Paper,
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
  TextField,
  InputLabel,
} from '@material-ui/core'

import FormControl from '@material-ui/core/FormControl'
import Typography from '@material-ui/core/Typography'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import { VColor } from '../utils/constants'
import { indexStyles } from '../utils/styles'
import {serverURL} from '../utils/RestAPI'


const API_URL = serverURL;
const urlAPI = API_URL + '/api/login/';
var navLink = '/'
class HomePage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLogin: true,
      email: '',
      pwd: '',
      showPwd: false,
      nav: navLink,
      massage: 'Email or Password Incorrect!',
      showError: false,
    }
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    const { dispatch, userData, basicData } = this.props
  }

  onSignup = () => {}

  onSignin = () => {}

  handleChange = event => {
    this.setState({ email: event.target.value })
  }

  handleChangePwd = () => {
    this.setState({ pwd: event.target.value })
  }

  handleClickShowPassword = () => {
    this.setState({ showPwd: !this.state.showPwd })
  }

  handleMouseDownPassword = event => {
    event.preventDefault()
  }

  handleSubmit = () => {
    axios
      .post(urlAPI, {
        email: this.state.email,
        password: this.state.pwd,
      })
      .then(response => {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('domain', response.data.domain)
        localStorage.setItem('camera_access', 'false')
        localStorage.setItem('userId', JSON.stringify(response.data.data[0].user_id))
        localStorage.setItem('user_permissions', response.data.data[0].user_permissions)
        localStorage.setItem('user_programs', response.data.data[0].user_programs)
        localStorage.setItem('user_role', response.data.data[0].user_role)
        localStorage.setItem('user_email', this.state.email)
        // console.log("user info:",response.data.data[0])
        navigate('/dashboard/')
      })
      .catch( (error) => {
        let err_str = error.toString()
        if (error.response){
          err_str = error.response.data.message
        }
        this.setState({ 
          showError:true,
          message: err_str
         })
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
            <div style={{ width: '100%', textAlign: 'center', color: 'red' }}>
              {this.state.showError ? this.state.massage : null}
            </div>
            <div style={{ padding: '0 30px', marginTop: 40 }}>
              <form className={classes.root} autoComplete="off">
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

                <FormControl variant="outlined" fullWidth>
                  <InputLabel htmlFor="outlined-adornment-password">
                    Password
                  </InputLabel>

                  <OutlinedInput
                    id="outlined-adornment-password"
                    label="Password"
                    variant="outlined"
                    type={this.state.showPwd ? 'text' : 'password'}
                    value={this.state.pwd}
                    // InputLabelProps={{ shrink: true }}
                    onChange={this.handleChangePwd}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={this.handleClickShowPassword}
                          onMouseDown={this.handleMouseDownPassword}
                          edge="end"
                        >
                          {this.state.showPwd ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
                <div>
                  <Link to={'/forgotpwd'} style={{ color: VColor.transparent }}>
                    <Button color="primary">Forgot Password?</Button>
                  </Link>
                  <Link to={this.state.nav}>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.signin}
                      type="submit"
                      onClick={this.handleSubmit}
                    >
                      sign in
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
  const classes = indexStyles()

  return (
    <HomePage
      {...props}
      dispatch={dispatch}
      userData={userData}
      classes={classes}
    />
  )
}
