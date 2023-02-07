import React from 'react'
import { navigate } from 'gatsby'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import useStyles from '../../../utils/styles'
import { VColor } from '../../../utils/constants'

import { MainLayout } from '../../../components/Layout'
import {
  Grid,
  Paper,
  useTheme,
} from '@material-ui/core'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Utils from '../../../utils/utils'
import FilledTextInput from '../../../components/scan-card/FilledTextInput'
import { ConfirmDlg } from '../../../components/Dialog/PhotoPickerDlg'
import AlertDialog from '../../../components/Dialog/AlertDialog'
import { serverURL } from '../../../utils/RestAPI'

const API_URL = serverURL + '/api/domains';

var sel_domain = ''

export class DomainView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showLoader: false,
      domainlist: [],
      domain_name: '',
      domain_id: -1,
      isAdd: true,
      openDeleteConfirm: false,
    }

    this.alertRef = React.createRef()
  }

  loadDomainlist = () => {
     const token = localStorage.getItem('token');
     const beartoken = "Bearer " + token;
     const headers = { 
       'Authorization': beartoken
     };
     
     return new Promise(resolve => {
        setTimeout(() => {
         axios.get(API_URL, { headers })
         .then(response => {
           const domaindata = response.data.data;           
           this.setState({domainlist: domaindata})
           resolve(domaindata);
         })
         .catch((error) => {
           console.log(error);
           return null;
         }) 
       }, Math.random() * 400 + 100) // simulate network latency
     })
   }

  componentDidMount() {
    const { dispatch, userData, basicData } = this.props
    
    this.setState({isAdd: this.props.location.state.isAdd,
      domain_name: this.props.location.state.domain_name, 
      domain_id: this.props.location.state.domain_id, 
     })

    sel_domain = this.props.location.state.domain_name
    
    this.loadDomainlist()
  }

  formFields (val,placeholder) {
    sel_domain = val
  }

  onSave = () => {
    const token = localStorage.getItem('token');
    const userid = localStorage.getItem('userId');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };

    // verify values
    if(!sel_domain){
      if (this.alertRef.current) {
        this.alertRef.current.showDialog('', 'Please input the domain name', () => {
        })
      }
      return;
    }

    for (let i = 0; i < this.state.domainlist.length; i++){
        if (sel_domain.trim() === this.state.domainlist[i].domain_name && this.state.domain_id != this.state.domainlist[i].domain_id){
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', 'Same domain is exist', () => {
            })
          }
          return;
        }
    }

    const body = {
      domain_id: this.state.domain_id,
      domain_name: sel_domain.trim(),
    };

    this.setState({ showLoader: true })
    if (this.state.isAdd){
      axios
        .post(API_URL, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/admin/licenses/domains')
              })
            } else {
              navigate('/admin/licenses/domains')
            }
          } else{
            if (this.alertRef.current) {
                this.alertRef.current.showDialog('', 'New Domain is created', () => {
                    navigate('/admin/licenses/domains')
                })
            } else {
                navigate('/admin/licenses/domains')
            }
          }
        })
        .catch((error) => {
            console.log("error : ", error)
            this.setState({ 
            showLoader: false,        
            })
        })
    } else {
      axios
        .put(API_URL, body, { headers })
        .then(response => {
          this.setState({ showLoader: false, domain_name: sel_domain.trim()})
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/admin/licenses/domains')
              })
            } else {
              navigate('/admin/licenses/domains')
            }
          } else{
            if (this.alertRef.current) {
                this.alertRef.current.showDialog('', 'Domain is updated', () => {
                    navigate('/admin/licenses/domains')
                })
            } else {
                navigate('/admin/licenses/domains')
            }
          }
        })
        .catch(error => {
            console.log("error : ", error)
            this.setState({ 
            showLoader: false,        
            })
        })
    }

  }

  handleDelete = () => {
    this.setState({ openDeleteConfirm: false })
    this.onDeleteDomain()
  }

  onDeleteDomain(){
    const token = localStorage.getItem('token')
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = serverURL + '/api/deletedomain'
    const body = {
      domain_id: this.state.domain_id
    };

    this.setState({ showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/admin/licenses/domains')
              })
            }
          } else{
            this.setState({ showLoader: false})
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'This domain has deleted', () => {
                navigate('/admin/licenses/domains')
              })
            } else {
              navigate('/admin/licenses/domains')
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
              navigate('/admin/licenses/domains')
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
          </Grid>
          <Grid
            item
            md={5}
            sm={12}
            xs={12}
            className={classes.cardViewGrid}
            style={{ marginRight: 5 }}
          >
            <Paper elevation={0}>
              <div style={{backgroundColor: VColor.lightGray, padding: '0 5px'}}>
                <FilledTextInput
                    key={Utils.getKey()}
                    label={'Domain Name'}
                    type={'text'}
                    placeholder={'Domain Name'}
                    value ={this.state.domain_name}                    
                    formFields={this.formFields.bind(this)}
                />
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
              <Button
                  variant="contained"
                  size="medium"
                  color="primary"
                  style={btnStyle}
                  onClick={this.onSave}
                > {this.state.isAdd? 'Create' : 'Update'} </Button>
              { this.state.isAdd? null : 
                  <Button
                    variant="contained"
                    size="medium"
                    color="secondary"
                    style={btnStyle}
                    onClick={() => {
                      this.setState({openDeleteConfirm: true})
                    }}
                  >
                    Delete
                  </Button>
              }  

            </Paper>
          </Grid>
        </Grid>

        <ConfirmDlg
          title={'Are you sure you want to delete this domain?'}
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
    <DomainView
      {...props}
      menuIndex={5}
      dispatch={dispatch}
      isDesktop={isDesktop}
      classes={classes}
      transitionDuration={transitionDuration}
    />
  )
}
