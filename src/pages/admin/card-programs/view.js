import React from 'react'
import { navigate } from 'gatsby'

import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import useStyles from '../../../utils/styles'

import { MainLayout } from '../../../components/Layout'
import { Grid, Paper, useTheme } from '@material-ui/core'

import useMediaQuery from '@material-ui/core/useMediaQuery'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import Utils from '../../../utils/utils'
import FilledTextInput from '../../../components/scan-card/FilledTextInput'
import CardProgramsLeft from '../../../components/scan-card/CardProgramsLeft'
import { ConfirmDlg } from '../../../components/Dialog/PhotoPickerDlg'
import AddFieldDlg from '../../../components/Dialog/AddFieldDlg'
import AlertDialog from '../../../components/Dialog/AlertDialog'
import cardBackImg from '../../../assets/images/back_vt.png'
import cardFrontImg from '../../../assets/images/card-front.png'
import cardLogo from '../../../assets/images/logo.png'
import { serverURL } from '../../../utils/RestAPI'

const API_URL = serverURL + '/api';

const requiredCardFields = [
  {
    label: "First Name",
    placeholder: "First Name",
    type: "text",
    extend: false,
    removable: false,
  },

  {
    label: "Last Name",
    placeholder: "Last Name",
    type: "text",
    extend: false,
    removable: false,
  },
  {
    label: "Email",
    placeholder: "Email Address",
    type: "email",
    extend: false,
    removable: false,
  },
]

export class ViewCardProgram extends React.Component {
  
  constructor(props) {
    super(props)
    const { isCreateMode } = props

    this.state = {
      isLogin: true,
      isCreateMode: isCreateMode,
      editMode: false,
      disabledProgram: false,
      cardFields: isCreateMode ? requiredCardFields : [],
      serverFields: [],
      openServerFieldsAdd: false,
      openCardFieldsAdd: false,
      created_date: '',
      showLoader: false,
      showError:'',
      front_img: cardFrontImg,
      back_img: cardBackImg,
      logo_img: cardLogo,
      program_name: '',
      matrix_size: 0,
      printed_size: "small",
      compression : '0',
      edac : 0,
      pixels_cell: 2,
      sample_width: 1,
      prefiltering: false,
      matrix_array: [],
      domainlist: [],
      domain_name: '',
      openDeleteConfirm: false,
      openDisableConfirm: false
    }
    this.alertRef = React.createRef()
    this.programname = ''
  }

  loadDomainlist(){
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    const DOMAIN_URL = serverURL + '/api/domains';
    return new Promise(resolve => {
      setTimeout(() => {
        axios.get(DOMAIN_URL, { headers })
        .then(response => {
          const domaindata = response.data.data;           
          this.setState({domainlist: domaindata})
          resolve(domaindata);
        })
        .catch((error) => {
          console.log(error);
          return null;
        }) 
      }, Math.random() * 500 + 100) // simulate network latency
    })
  }

  componentDidMount() {
    const { dispatch, userData, basicData } = this.props
    let cardFields = []
    let extFields = []
    const allfields = this.props.location.state.program_template
    for (let index = 0; index < allfields.length; index++){
      let item = allfields[index]
      if (item['extend']){
        extFields.push(item)
      } else {
        cardFields.push(item)
      }
    }
    if (cardFields.length == 0 || this.state.isCreateMode){
      cardFields = requiredCardFields
    }

    let isCreate = this.state.isCreateMode

    let mat_array = []
    for (let index = 0; index < 257; index+= 2){
      mat_array.push(index)
    }
    this.setState({
      cardFields: cardFields,
      serverFields: extFields,
      disabledProgram: !this.props.location.state.program_enabled,
      created_date: this.props.location.state.created_date,
      front_img: this.props.isCreateMode? cardFrontImg : this.props.location.state.card_image_front,
      back_img: this.props.isCreateMode? cardBackImg : this.props.location.state.card_image_back,
      logo_img: this.props.isCreateMode? cardLogo : this.props.location.state.logo,
      program_name: this.props.location.state.program_name,
      matrix_size: this.props.location.state.matrix_size,
      compression : this.props.location.state.compression,
      edac : this.props.location.state.edac,
      pixels_cell: this.props.location.state.pxpcw,
      sample_width: this.props.location.state.sampleWidth,
      matrix_array: mat_array,
      domain_name : this.props.location.state.domain,
      printed_size: this.props.location.state.printed_size,
    })
    
    this.programname = this.props.location.state.program_name     

    if (isCreate){
      this.loadDomainlist()
    }
  }

