import React from 'react'
import { navigate } from 'gatsby'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import useStyles from '../../../utils/styles'

import { MainLayout } from '../../../components/Layout'
import {
  Grid,
  Paper,
  useTheme,
} from '@material-ui/core'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { VColor } from '../../../utils/constants'
import Utils from '../../../utils/utils'
import FilledTextInput from '../../../components/scan-card/FilledTextInput'
import AlertDialog from '../../../components/Dialog/AlertDialog'
import { ConfirmDlg } from '../../../components/Dialog/PhotoPickerDlg'
import { serverURL } from '../../../utils/RestAPI'
import validator from 'validator'

const API_URL = serverURL + '/api';

var formFields = [
  {
    label: 'Email',
    name: 'email',
    placeholder: 'Email Address',
    type: 'email',
  },
  {
    label: 'First Name',
    placeholder: 'First Name',
    name: 'first_name',
    type: 'text',
  },

  {
    label: 'Last Name',
    placeholder: 'Last Name',
    name: 'last_name',
    type: 'text',
  },
]

var roleList = [
  {
    id: 1,
    name: 'Administrator',
  },
  {
    id: 2,
    name: 'Program Manager',
  },
  {
    id: 3,
    name: 'User',
  },
  {
    id: 4,
    name: 'Card Holder',
  }
]

export class UserView extends React.Component {
  constructor(props) {
    super(props)
    const permissions = localStorage.getItem('user_permissions')

    this.state = {
      isLogin: true,
      showEditButton: true,
      cardPrograms: props.isAdd
        ? ['Program1', 'Program2', 'Program3']
        : ['Program1', 'Program2', 'Program3'],
      permissions: props.isAdd
        ? permissions
        : ['Cards_Read', 'Cards_Order', 'Cards_Edit', 'Cards_Print'],
      showLoader: false,
      disabledUser: false,
      userID: '',
      userDomain: 1,
      domainlist: [],
      userRole: 1,
      cur_role: 4,
      user_created_date: '01-01-2020',
      status:'disabled',
      formFields: formFields,
      showError:{},
      openDeleteConfirm: false,
    }

    this.alertRef = React.createRef()
  }

  loadDomainList() {
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };

