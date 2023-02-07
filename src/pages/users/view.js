import React from 'react'

import { navigate } from 'gatsby'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import useStyles from '../../utils/styles'
import { MainLayout } from '../../components/Layout'
import {
  Grid,
  IconButton,
  Paper,
  useTheme,
} from '@material-ui/core'
import { VColor } from '../../utils/constants'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Utils from '../../utils/utils'
import FilledTextInput from '../../components/scan-card/FilledTextInput'
import { Add, Delete } from '@material-ui/icons'
import CardProgramsDlg from '../../components/Dialog/CardProgramsDlg'
import PermissionDlg from '../../components/Dialog/PermissionDlg'
import { ConfirmDlg } from '../../components/Dialog/PhotoPickerDlg'
import AlertDialog from '../../components/Dialog/AlertDialog'
import validator from 'validator'
import { serverURL } from '../../utils/RestAPI'

const API_URL = serverURL + '/api';

var formFields = [
  {
    label: 'First Name',
    placeholder: 'First Name',
    value:'Cam',
    name: 'first_name',
    type: 'text',
  },

  {
    label: 'Last Name',
    placeholder: 'Last Name',
    name: 'last_name',
    value:'Nguyen',
    type: 'text',
  },

  {
    label: 'Email',
    name: 'email',
    placeholder: 'Email Address',
    value:'cam@yahoo.com',
    type: 'email',
  },
  {
    label: 'Phone Number',
    name: 'phone',
    placeholder: 'Phone Number',
    value:'(555) 555-5555',
    type: 'phone',
  },
]

