import React from 'react'
import { navigate } from 'gatsby'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import useStyles from '../../../utils/styles'
import { VColor } from '../../../utils/constants'

import { MainLayout } from '../../../components/Layout'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import {
  Grid,
  Paper,
  useTheme,
} from '@material-ui/core'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Utils from '../../../utils/utils'
import FilledTextInput from '../../../components/scan-card/FilledTextInput'
import AlertDialog from '../../../components/Dialog/AlertDialog'
import { ConfirmDlg } from '../../../components/Dialog/PhotoPickerDlg'
import { serverURL } from '../../../utils/RestAPI'
import validator from 'validator'
import { reject } from 'lodash'

const API_URL = serverURL + '/api/licenses';

var formFields = [
  {
    label: 'Start Number',
    placeholder: 'Start Number',
    name: 'start_idcard',
    type: 'number',
  },
  {
    label: 'End Number',
    placeholder: 'End Number',
    name: 'end_idcard',
    type: 'number',
  }
]

export class LicenseView extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      isLogin: true,
      showEditButton: true,
      showLoader: false,
      domainlist: [],
      domain_id: 0,
      license_id: 0,
      created_date: '',
      status: 'disabled',
      formFields: formFields,
      showError: {},
      program_id: 0,
      templatelist: [],
      licenselist: [],
      program_name: '',
      openDeleteConfirm: false,
    }

    this.alertRef = React.createRef()
  }

  loadDomainlist(){
     const token = localStorage.getItem('token');
     const beartoken = "Bearer " + token;
     const headers = { 
       'Authorization': beartoken
     };
     const DOMAIN_URL = serverURL + '/api/domains'
 
     return new Promise(resolve => {
        setTimeout(() => {
         axios.get(DOMAIN_URL, { headers })
         .then(response => {
           const domaindata = response.data.data;
           let d_id = 0;
           domaindata.map((one, index) => {
            if (one.domain_name === this.props.location.state.domain_name){
              d_id = one.domain_id
            }
           })
           this.setState({domainlist: domaindata, domain_id: d_id})
           resolve(domaindata);
         })
         .catch((error) => {
           console.log(error);
           return null;
         }) 
       }, Math.random() * 500 + 100) // simulate network latency
     })
   }

  getLicenselist(sel_domain) {
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    let body = {}
    body['domain_name'] = sel_domain

    return new Promise(resolve => {
      const card_URL = serverURL + '/api/getLicense/';

      axios.post(card_URL, body, { headers })
      .then(response => {
        const prog_data = response.data.data;
        this.setState({licenselist: prog_data})
        resolve(prog_data);
      })
      .catch((error) => {
        console.log(error);
        if (this.alertRef.current) {
          this.alertRef.current.showDialog('', 'Cannot get the card licenses')
        }
        return null;
      }) 
      .finally(()=>{
      })
    })
  }  

  loadTemplatelist(sel_domain) {
    const token = localStorage.getItem('token');
     const beartoken = "Bearer " + token;
     const headers = { 
       'Authorization': beartoken
     };
     const TEMPLATE_URL = serverURL + '/api/templatelist'
     const body={ domain: sel_domain}
     console.log(sel_domain)
     return new Promise(resolve => {
        setTimeout(() => {
        axios.post(TEMPLATE_URL, body, { headers })
         .then(response => {
           const templatedata = response.data.data;
           let prog_name = ''
           for (let ind = 0; ind< templatedata.length; ind++){
            if (this.props.location.state.program_id === templatedata[ind].program_id){
              prog_name = templatedata[ind].program_name
              break
            }
           }
           this.setState({templatelist: templatedata, program_name: prog_name})
           resolve(templatedata);
         })
         .catch((error) => {
            console.log(error)
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'Please choose another domain', () => {
              })
            }
         }) 
       }, Math.random() * 400 + 100) // simulate network latency
     })
  }

  componentDidMount() {
    const { dispatch, userData, basicData } = this.props
    formFields[0].value = this.props.location.state.start_idcard + '';
    formFields[1].value = this.props.location.state.end_idcard + '';

    
    this.setState({
      license_id: this.props.location.state.license_id,
      created_date: this.props.location.state.created_date,
      status: this.props.location.state.status,
      program_id: this.props.location.state.program_id
    })

    this.loadDomainlist()
    if (this.props.location.state.domain_name){
      this.loadTemplatelist(this.props.location.state.domain_name)
      this.getLicenselist(this.props.location.state.domain_name)
    }
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
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };

    // verify values
    let fields = formFields    
    let isValid = true;
    let newShowError = {};
    let sel_domain = ''
    this.state.domainlist.map((one, index) => {
      if (one.domain_id == this.state.domain_id){
        sel_domain = one.domain_name
      }
    })

    if (!sel_domain){
      if (this.alertRef.current) {
        this.alertRef.current.showDialog('', 'Please choose a domain', () => {
        })
      }      
      return
    }

    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].value){        
        newShowError[fields[i].name] = "This field is required";
        isValid = false;
      } else if (!validator.isNumeric(fields[i].value)){        
        newShowError[fields[i].name] = "This value must be number";
        isValid = false;
      } 
    }

    this.setState({
      showError: newShowError
    })

    if(!isValid){
      return;
    }

    if (parseInt(fields[0].value) >= parseInt(fields[1].value)){
      newShowError[fields[2].name] = "The end value must be bigger than start";
      isValid = false;
    }

    this.setState({
      showError: newShowError
    })

    if(!isValid){
      return;
    }

    if (!this.state.program_id){
      if (this.alertRef.current) {
        this.alertRef.current.showDialog('', 'Please choose a template', () => {
        })
      }      
      return
    }

    if (this.state.licenselist){
      for(let i = 0 ; i < this.state.licenselist.length; i++){
        if (this.props.isAdd){
          if (this.state.licenselist[i].domain_name === sel_domain && this.state.licenselist[i].program_id === this.state.program_id){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'The license is exist already', () => {
              })
            }      
            return
          }
        } else {
          if (this.state.licenselist[i].domain_name === sel_domain && this.state.licenselist[i].program_id === this.state.program_id && this.state.program_id != this.props.location.state.program_id){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'The license is exist already', () => {
              })
            }      
            return
          } 
        }
      }
    } 

    const body = {
      license_id: this.state.license_id,
      domain_name: sel_domain,
      start_idcard: formFields[0].value,
      end_idcard: formFields[1].value,
      program_id: this.state.program_id,
      created_user: userid,
      modified_user: userid
    };

    if (this.props.isAdd){
      this.setState({ showLoader: true })
      axios
        .post(API_URL, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            this.setState({
              showError:true, 
              message: response.data.message.toString()
            })
          } else{
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'New license is created', () => {
                navigate('/admin/licenses')
              })
            } else {
              navigate('/admin/licenses')
            }
          }
        })
        .catch((error) => {
          // console.log("error : ", error)
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
      axios.put(API_URL, body, { headers })
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
              this.alertRef.current.showDialog('', 'Lincese information is updated', () => {
                navigate('/admin/licenses')
              })
            } else {
              navigate('/admin/licenses')
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

  handleDelete = () => {
    this.setState({ openDeleteConfirm: false })
    this.onDeleteLicense()
  }

  onDeleteLicense(){
    const token = localStorage.getItem('token')
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = serverURL + '/api/deletelicense'
    const body = {
      license_id: this.state.license_id,
    };

    this.setState({ showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/admin/licenses')
              })
            }
          } else{
            this.setState({ showLoader: false})
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'This license has deleted', () => {
                navigate('/admin/licenses')
              })
            } else {
              navigate('/admin/licenses')
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
              navigate('/admin/licenses')
            })
          }
        })    
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
            {!this.props.isAdd ? (
              <div style={{ marginTop: 20, paddingLeft: 20 }}>
                <div>
                  <Typography variant="body1">License ID: {this.state.license_id}</Typography>
                </div>
                <div style={{ marginTop: 5, marginBottom: 5 }}>
                  <Typography variant="body1">Created: {this.state.created_date}</Typography>
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
              {this.props.isAdd ? 
                <div style={{backgroundColor: VColor.lightGray, padding: '0 5px'}}>
                  <FormControl fullWidth>
                    <InputLabel id="label-domain-name">Domain Name</InputLabel>
                    <Select
                      labelId="label-domain-name"
                      id="date-domain-select"
                      value={this.state.domain_id}
                      fullWidth
                      onChange={e => {
                        this.setState({ domain_id: e.target.value })
                        this.state.domainlist.map((one, index) => {
                          if (one.domain_id == e.target.value){
                            this.loadTemplatelist(one.domain_name)
                            this.getLicenselist(one.domain_name)
                          }
                        })
                      }} >
                        { this.state.domainlist.length > 0 ? this.state.domainlist.map( one => {
                        return(<MenuItem value={one.domain_id} key={one.domain_id}>{one.domain_name}</MenuItem>)
                      }):null }
                    </Select>
                  </FormControl>
                </div> :
                <div style={{backgroundColor: VColor.lightGray, padding: '0 5px'}}>
                  <FilledTextInput
                            key={Utils.getKey()}
                            label={'Domain Name'}
                            type={'text'}
                            value ={this.props.location.state.domain_name}
                            placeholder={'Domain Name'}
                            disable={true}
                          />
                </div>
              }              
              <div style={{marginTop: 15}}>
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
                      formFields={this.formFields.bind(this)}
                      disable={!this.props.isAdd && one.name === 'domain_name'}
                    />
                  )
                })}
              </div>
              <div style={{backgroundColor: VColor.lightGray, padding: '0 5px'}}>
                {isAdd ?
                  <FormControl fullWidth>
                    <InputLabel id="label-card-template">Card Program</InputLabel>
                    <Select
                      labelId="label-card-template"
                      id="label-card-template"
                      value={this.state.program_id}
                      fullWidth
                      onChange={e => {
                        this.setState({ program_id: e.target.value })
                      }} >
                      { this.state.templatelist.length > 0 ? this.state.templatelist.map( one => {
                        return(<MenuItem value={one.program_id} key={one.program_id}>{one.program_name}</MenuItem>)
                      }):null }
                    </Select>
                  </FormControl> :
                  <FilledTextInput
                    key={Utils.getKey()}
                    label={'Card Program'}
                    type={'text'}
                    value ={this.state.program_name}
                    placeholder={'Card Program'}
                    disable={true}
                  />
                }                  
              </div>
              
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
                      <div>
                        <Button
                          variant="contained"
                          size="medium"
                          color="primary"
                          style={btnStyle}
                          onClick={this.onSave}> 
                           Update 
                        </Button>
                        <Button
                          variant="contained"
                          size="medium"
                          color="secondary"
                          style={btnStyle}
                          onClick={() => {
                            this.setState({openDeleteConfirm: true})
                          }}>
                          Delete
                        </Button>
                      </div>
                      }
              </div>

            </Paper>
          </Grid>
        </Grid>
        <ConfirmDlg
          title={
            <>
              <div>
                <Typography>Confirm Delete License</Typography>
              </div>
              <div>
                <Typography>
                  Are you sure you want to delete this license?
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
    <LicenseView
      {...props}
      menuIndex={5}
      isAdd={false}
      dispatch={dispatch}
      isDesktop={isDesktop}
      //   userData={userData}
      classes={classes}
      transitionDuration={transitionDuration}
    />
  )
}