    return new Promise(resolve => {
       setTimeout(() => {
        let url_str = serverURL + '/api/domains'
        axios.get(url_str, { headers })
        .then(response => {
          const dnslist = response.data.data;
          var domains = dnslist.map((row) => {
              var temp = {
                domain_id : row.domain_id,
                domain_name : row.domain_name
              }
            return temp
           });

          this.setState({domainlist: domains})
          resolve(dnslist);
        })
        .catch((error) => {
          console.log(error);
          navigate('/admin/users')
          return null;
        }) 
        .finally(()=>{
 //         setLoading(false)
        })
      }, Math.random() * 500 + 100) // simulate network latency
    })
  }

  componentDidMount() {
    const { dispatch, userData, basicData } = this.props
    formFields[0].value = this.props.location.state.email;
    formFields[1].value = this.props.location.state.first_name;
    formFields[2].value = this.props.location.state.last_name;
    
    const cur_role = localStorage.getItem('user_role')
    let curRole = 4
    switch(cur_role){
      case 'Administrator':
        curRole = 1
        break;
      case 'Program Manager':
        curRole = 2
        break;
      case 'User':
        curRole = 3
        break;
    }

    this.loadDomainList();

    this.setState({
      userID: this.props.isAdd ? 0 : this.props.location.state.id.toString(),
      status: this.props.location.state.user_status,
      role: this.props.location.state.user_role,
      cur_role:curRole,
      userRole:curRole,
      user_created_date: this.props.location.state.created_date,
      disabledUser: this.props.location.state.user_status === 'disabled',
    })

  }

  handleAddProgram = () => {
    this.setState({
      openCardPrograms: true,
    })
  }

  handleAddPermission = () => {
    this.setState({
      openPermissionDlg: true,
    })
  }

  removeCardPrograms = one => {
    const newList = this.state.cardPrograms.filter(title => {
      return title != one
    })
    this.setState({
      cardPrograms: newList,
    })
  }

  removePermission = one => {
    const newList = this.state.permissions.filter(title => {
      return title != one
    })
    this.setState({
      permissions: newList,
    })
  }

  handleReset = () => {
    const token = localStorage.getItem('token');
    const userid = localStorage.getItem('userId');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = API_URL + '/forgotpassword'

    const body = {
      email: formFields[0].value,
    };

    this.setState({ showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ 
            showLoader: false
           })
          if(response.data.status ==='unauthorized'){
            this.setState({
              showError:true,
              message: response.data.message.toString()
            })
          } else{
            this.setState({ showLoader: false })
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'A password reset email has been sent to the selected user', () => {
                navigate('/admin/users')
              })
            } else {
              navigate('/admin/users')
            }
          }
        })
        .catch((error) => {
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          this.setState({ 
            showLoader: false,
            showError:true,
            message: err_str
           })
        })      
  }

  handleStatus = () => {
    const token = localStorage.getItem('token');
    const userid = localStorage.getItem('userId');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = API_URL + '/userEnabled/' + this.state.userID
    let uStatus = 'disabled'
    if (this.state.disabledUser){
      uStatus = 'enabled'
    }

    const body = {
      status: uStatus,
      domain: this.props.location.state.domain
    };

    this.setState({ showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ 
            showLoader: false
           })
          if(response.data.status ==='unauthorized'){
            this.setState({
              showError:true,
              message: response.data.message.toString()
            })
          } else{
            this.setState({ showLoader: false, disabledUser: !this.state.disabledUser })
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'This user status has set as ' + uStatus, () => {
                navigate('/admin/users')
              })
            } else {
              navigate('/admin/users')
            }
          }
        })
        .catch((error) => {
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          this.setState({ 
            showLoader: false,
            showError:true,
            message: err_str
           })
        })      
  }

  handleDelete = () => {
    this.setState({ openDeleteConfirm: false })
    this.onDelete()
  }

  onDelete(){
    const token = localStorage.getItem('token')
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = API_URL + '/admin/deleteuser/' + this.state.userID
    const body = {
      user_id: this.state.userID,
      domain: this.props.location.state.domain
    };

    this.setState({ showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/admin/users')
              })
            }
          } else{
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'This user has deleted', () => {
                navigate('/admin/users')
              })
            } else {
              navigate('/admin/users')
            }
          }
        })
        .catch((error) => {
          this.setState({ showLoader: false })
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          if (err_str.length < 5){
            err_str = "Network Error"
          }
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', err_str, () => {
              navigate('/admin/users')
            })
          }
        })    
  }

  formFields (val,placeholder) {
    for (let i = 0; i < formFields.length; i++) {
      if (formFields[i].placeholder == placeholder){
        formFields[i].value = val 
      }
    }
  }

  onSave = () => {
    const token = localStorage.getItem('token');
    const userid = localStorage.getItem('userId');
    let urlAPI = API_URL + '/users/';
    if (!this.props.isAdd){
      urlAPI = API_URL + '/admin/users/' + this.state.userID ;
    }
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };

    // verify values
    let fields = formFields    
    let isValid = true;
    let newShowError = {};
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].value || fields[i].value.length < 2){        
        newShowError[fields[i].name] = "This field is required";
        isValid = false;
      } else if (i == 0 && !validator.isEmail(fields[i].value)){
        newShowError[fields[i].name] = "Invalid Email Address";
        isValid = false;
      } 
    }

    this.setState({
      showError: newShowError
    })

    if(!isValid){
      return;
    }

    let sel_domain = ''

    if (!this.props.isAdd){
      sel_domain = this.props.location.state.domain
      const oldemail = this.props.location.state.email
      let old_array = oldemail.split('@')
      let old_domain = old_array[1]      
      const newemail = fields[0].value
      console.log("domain : ", sel_domain)
      let new_array = newemail.split('@')
      let new_domain = new_array[1]      
      if (old_domain != new_domain){
        newShowError['email'] = 'Email domain can not be changed'
        isValid = false
      }      
    } else {
      let old_domain = ''
      for (let i = 0; i < this.state.domainlist.length; i++){
        if (this.state.userDomain == this.state.domainlist[i].domain_id){
          old_domain = this.state.domainlist[i].domain_name
        }
      }
      const newemail = fields[0].value      
      let new_array = newemail.split('@')
      let new_str = new_array[1].split('.')
      let new_domain = new_str[0]
      console.log(old_domain)
      console.log(new_domain)
      if (old_domain != new_domain){
        newShowError['email'] = 'Email domain must be matched'
        isValid = false
      }
      sel_domain = old_domain
    }

    this.setState({
      showError: newShowError
    })

    if(!isValid){
      return;
    }

    let user_role = ''
    for (let i = 0; i < roleList.length; i++){
      if(this.state.userRole == roleList[i].id){
        user_role = roleList[i].name
      }
    }
    // console.log('user role : ', user_role)
    // return

    var jsprograms = {};
    jsprograms['program1'] = true
    jsprograms['program2'] = true
    jsprograms['program3'] = true
    jsprograms['program4'] = true
    jsprograms['program5'] = true
    jsprograms['program6'] = true

    var jspermissions = {};
    jspermissions['cards_read'] = true
    jspermissions['cards_order'] = true
    jspermissions['cards_edit'] = true
    jspermissions['cards_print'] = true
    jspermissions['cards_reject'] = true
    jspermissions['nfc_write'] = true

    const body = {
      user_id: this.state.userID,
      user_email: formFields[0].value,
      first_name: formFields[1].value,
      last_name: formFields[2].value,
      user_status: this.props.isAdd ? 'enabled' : this.state.status,
      user_permissions: jspermissions,
      user_programs: jsprograms,
      user_role: user_role,
      created_user: userid,
      modified_user: userid,
      domain: sel_domain,
    };
    // console.log("body : ", body)

    if (this.props.isAdd) { // create user   
      this.setState({ showLoader: true })
      axios
        .post(urlAPI, body, { headers })
        .then(response => {
          // console.log("response : ", response)
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            this.setState({
              showError:true, 
              message: response.data.message.toString()
            })
          } else{
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'New user is created', () => {
                navigate('/admin/users')
              })
            } else {
              navigate('/admin/users')
            }
          }
        })
        .catch((error) => {
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          this.setState({ 
            showLoader: false,
            showError:true,
            message: err_str
           })
        })
    } else {
      this.setState({ showLoader: true })
      axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            this.setState({
              showError:true,
              message: response.data.message.toString()
            })
          } else{
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'User information is updated', () => {
                navigate('/admin/users')
              })
            } else {
              navigate('/admin/users')
            }
          }
        })
        .catch((error) => {
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          this.setState({ 
            showLoader: false,
            showError:true,
            message: err_str
           })
        })  
    }
  }

  render() {
    const {
      userData,
      classes,
      transitionDuration,
      isDesktop,
      isAdd,
    } = this.props

    const buttonWidth = isDesktop ? '50%' : 120

    const btnStyle = {
      width: buttonWidth,
      float: 'right',
      marginLeft: 5,
      marginRight: 5,
      marginBottom: 20,
      minWidth: 180,
    }

    const rightGridStyle = isDesktop
      ? {
          minWidth: 150,
        }
      : {
          minWidth: '90vw',
        }
    return (
      <MainLayout
        menuIndex={this.props.menuIndex}
        loader={this.state.showLoader}
      >
        <Grid
          container
          justify="center"
          spacing={2}
          style={{ minHeight: '100%' }}
        >
          <Grid
            item sm={4}
            xs={12}
            className={classes.cardViewGridLeft}
          >
            {this.props.isAdd ? (   
            <Paper
              elevation={0}
              style={{
                padding: 10,
                backgroundColor: VColor.lightGray,
                borderRadius: 5,
                marginTop: 20,
              }}
            >
                <div style={{ paddingLeft: 15 }}>
                <FormControl fullWidth>
                  <InputLabel id="select-role">Role</InputLabel>
                  <Select
                    labelId="select-role"
                    id="select-role"
                    value={this.state.userRole}
                    fullWidth
                    onChange={e => {
                      this.setState({ userRole: e.target.value })
                    }}
                  >
                    { this.state.cur_role < 2 ? <MenuItem value={roleList[0].id}>{roleList[0].name}</MenuItem> : null}
                    { this.state.cur_role < 3 ? <MenuItem value={roleList[1].id}>{roleList[1].name}</MenuItem> : null}
                    { this.state.cur_role < 4 ? <MenuItem value={roleList[2].id}>{roleList[2].name}</MenuItem> : null}
                    <MenuItem value={roleList[3].id}>{roleList[3].name}</MenuItem>
                  </Select>
                </FormControl>
                </div>
             </Paper>  
            ):null}
            {this.props.isAdd ? (   
              <Paper
                elevation={0}
                style={{
                  padding: 10,
                  backgroundColor: VColor.lightGray,
                  borderRadius: 5,
                  marginTop: 20,
                }}
              >
                <div style={{ paddingLeft: 15 }}>
                <FormControl fullWidth>
                  <InputLabel id="select-role">Domain</InputLabel>
                  <Select
                    labelId="select-domain"
                    id="select-domain"
                    value={this.state.userDomain}
                    fullWidth
                    onChange={e => {
                      this.setState({ userDomain: e.target.value })
                    }}
                  >
                    { this.state.domainlist.map(one => {
                      return (
                        <MenuItem value={one.domain_id}>{one.domain_name}</MenuItem> 
                      )
                    })}                  
                  </Select>
                </FormControl>
                </div>
              </Paper>  
              ):null}
            {!this.props.isAdd ? (
              <div style={{ marginTop: 20, paddingLeft: 20 }}>
                <div>
                  <Typography variant="body1">Domain: {this.props.location.state.domain}</Typography>
                </div>
                <div>
                  <Typography variant="body1">Role: {this.props.location.state.user_role}</Typography>
                </div>
                <div>
                  <Typography variant="body1">User ID: {this.state.userID}</Typography>
                </div>
                <div style={{ marginTop: 5, marginBottom: 5 }}>
                  <Typography variant="body1">Created: {this.state.user_created_date}</Typography>
                </div>
                <div>
                  <Typography variant="body1">Status: {this.state.status}</Typography>
                </div>
              </div>
            ) : null}
          </Grid>
          <Grid
            item
            md={5}
            sm={12}
            xs={12}
            className={classes.cardViewGrid}
            style={{ marginRight: 5 }}
          >
            <Paper style={{ padding: '0 10px' }} elevation={0}>
              {formFields.map((one, index) => {
                let showErr = this.state.showError[one.name];
                return (
                  <FilledTextInput
                  key={Utils.getKey()}
                  label={one.label}
                  type={one.type}
                  value ={one.value}
                  name={one.name}
                  placeholder={one.placeholder}
                  showError={showErr} 
                  formFields ={this.formFields.bind(this)}
                  />
                )
              })}
            </Paper>
          </Grid>
          <Grid
            item
            md={3}
            sm={12}
            className={classes.cardViewGrid}
            style={rightGridStyle}
          >
            <Paper
              style={{
                padding: 10,
                display: 'flex',
                width: '100%',

                flexDirection: isDesktop ? 'column' : 'row',
                justifyContent: 'center',
                alignItems: isDesktop ? 'stretch' : 'center',
                flexWrap: isDesktop ? 'nowrap' : 'wrap',
              }}
              elevation={0}
            >
              <div>
                {this.props.isAdd ? 
                      <Button
                        variant="contained"
                        size="medium"
                        color="primary"
                        style={btnStyle}
                        onClick={this.onSave}
                      > Create </Button> : 
                      <Button
                      variant="contained"
                      size="medium"
                      color="primary"
                      style={btnStyle}
                      onClick={this.onSave}
                    > Update </Button>}
              </div>

              {this.props.isAdd ? null : (
                <>
                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="primary"
                      style={btnStyle}
                      onClick={this.handleReset}
                    >
                      Reset password
                    </Button>
                  </div>

                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color={this.state.disabledUser ? 'primary' : 'secondary'}
                      style={btnStyle}
                      onClick={this.handleStatus}
                    >
                      {this.state.disabledUser ? 'Enable User' : 'Disable User'}
                    </Button>
                  </div>
                </>
              )}
              {this.props.isAdd ? null : (
                <>
                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="secondary"
                      style={btnStyle}
                      onClick={() => {
                        this.setState({openDeleteConfirm: true})
                      }}
                    >
                      Delete User
                    </Button>
                  </div>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        <ConfirmDlg
          title={
            <>
              <div>
                <Typography>Confirm Delete User</Typography>
              </div>
              <div>
                <Typography>
                  Are you sure you want to delete this user?
                </Typography>
              </div>
            </>
          }
          open={this.state.openDeleteConfirm}
          okTitle="Confirm"
          cancelTitle="Cancel"
          onOk={this.handleDelete}
          onCancel={() => {
            this.setState({ openDeleteConfirm: false })
          }}
        />

        <AlertDialog ref={this.alertRef} okTitle={'done'} />
      </MainLayout>
    )
  }
}

export default function(props) {
  const dispatch = useDispatch()
  const userData = useSelector(state => state.app.userData)
  const classes = useStyles()

  const theme = useTheme()
  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  }

  // const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const isDesktop = useMediaQuery('(min-width:1053px)')

  return (
    <UserView
      {...props}
      menuIndex={3}
      isAdd={false}
      dispatch={dispatch}
      isDesktop={isDesktop}
      //   userData={userData}
      classes={classes}
      transitionDuration={transitionDuration}
    />
  )
}