export class UserView extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      isLogin: true,
      showEditButton: true,
      cardPrograms: props.isAdd
        ? []
        : ['Program1', 'Program2', 'Program3'],
      permissions: props.isAdd
        ? []
        : ['Cards_Read', 'Cards_Order', 'Cards_Edit', 'Cards_Print'],
      openCardPrograms: false,
      openPermissionDlg: false,
      showLoader: false,
      disabledUser: false,
      userID: '',
      user_created_date: '01-01-2020',
      status:'disabled',
      role: '',
      formFields: formFields,
      userStatus:'',
      userRole:'',
      showError:{},
      cur_role:4,
      edit_role:4,
      allPrograms:[],
      openDeleteConfirm: false,
    }
    this.alertRef = React.createRef()
  }
  
  componentDidMount() {
    const { dispatch, userData, basicData } = this.props
    // console.log(this.props.location.state);
    //let programList = [];
    let permitList = [];
    let edit_role = 4
    if (this.props.location.state.id > 0){

      formFields[0].value = this.props.location.state.first_name;
      formFields[1].value = this.props.location.state.last_name;
      formFields[2].value = this.props.location.state.email;
      var permits = JSON.parse(this.props.location.state.user_permissions);
      var carProgs = JSON.parse(this.props.location.state.user_programs);

      var keyPermits = Object.keys(permits);
      var keyCPs = Object.keys(carProgs);
      console.log("programs:", keyCPs)
      
      // for (let i = 0; i < 11; i++) {
      //   let index = 'program' + (i+1).toString();
      //     if (carProgs[index]){
      //       programList.push('Program ' + (i+1).toString())
      //     }
      // }

      for (let j = 0; j < 11; j++) {
        let express = keyPermits[j];
        switch(express){
          case 'cards_read':
            if (permits[express]){
              permitList.push('Cards Read');
            }
            break;
          case 'cards_order':
            if (permits[express]){
              permitList.push('Cards Order');
            }
            break;
          case 'cards_edit':
            if (permits[express]){
              permitList.push('Cards Edit');
            }
            break;
          case 'cards_print':
            if (permits[express]){
              permitList.push('Cards Print');
            }  
            break;
          case 'cards_reject':
            if (permits[express]){
              permitList.push('Cards Reject');
            }  
            break;
          case 'nfc_write':
            if (permits[express]){
              permitList.push('NFC Write');
            }  
          break;
          case 'permission7':
            if (permits[express]){
              permitList.push('Permission 7');
            }  
          break;
          case 'permission8':
            if (permits[express]){
              permitList.push('Permission 8');
            }  
          break;
          case 'permission9':
            if (permits[express]){
              permitList.push('Permission 9');
            }  
          break;
          case 'permission10':
            if (permits[express]){
              permitList.push('Permission 10');
            }  
          break;
        }
      } 
      const user_role = this.props.location.state.user_role
      switch(user_role){
        case 'Administrator':
          edit_role = 1
          break;
        case 'Program Manager':
          edit_role = 2
          break;
        case 'User':
          edit_role = 3
          break;
      }
    }else{
      formFields[0].value = '';
      formFields[1].value = '';
      formFields[2].value = '';
    }

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

    this.setState({
      //cardPrograms: programList,
      permissions: permitList,
      userID: this.props.location.state.id.toString(),
      status: this.props.location.state.user_status,
      role: this.props.location.state.user_role,
      cur_role:curRole,
      edit_role:edit_role,
      user_created_date: this.props.location.state.created_date,
      disabledUser: this.props.location.state.user_status === 'disabled',
    })

    this.loadProgramList();
  }

  loadProgramList(){
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };

    const cur_domain = localStorage.getItem('domain');    
    const body = {
      domain: cur_domain
    }

    return new Promise(resolve => {
      const urlAPI = API_URL + '/allcardprograms'
      axios.post(urlAPI, body, { headers })
        .then(response => {
          const programs = response.data.data;
          
          var programtps = programs.map((row) => {              
            return row.program_name
          });
          console.log("programs:", programtps);
          this.setState({allPrograms: programtps})
          this.adjustPrograms()
          resolve(programs);
        })
        .catch((error) => {
          console.log(error);
          // navigate('/users/')
          return null;
        }) 
        .finally(()=>{
  //         setLoading(false)
        })
    })
  }

  adjustPrograms () {
    var carProgs = JSON.parse(this.props.location.state.user_programs);

    let programList = []
    const allProgs = this.state.allPrograms

    const entries = Object.entries(carProgs);
    const listItems = entries.map(([key, value]) => {
        for (let i = 0; i < allProgs.length; i++) {
          if (allProgs[i] === key && value === true){
            programList.push(allProgs[i])
          }
        }
    })
    this.setState({cardPrograms: programList})    
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
      email: formFields[2].value,
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
                navigate('/users')
              })
            } else {
              navigate('/users')
            }
          }
        })
        .catch((error) => {
          this.setState({ showLoader: false })
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', err_str, () => {
              navigate('/users')
            })
          }
        })      
  }

  handleDelete = () => {
    this.setState({ openDeleteConfirm: false })
    this.onDelete()
  }

  onDelete(){
    if (this.state.cur_role > 2){
      if (this.alertRef.current) {
        this.alertRef.current.showDialog('', 'No permission to delete this user', () => {    
        })
      }
      return
    }
    const token = localStorage.getItem('token')
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = API_URL + '/deleteuser/' + this.state.userID
    const body = {
      user_id: this.state.userID,
    };

    this.setState({ showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/users')
              })
            }
          } else{
            this.setState({ showLoader: false})
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'This user has deleted', () => {
                navigate('/users')
              })
            } else {
              navigate('/users')
            }
          }
        })
        .catch((error) => {
          this.setState({ showLoader: false })
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', err_str, () => {
              navigate('/users')
            })
          }
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
      status: uStatus
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
                navigate('/users')
              })
            } else {
              navigate('/users')
            }
          }
        })
        .catch((error) => {
          this.setState({ showLoader: false })
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', err_str, () => {
              navigate('/users')
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

  getProgram(title){
    let pro = ''
    switch (title){
      case 'Program 1':
        pro = 'program1';
        break;
      case 'Program 2':
        pro = 'program2';
        break;
      case 'Program 3':
        pro = 'program3';
        break;
      case 'Program 4':
        pro = 'program4';
        break;    
      case 'Program 5':
        pro = 'program5';
        break;        
      case 'Program 6':
        pro = 'program6';
        break;           
      case 'Program 7':
        pro = 'program7';
        break;
      case 'Program 8':
        pro = 'program8';
        break;
      case 'Program 9':
        pro = 'program9';
        break;    
      case 'Program 10':
        pro = 'program10';
        break;        
      case 'Program 11':
        pro = 'program11';
        break; 
      default:   
      case 'Program 12':
        pro = 'program12';
        break;
    }
    return pro;
  }

  getPermission(title){
    var perm = ""
    switch (title){
      case 'Cards Read':
        perm = 'cards_read';
        break;
      case 'Cards Order':
        perm = 'cards_order';
        break;
      case 'Cards Edit':
        perm = 'cards_edit';
        break;
      case 'Cards Print':
        perm = 'cards_print';
        break;    
      case 'Cards Reject':
        perm = 'cards_reject';
        break;        
      case 'NFC Write':
        perm = 'nfc_write';
        break;           
      case 'Permission 7':
        perm = 'permission7';
        break;
      case 'Permission 8':
        perm = 'permission8';
        break;
      case 'Permission 9':
        perm = 'permission9';
        break;    
      case 'Permission 10':
        perm = 'permission10';
        break;         
      case 'Permission 11':
        perm = 'permission11';
        break;
   }
    return perm;
  }

  onSave = () => {
    const token = localStorage.getItem('token');
    const userid = localStorage.getItem('userId');
    var urlAPI = API_URL + '/users';
    if (!this.props.isAdd){
      urlAPI = urlAPI + '/' + this.state.userID ;
    }
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };

    // Get the Json String for Programs
    var nPRLength = this.state.cardPrograms.length;
    var jsprograms = {};
    for (let i = 0; i < nPRLength; i++) {      
      var program = this.state.cardPrograms[i];
      jsprograms[program] = true
    }

    var nPerLength = this.state.permissions.length;
    var jspermissions = {};
    for (let j = 0; j < nPerLength; j++) {      
      var permission = this.getPermission(this.state.permissions[j]);
      jspermissions[permission] = true
    }
    
    const newProgramList = this.state.cardPrograms.filter(title => {
      return title 
    })

    this.setState({
      cardPrograms: newProgramList,
    })

    const newPermission = this.state.permissions.filter(title => {
      return title 
    })
    
    this.setState({
      permissions: newPermission,
    })

    // verify values
    let fields = formFields    
    let isValid = true;
    let newShowError = {};
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].value){        
        newShowError[fields[i].name] = "This field is required";
        isValid = false;
      } else if (i == 2 && !validator.isEmail(fields[i].value)){
        newShowError[fields[i].name] = "Invalid Email Address";
        isValid = false;
      } else if (i == 3 && !validator.isMobilePhone(fields[i].value)){
        newShowError[fields[i].name] = "Invalid Phone Number";
        isValid = false;
      }
    }

    if (!this.props.isAdd){
      const oldemail = this.props.location.state.email
      let old_array = oldemail.split('@')
      let old_domain = old_array[1]      
      const newemail = fields[2].value
      let new_array = newemail.split('@')
      let new_domain = new_array[1]      
      if (old_domain != new_domain){
        newShowError['email'] = 'Email domain can not be changed'
        isValid = false
      }
    } else {
      const old_domain = localStorage.getItem('domain')
      const newemail = fields[2].value
      let new_array = newemail.split('@')
      if (new_array[1]){
        let new_domain = new_array[1].split('.')
        // console.log("domain : ", old_domain)
        // console.log("domain : ", new_domain[0])
        if (old_domain != new_domain[0]){
          newShowError['email'] = 'Email domain can not be changed'
          isValid = false
        }
      } else {
        newShowError['email'] = 'Email must be input correctly.'
        isValid = false
      }
      
    }
    
    this.setState({
      showError: newShowError
    })

    if(!isValid){
      return;
    }

    if (JSON.stringify(jsprograms).length < 5){
      this.alertRef.current.showDialog('Warning!', 'Please add a program at least', () => {
        
      })
      return
    }

    if (JSON.stringify(jspermissions).length < 5){
      this.alertRef.current.showDialog('Warning!', 'Please add a permission at least', () => {
        
      })
      return
    }

    if (!this.state.userStatus && this.props.isAdd){
      this.alertRef.current.showDialog('Warning!', 'Please select the status', () => {
        
      })
      return
    }

    if (!this.state.userRole && this.props.isAdd){
      this.alertRef.current.showDialog('Warning!', 'Please select the role', () => {
        
      })
      return
    }

    const body = {
      user_id: this.state.userID,
      first_name: fields[0].value,
      last_name: fields[1].value,
      user_status: this.props.isAdd ? this.state.userStatus : this.state.status,
      user_email: fields[2].value,
      user_permissions: jspermissions,
      user_programs: jsprograms,
      user_role: this.props.isAdd ? this.state.userRole : this.state.role,
      created_user: userid,
      modified_user: userid
    }

    if (this.props.isAdd) { // create user      
      this.setState({ showLoader: true })
      axios
        .post(urlAPI, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/users')
              })
            } else {
              navigate('/users')
            }
          } else{
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'New user is created', () => {
                navigate('/users')
              })
            } else {
              navigate('/users')
            }
          }
        })
        .catch( (error) => {
          this.setState({ showLoader: false})
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          if (this.alertRef.current) {            
            this.alertRef.current.showDialog('', err_str, () => {              
            })
          } 
        })        
    } else {   // update user
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
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'User information is updated', () => {
                localStorage.setItem('user_permissions', JSON.stringify(jspermissions))
                localStorage.setItem('user_programs', JSON.stringify(jsprograms))
                navigate('/users')
              })
            } else {
              navigate('/users')
            }
          }
        })
        .catch( (error) => {
          this.setState({ showLoader: false})
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          if (this.alertRef.current) {            
            this.alertRef.current.showDialog('', err_str, () => {              
            })
          } else {
            this.setState({ 
              showError:true,
              message: err_str
             })
          }
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
            className={classes.cardViewGridLeft}>
            <Paper
              elevation={0}
              style={{
                padding: 10,
                backgroundColor: VColor.lightGray,
                borderRadius: 5,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ paddingLeft: 15 }}>
                  <Typography variant="subtitle1">Card Programs</Typography>
                </div>
                <div>
                  <IconButton
                    color="primary"
                    aria-label="add program"
                    onClick={this.handleAddProgram}
                  >
                    <Add />
                  </IconButton>
                </div>
              </div>
              {this.state.cardPrograms.map(one => {
                return (
                  <div
                    key={Utils.getKey()}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}
                  >
                    <IconButton
                      aria-label="delete"
                      onClick={() => this.removeCardPrograms(one)}
                    >
                      <Delete />
                    </IconButton>

                    <Typography variant={'body1'}>{one}</Typography>
                  </div>
                )
              })}
            </Paper>
            <Paper
              elevation={0}
              style={{
                padding: 10,
                backgroundColor: VColor.lightGray,
                borderRadius: 5,
                marginTop: 20,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ paddingLeft: 15 }}>
                  <Typography variant="subtitle1">Permissions</Typography>
                </div>
                <div>
                  <IconButton
                    color="primary"
                    aria-label="add permissions"
                    onClick={this.handleAddPermission}
                  >
                    <Add />
                  </IconButton>
                </div>
              </div>
              {this.state.permissions.map(one => {
                return (
                  <div
                    key={Utils.getKey()}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}
                  >
                    <IconButton
                      //   color="primary"
                      aria-label="add to shopping cart"
                      onClick={() => this.removePermission(one)}
                    >
                      <Delete />
                    </IconButton>

                    <Typography variant={'body1'}>{one}</Typography>
                  </div>
                )
              })}
              
            </Paper>    
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
                <InputLabel id="select-status">Status</InputLabel>
                <Select
                  labelId="select-status"
                  id="select-status"
                  value={this.state.userStatus}
                  fullWidth
                  onChange={e => {
                    this.setState({ userStatus: e.target.value })
                  }}
                >
                  <MenuItem value={'enabled'}>Enabled</MenuItem>
                  <MenuItem value={'locked'}>Locked</MenuItem>
                  <MenuItem value={'disabled'}>Disabled</MenuItem>
                </Select>
              </FormControl>
              </div>
            </Paper>
            ) : null}
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
                  { this.state.cur_role < 2 ? <MenuItem value={'Administrator'}>Administrator</MenuItem> : null}
                  { this.state.cur_role < 3 ? <MenuItem value={'Program Manager'}>Program Manager</MenuItem> : null}
                  { this.state.cur_role < 4 ? <MenuItem value={'User'}>User</MenuItem> : null}
                  <MenuItem value={'CardHolder'}>Card Holder</MenuItem>
                </Select>
              </FormControl>
              </div>
             </Paper>  
            ):null}            
            {!this.props.isAdd ? (
              <div style={{ marginTop: 20, paddingLeft: 20 }}>
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
            sm={5}
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
                    this.state.cur_role <= this.state.edit_role ? 
                      <Button
                        variant="contained"
                        size="medium"
                        color="primary"
                        style={btnStyle}
                        onClick={this.onSave}
                      > Update </Button>: null}
              </div>

              {this.props.isAdd || this.state.cur_role > this.state.edit_role ? null : (
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
              {this.props.isAdd || (this.state.cur_role >= this.state.edit_role) ? null : (
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
        <CardProgramsDlg
          data={this.state.allPrograms}
          open={this.state.openCardPrograms}
          selPrograms={this.state.cardPrograms}
          onCancel={() => {
            this.setState({ openCardPrograms: false })
          }}
          onAdd={selList => {
            this.setState({
              cardPrograms: selList,
              openCardPrograms: false,
            })
          }}
          handleClose={() => {
            this.setState({ openCardPrograms: false })
          }}
        />

        <PermissionDlg
          open={this.state.openPermissionDlg}
          selPrograms={this.state.permissions}
          onCancel={() => {
            this.setState({ openPermissionDlg: false })
          }}
          onAdd={selList => {
            this.setState({
              permissions: selList,
              openPermissionDlg: false,
            })
          }}
          handleClose={() => {
            this.setState({ openPermissionDlg: false })
          }}
        />

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
      menuIndex={4}
      isAdd={false}
      dispatch={dispatch}
      isDesktop={isDesktop}
      //   userData={userData}
      classes={classes}
      transitionDuration={transitionDuration}
    />
  )
}