  onChangeState = status => {    
    const token = localStorage.getItem('token');
    const programid = this.props.location.state.program_id;
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = API_URL + '/programenabled/' + programid
    
    const body = {
      status: status,
      domain: this.state.domain_name
    };

    this.setState({showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ 
            showLoader: false
           })
          //  console.log(" response ;", response)
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('Error!', response.data.message.toString(), () => {
              })
            }
          } else{            
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'This program status has set as ' + status, () => {
                if (status){
                  this.setState({ showLoader: false, disabledProgram: false, editMode:false })
                } else{
                  this.setState({ showLoader: false, disabledProgram: true})
                }
              })
            } else {
              if (status){
                this.setState({ showLoader: false, disabledProgram: false, editMode:false })
              } else{
                this.setState({ showLoader: false, disabledProgram: true})
              }
            }
          }})
        .catch((error) => {
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
  }

  handleDelete = () => {
    this.setState({ openDeleteConfirm: false })
    this.onDeleteProgram()
  }

  onDeleteProgram(){
    const token = localStorage.getItem('token')
    const programid = this.props.location.state.program_id;
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = API_URL + '/deleteprogram/' + programid
    const body = {
      program_id: programid,
      domain: this.state.domain_name
    };

    this.setState({ showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/admin/card-programs/')
              })
            }
          } else{
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'This card program has deleted', () => {
                navigate('/admin/card-programs/')
              })
            } else {
              navigate('/admin/card-programs/')
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
              navigate('/admin/card-programs/')
            })
          }
        })    
  }

  onDeleteCardFields = label => {
    const newCardFields = this.state.cardFields.filter(one => {
      return one.label != label
    })
    this.setState({
      cardFields: newCardFields,
    })
  }

  onDeleteServerFields = label => {
    const newList = this.state.serverFields.filter(one => {
      return one.label != label
    })
    this.setState({
      serverFields: newList,
    })
  }

  changeName (val,placeholder) {
    if (val){
      this.programname = val 
    }
  }

  onSave = () => {
    const token = localStorage.getItem('token');
    const userid = localStorage.getItem('userId');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = API_URL + '/cardprogram'

    //validate date
    if (!this.programname){
      this.setState({ showError: 'This field is required'})
      return
    }

    if (!this.state.front_img || this.state.front_img.includes('\/static\/')){
      this.alertRef.current.showDialog('Warning!', 'Please choose the card front image', () => {
      })
      return
    }

    if (!this.state.back_img || this.state.back_img.includes('\/static\/')){
      this.alertRef.current.showDialog('Warning!', 'Please choose the card back image', () => {
      })
      return
    }

    if (!this.state.logo_img || this.state.logo_img.includes('\/static\/')){
      this.alertRef.current.showDialog('Warning!', 'Please choose the card logo image', () => {
      })
      return
    }

    if (!this.state.domain_name){
      this.alertRef.current.showDialog('Warning!', 'Please choose the domain for this card program', () => {
      })
      return
    }

    let allfields = this.state.cardFields
    if (this.state.serverFields.length > 0){
      allfields = allfields.concat(this.state.serverFields)
    }

    // console.log("allfields: ", allfields)
    let jsonbarcode = {}
    allfields.map((one, index) => {
      jsonbarcode[index] = one.label
    })
    // console.log("jsonbarcode: ", jsonbarcode)
    // return
    
    const body = {
      program_id: this.props.location.state.program_id,
      program_name: this.programname,
      program_template: allfields,
      card_image: this.state.front_img,
      back_img:this.state.back_img,
      logo: this.state.logo_img,
      compression: this.state.compression,
      edac: this.state.edac,
      matrix_size: this.state.matrix_size,
      pxpcw: this.state.pixels_cell,
      sample_width: this.state.sample_width,
      prefilter:this.state.prefiltering,
      user:userid,
      domain: this.state.domain_name,
      printed_size: this.state.printed_size,
      jsonbarcode: jsonbarcode
    }

    if (this.state.isCreateMode) {
      this.setState({ showLoader: true })
      axios.post(urlAPI, body, { headers })
          .then(response => {
            this.setState({ 
              showLoader: false
            })
            if(response.data.status ==='unauthorized'){
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                
              })
            } else{
              this.setState({ showLoader: false })
              if (this.alertRef.current) {
                this.alertRef.current.showDialog('', 'New card program has been created', () => {
                  navigate('/admin/card-programs/')
                })
              } else {
                navigate('/admin/card-programs/')
              }
            }
          })
          .catch((error) => {
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
    } else {
      // console.log('edit : ', this.state.isCreateMode)
      this.setState({ showLoader: true })
      axios.put(urlAPI, body, { headers })
          .then(response => {
            this.setState({ 
              showLoader: false
            })
            if(response.data.status ==='unauthorized'){
              this.alertRef.current.showDialog('Error!', response.data.message.toString(), () => {
              })
            } else{
              this.setState({ showLoader: false })
              if (this.alertRef.current) {
                this.alertRef.current.showDialog('', 'Card program has been updated', () => {
                  navigate('/admin/card-programs/')
                })
              } else {
                navigate('/admin/card-programs/')
              }
            }
          })
          .catch((error) => {
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
    }
  }

  render() {
    const {
      userData,
      classes,
      transitionDuration,
      isDesktop,
      isSmall,
      isCreateMode,
    } = this.props

    const buttonWidth = isDesktop ? '50%' : 120

    const btnStyle = {
      width: buttonWidth,
      float: 'right',
      marginLeft: 5,
      marginRight: 5,
      marginBottom: 20,
      minWidth: 120,
    }

    const rightGridStyle = isDesktop
      ? {
          minWidth: 150,
        }
      : {
          minWidth: '90vw',
          
        }
    return (
      <MainLayout menuIndex={this.props.menuIndex} loader={this.state.showLoader}>
        <Grid
          container
          justify="center"
          spacing={2}
          style={{ minHeight: '100%' }}
        >
          <Grid item sm={4} xs={12} className={classes.cardViewGridLeft}>
            <CardProgramsLeft
              isCreateMode = {isCreateMode}
              editMode={this.state.editMode || isCreateMode}
              disabledProgram={this.state.disabledProgram || isCreateMode}
              created_date={this.state.created_date}
              program_id={this.props.location.state.program_id}
              front_img={this.state.front_img}
              back_img={this.state.back_img}
              logo_img={this.state.logo_img}
              status={this.props.location.state.program_enabled}
              onChangeFront={(img) => {
                this.setState({front_img: img})
              }}
              onChangeLogo={(img) => {
                this.setState({logo_img: img})
              }}
              onChangeBack={(img) => {
                this.setState({back_img: img})
              }}
            />
          </Grid>
          <Grid
            item
            sm={5}
            xs={12}
            className={classes.cardViewGrid}
            style={{ marginRight: 5 }}
          >
            <Paper
              style={{ padding: '0 10px', marginBottom: 20 }}
              elevation={0}
            >
              <div>
                <Typography variant="h6" style={{ fontWeight: 'medium' }}>
                  Card Name
                </Typography>
              </div>
              <div>
                <FilledTextInput
                    key={Utils.getKey()}
                    label=''
                    type='text'
                    value ={this.programname}
                    placeholder='program_name'
                    editMode={this.state.editMode || isCreateMode} 
                    formFields={this.changeName.bind(this)}
                    showError={this.state.showError}
                    disable={!this.state.editMode && !isCreateMode}
                  />
              </div>
            </Paper>

            <Paper
              style={{ padding: '0 10px', marginBottom: 20 }}
              elevation={0}
            >
              <div>
                <Typography variant="h6" style={{ fontWeight: 'medium' }}>
                  Card Fields
                </Typography>
              </div>
              <div style={{ marginTop: 2 }}>
                <Typography variant="body1" style={{ color: 'darkgray'}}>
                  Card fields are written to the barcode and NFC on a card. It
                  is recommended that only essential fields are written to
                  cards. Additional fields can be accessed from the server.
                </Typography>
              </div>
            </Paper>
            <Paper style={{ padding: '0 10px' }} elevation={0}>
              { (this.state.editMode || isCreateMode) ? (
                <Button
                  size="medium"
                  variant={'contained'}
                  color={'primary'}
                  style={{ marginBottom: 10 }}
                  onClick={() => {
                    this.setState({
                      openCardFieldsAdd: true,
                    })
                  }}
                >
                  Add Field
                </Button>
              ) : null}
              {this.state.cardFields
                ? this.state.cardFields.map((one, index) => {
                    return (
                      <FilledTextInput
                        key={Utils.getKey()}
                        label={one.label}
                        type={one.type}
                        value ={one.value}
                        placeholder={one.placeholder}
                        removable={one.removable}
                        editMode={this.state.editMode || isCreateMode} 
                        onDelete={() => {
                          const label = one.label
                          this.onDeleteCardFields(label)
                        }}
                        display={one.side}
                      />
                    )
                  })
                : null}
            </Paper>
            <Paper
              style={{ padding: '0 10px', marginBottom: 20 }}
              elevation={0}
            >
              <div>
                <Typography variant="h6" style={{ fontWeight: 'medium' }}>
                  Server Fields
                </Typography>
              </div>
              <div style={{ marginTop: 2 }}>
                <Typography variant="body1" style={{ color: 'darkgray'}}>
                  Server fields contain additional information that is not
                  stored in the code and NFC of a card. When a card is scanned
                  the application will reach out to the server to retrieve this
                  information. It is recommended that server fields are used for
                  information that is expected to change.
                </Typography>
              </div>
            </Paper>
            <Paper style={{ padding: '0 10px' }} elevation={0}>
              {(this.state.editMode || isCreateMode) ? (
                <Button
                  size="medium"
                  variant={'contained'}
                  color={'primary'}
                  style={{ marginBottom: 10 }}
                  onClick={() => {
                    this.setState({
                      openServerFieldsAdd: true,
                    })
                  }}
                >
                  Add Field
                </Button>
              ) : null}

              {this.state.serverFields
                ? this.state.serverFields.map((one, index) => {
                    return (
                      <FilledTextInput
                        key={Utils.getKey()}
                        label={one.label}
                        type={one.type}
                        value ={one.value}
                        placeholder={one.placeholder}
                        removable={one.removable}
                        editMode={this.state.editMode || isCreateMode}
                        onDelete={() => {
                          const label = one.label
                          this.onDeleteServerFields(label)
                        }}
                      />
                    )
                  })
                : null}
            </Paper>
          </Grid>

          <Grid
            item
            md={3}
            sm={12}
            className={classes.cardViewGrid}
            style={{
              ...rightGridStyle,
              display:'flex',
              flexDirection: isDesktop ? 'column' : 'column-reverse',
            }}
          >
            <Paper
              style={{
                padding: 20,
                display: 'flex',
                width: '100%',

                flexDirection: isDesktop ? 'column' : 'row',
                justifyContent: 'center',
                alignItems: isDesktop ? 'center' : 'center',
                flexWrap: isDesktop ? 'nowrap' : 'wrap',
              }}
              elevation={0}
            >
              { (this.state.editMode || isCreateMode) ? (
                <div>
                  <Button
                    variant="contained"
                    size="medium"
                    color="primary"
                    style={btnStyle}
                    onClick={this.onSave}
                  >
                    Save
                  </Button>
                </div>
              ) : ((!this.state.editMode && this.state.disabledProgram) ? (
                <>
                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="primary"
                      style={btnStyle}
                      onClick={()=>{
                        this.setState({ openDisableConfirm: false })
                        this.onChangeState(true)}}
                    >
                      Enable
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="secondary"
                      style={btnStyle}
                      onClick={() => {
                        this.setState({ editMode: true })
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="secondary"
                      style={btnStyle}
                      onClick={() => {
                        this.setState({ openDisableConfirm: true })
                      }}
                    >
                      Disable
                    </Button>
                  </div>
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
                      Delete
                    </Button>
                  </div>
                </>
              ))}
            </Paper>

            <Paper style={{
                padding: 10,
                display: 'flex',
                width: '100%',
                flexDirection: 'row',
                alignItems: 'stretch',
                flexWrap: 'nowrap',
                justifyContent: isDesktop ? 'center' : isSmall ? 'center' : 'flex-start',
                marginLeft: isDesktop ? 0 : isSmall ? 0 : '50%',
              }}
              elevation={0}>
                <div>
                <div>
                    <Typography variant="h6" style={{ fontWeight: 'medium' }}>
                      Vericode Features :
                    </Typography>
                  </div>
                  <div style={{
                    padding: 10,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row', 
                    justifyContent: 'center',
                  }}>
                      <InputLabel id="select-printed" style={{paddingTop: 10, width:'40%'}}>Printed Size : </InputLabel>
                      <Select 
                        style={{width:'60%'}}
                        labelId="select-printed"
                        id="select-printed"
                        value={this.state.printed_size}
                        onChange={e => {
                          this.setState({printed_size : e.target.value })
                          console.log("printed_size : ", e.target.value)
                        }}
                      >
                        <MenuItem value={'small'} key={'1'}>Small</MenuItem>
                        <MenuItem value={'large'} key={'2'}>Large</MenuItem>
                      </Select>                  
                  </div>
                  <div style={{
                    padding: 10,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row', 
                    justifyContent: 'center',
                  }}>
                      <InputLabel id="select-matrix" style={{paddingTop: 10, width:'40%'}}>Matrix Size : </InputLabel>
                      <Select 
                        style={{width:'60%'}}
                        labelId="select-matrix"
                        id="select-matrix"
                        value={this.state.matrix_size}
                        onChange={e => {
                          this.setState({matrix_size : e.target.value })
                        }}
                      >
                        { this.state.matrix_array.map(one => {
                          return (<MenuItem value={one} key={one}>{one}</MenuItem>)
                        })}
                        
                      </Select>                  
                  </div>
                  <div>
                    <Typography variant="h6" style={{ fontWeight: 'medium', paddingTop: 15, paddingLeft: 10 }}>
                      Encode :
                    </Typography>
                  </div>
                  <Paper elevation={4}>
                    <div
                      style={{
                        width: '100%',
                        paddingTop: 20,
                        position: 'relative',
                        borderRadius: 7,
                      }}>
                        <div style={{
                          padding: 10,
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row', 
                          justifyContent: 'center',
                        }}>
                            <InputLabel id="select-compress" style={{paddingTop: 10, width:'40%'}}>Compression : </InputLabel>
                            <Select 
                              style={{width:'60%', minWidth: 170}}
                              labelId="select-compress"
                              id="select-compress"
                              value={this.state.compression}
                              onChange={e => {
                                this.setState({compression : e.target.value })
                              }}
                            >
                              <MenuItem value={'0'} key={'c0'}>Non Compression 8-bit</MenuItem>
                              <MenuItem value={'-1'} key={'c1'}>Alpha Numeric 6-bit</MenuItem>
                              <MenuItem value={'-2'} key={'c2'}>Number 4-bit</MenuItem>
                            </Select>                  
                        </div>

                        <div style={{
                          padding: 10,
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row', 
                          justifyContent: 'center',
                        }}>
                            <InputLabel id="select-edac" style={{paddingTop: 10, width:'40%'}}>EDAC : </InputLabel>
                            <Select 
                              style={{width:'60%'}}
                              labelId="select-edac"
                              id="select-edac"
                              value={this.state.edac}
                              onChange={e => {
                                this.setState({edac : e.target.value })
                              }}
                            >
                              <MenuItem value={0} key={'e0'}>Default</MenuItem>
                              <MenuItem value={2} key={'e2'}>12.5 %</MenuItem>
                              <MenuItem value={4} key={'e4'}>25 %</MenuItem>
                            </Select>                  
                        </div>
                        <div style={{padding:10}}></div>
                    </div>
                  </Paper>

                  <div>
                    <Typography variant="h6" style={{ fontWeight: 'medium', paddingTop: 15, paddingLeft: 10 }}>
                      Decode :
                    </Typography>
                  </div>
                  <Paper elevation={4}>
                    <div
                      style={{
                        width: '100%',
                        paddingTop: 20,
                        position: 'relative',
                        borderRadius: 7,
                      }}>
                        <div style={{
                          padding: 10,
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row', 
                          justifyContent: 'center',
                        }}>
                            <InputLabel id="select-pixel" style={{paddingTop: 10, width:'40%'}}>Pixels/Cell : </InputLabel>
                            <Select 
                              style={{width:'60%'}}
                              labelId="select-pixel"
                              id="select-pixel"
                              value={this.state.pixels_cell}
                              onChange={e => {
                                this.setState({pixels_cell : e.target.value })
                              }}
                            >
                              <MenuItem value={2} key={2}>2</MenuItem>
                              <MenuItem value={4} key={4}>4</MenuItem>
                              <MenuItem value={6} key={6}>6</MenuItem>
                              <MenuItem value={8} key={8}>8</MenuItem>
                              <MenuItem value={16} key={16}>16</MenuItem>
                            </Select>                  
                        </div>

                        <div style={{
                          padding: 10,
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row', 
                          justifyContent: 'center',
                        }}>
                            <InputLabel id="select-sample" style={{paddingTop: 10, width:'40%'}}>Sample Width : </InputLabel>
                            <Select 
                              style={{width:'60%'}}
                              labelId="select-sample"
                              id="select-sample"
                              value={this.state.sample_width}
                              onChange={e => {
                                this.setState({sample_width : e.target.value })
                              }}
                            >
                              <MenuItem value={1} key={1}>1</MenuItem>
                              <MenuItem value={2} key={2}>2</MenuItem>
                              <MenuItem value={3} key={3}>3</MenuItem>
                              <MenuItem value={4} key={4}>4</MenuItem>
                              <MenuItem value={5} key={5}>5</MenuItem>
                              <MenuItem value={6} key={6}>6</MenuItem>
                              <MenuItem value={7} key={7}>7</MenuItem>
                              <MenuItem value={8} key={8}>8</MenuItem>
                            </Select>                  
                        </div>
                        <div style={{
                          padding: 10,
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row', 
                          justifyContent: 'center',
                        }}>
                          <InputLabel id="select-filter" style={{paddingTop: 10, width:'40%'}}>Prefiltering : </InputLabel>
                          <FormControlLabel
                            value="start"
                            control={<Switch color="primary" value={this.state.prefiltering} onChange={(event, value) => { this.setState({prefiltering: value})}} />}
                            style={{width:'60%'}}
                          />
                        </div>
                        <div style={{padding:10}}></div>
                    </div>
                  </Paper>                  
                  <Paper elevation={4}>
                    <div
                      style={{
                        width: '100%',
                        marginTop: 20,
                        position: 'relative',
                        borderRadius: 7,
                      }}>
                      { isCreateMode?
                        <div style={{
                          padding: 10,
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row', 
                          justifyContent: 'center',}}>

                          <InputLabel id="select-domain" style={{paddingTop: 10, width:'40%'}}>Domain Name : </InputLabel>
                          <Select 
                            style={{width:'60%'}}
                            labelId="select-domain"
                            id="select-domain"
                            value={this.state.domain_name}
                            onChange={e => {
                              this.setState({domain_name : e.target.value })
                            }}
                          >
                            { this.state.domainlist.map(one => {
                              return (<MenuItem value={one.domain_name} key={one.domain_id}>{one.domain_name}</MenuItem>)
                            })}
                            
                          </Select>  
                        </div>:
                        <div>
                          <FilledTextInput
                            key={Utils.getKey()}
                            label={'Domain Name'}
                            type={'text'}
                            value ={this.state.domain_name}
                            placeholder={'Domain Name'}
                            disable={true}
                          />
                        </div>
                      }
                    </div>
                    
                  </Paper> 
                </div>
            </Paper>
          </Grid>
        </Grid>

        <ConfirmDlg
          title={
            <>
              <div>
                <Typography>Warning! This is probably a bad idea.</Typography>
              </div>
              <div>
                <Typography>
                  Disabling a card program will take the entire program offline.
                  Card program users will not be able to log in to mobile apps
                  or the website. You should only disable a card program during
                  a scheduled maintenance or when a program is terminated.
                </Typography>
              </div>
            </>
          }
          open={this.state.openDisableConfirm}
          okTitle="Confirm"
          cancelTitle="Cancel"
          onOk={() => {
            this.setState({ openDisableConfirm: false })
            this.onChangeState(false)}}
          onCancel={() => {
            this.setState({ openDisableConfirm: false })
          }}
        />

        <ConfirmDlg
          title={
            <>
              <div>
                <Typography>Confirm Delete Card Program</Typography>
              </div>
              <div>
                <Typography>
                  Are you sure you want to delete this card program?
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

        <AddFieldDlg
          open={this.state.openServerFieldsAdd}
          onAdd={(label, type) => {
            const newList = [
              ...this.state.serverFields,
              {
                label: label,
                placeholder: label,
                type: type,
                extend: true,
                removable: true
              },
            ]
            this.setState({ serverFields: newList, openServerFieldsAdd: false })
          }}
          onCancel={() => {
            this.setState({ openServerFieldsAdd: false })
          }}
          handleClose={() => {
            this.setState({ openServerFieldsAdd: false })
          }}
        />

        <AddFieldDlg
          open={this.state.openCardFieldsAdd}
          onAdd={(label, type, side, xpos, ypos, txtcolor, txtsize) => {
            const newList = [
              ...this.state.cardFields,
              {
                label: label,
                placeholder: label,
                type: type,
                extend: false,
                removable: true,
                side: side,
                xpos: xpos,
                ypos: ypos,
                color: txtcolor,
                size: txtsize
              },
            ]
            this.setState({ cardFields: newList, openCardFieldsAdd: false })
          }}
          onCancel={() => {
            this.setState({ openCardFieldsAdd: false })
          }}
          handleClose={() => {
            this.setState({ openCardFieldsAdd: false })
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
    <ViewCardProgram
      {...props}
      menuIndex={3}
      dispatch={dispatch}
      isDesktop={isDesktop}
      //   userData={userData}
      classes={classes}
      transitionDuration={transitionDuration}
    />
  )
}
