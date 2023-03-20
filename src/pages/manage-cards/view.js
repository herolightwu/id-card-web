import React from 'react'

import axios from 'axios'
import { navigate } from 'gatsby'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import useStyles from '../../utils/styles'
import { MainLayout } from '../../components/Layout'
import { Backdrop, CircularProgress, Grid, Paper, useTheme } from '@material-ui/core'
import CardFrontBack from '../../components/scan-card/CardFrontBack'
import Zoom from '@material-ui/core/Zoom'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Utils from '../../utils/utils'
import Constants from '../../utils/constants'
import Fab from '@material-ui/core/Fab'
import EditImg from '../../assets/images/edit.png'
import FilledTextInput from '../../components/scan-card/FilledTextInput'
import { ConfirmDlg } from '../../components/Dialog/PhotoPickerDlg'
import AlertDialog from '../../components/Dialog/AlertDialog'
import { serverURL, cryptoURL } from '../../utils/RestAPI'


const API_URL = serverURL + '/api'

const defaultFields = [
  {
    label: 'Card Program',
    placeholder: 'Card Program Name',
    type: 'text',
    name: 'program_name',
  },
  {
    label: 'Card ID',
    placeholder: 'Card ID Number',
    type: 'text',
    name: 'card_id',
  },
  {
    label: 'Card Status',
    placeholder: 'Status',
    type: 'text',
    name: 'available',
  },  
]

export class ViewManageCard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLogin: true,
      showEditButton: true,
      formFields: defaultFields,
      openOrderConfirm: false,
      openDeleteConfirm: false,
      resultTitle: '',
      openResultDlg: false,
      loader: false,
      isPhotoChanged:false,
      webp:props.location.state.compressed_face_image,
      photo:props.location.state.face_image,
      showError:{},
      barcode:'',
      created_user:{},
      card_program:{},
      license: null,
      member_id: '',
      disp_txt: [],
    }
    this.alertRef = React.createRef()
  }

  formFields (val, placeholder) {
    let fields = this.state.formFields
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].placeholder == placeholder){
        fields[i].value = val 
      }
    }    
  }

  componentDidMount() {
    const { dispatch, userData, basicData } = this.props
    let showEdit = true
    if (this.props.location.state.status === 'rejected'){
      showEdit = false
    }

    let member_id = ''
    if (this.props.location.state.code_fields){
      Object.entries(this.props.location.state.code_fields).forEach(([key, value]) => {
        if (key === 'member_id'){
          member_id = value
        }
      })
    }

    if (this.props.location.state.server_fields){
      Object.entries(this.props.location.state.server_fields).forEach(([key, value]) => {
        if (key === 'member_id'){
          member_id = value
        }
      })
    }
    
    this.setState({
      barcode:this.props.location.state.barcode,
      showEditButton: showEdit,
      member_id: member_id
    })

    this.getCreatedUser()
    this.getCardProgram()
    this.getLicense()
    // console.log("code fields:", this.props.location.state.code_fields)
  }

  getLicense() {
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    let body = {}
    const domain = localStorage.getItem('domain')
    body['domain_name'] = domain
    // console.log('domain:', domain);

    return new Promise(resolve => {
      const card_URL = serverURL + '/api/getLicense/';

      axios.post(card_URL, body, { headers })
      .then(response => {
        const prog_data = response.data.data;
        // console.log('data:', prog_data);
        this.setState({license: prog_data})
        resolve(prog_data);
      })
      .catch((error) => {
        // console.log(error);
        if (this.alertRef.current) {
          this.alertRef.current.showDialog('', 'Cannot get the card licenses')
        }
      }) 
      .finally(()=>{
      })
    })
  }

  getCardProgram() {
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };

    return new Promise(resolve => {
      const card_URL = serverURL + '/api/cardprogram/'+this.props.location.state.program_id;
      axios.get(card_URL, { headers })
      .then(response => {
        if(response.data.data.length > 0){
          const prog_data = response.data.data;
          this.setState({card_program: prog_data[0]}, ()=>{
          this.setFieldValues()
          })
          resolve(prog_data[0]);
        } else {
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', 'There is no a card program for the selected card', () => {
              navigate('/manage-cards/')            
            })
          } else {
            navigate('/manage-cards/')
          }
        }
      })
      .catch((error) => {
        if (this.alertRef.current) {
          this.alertRef.current.showDialog('', 'Cannot get a card program for the selected card', () => {
            navigate('/manage-cards/')            
          })
        } else {
          navigate('/manage-cards/')
        }
      }) 
      .finally(()=>{
      })
    })
  }

  setFieldValues() {
    let valFields = this.state.card_program.program_template
    let formfields = []
    let dispfields = []

    for(let ind = 0; ind < defaultFields.length; ind++){
      formfields.push(defaultFields[ind])
    }
    
    for(let ind = 0; ind < valFields.length; ind++){
      valFields[ind].name = valFields[ind].label.toString().toLowerCase().replace(/\s/g, '_')
      formfields.push(valFields[ind])
      if (!valFields[ind].extend && !!valFields[ind].side && valFields[ind].side != 0){
        dispfields.push(valFields[ind])
      }
    }
    
    Object.entries(this.props.location.state).forEach(([key, value]) => {
      for(let index = 0; index < formfields.length; index++){
        if (key === formfields[index].name){
          formfields[index].value = value
        }
      }
    })

    if (this.props.location.state.code_fields){
      Object.entries(this.props.location.state.code_fields).forEach(([key, value]) => {
        for(let index = 0; index < formfields.length; index++){
          if (key === formfields[index].name){
            formfields[index].value = value
          }
        }
        for(let ind = 0; ind < dispfields.length; ind++){
          if (key == dispfields[ind].name){
            dispfields[ind].value = value
          }
        }
      })
    }

    if (this.props.location.state.server_fields){
      Object.entries(this.props.location.state.server_fields).forEach(([key, value]) => {
        for(let index = 0; index < formfields.length; index++){
          if (key === formfields[index].name){
            formfields[index].value = value
          }
        }
      })
    }

    // console.log("disp fields: ", dispfields)
    this.setState({formFields: formfields, disp_txt: dispfields})
  }

  getCreatedUser(){
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };

    return new Promise(resolve => {
      const card_URL = serverURL + '/api/users/'+this.props.location.state.created_user;
      axios.get(card_URL, { headers })
      .then(response => {
        const user_data = response.data.data;
        
        this.setState({created_user: user_data[0]})
        resolve(user_data[0]);
      })
      .catch((error) => {
        if (this.alertRef.current) {
          this.alertRef.current.showDialog('', 'There is no user for the selected card', () => {
            navigate('/manage-cards/')            
          })
        } else {
          navigate('/manage-cards/')
        }
      }) 
      .finally(()=>{
      })
    })
  }

  onSave = () => {
    const token = localStorage.getItem('token')
    const userid = localStorage.getItem('userId')
    const urlAPI = cryptoURL + '/api/encode' 
    const beartoken = 'Bearer ' + token
    const headers = {
      Authorization: beartoken,
    }
    var fields = this.state.formFields

    let isValid = true
    let newShowError = {}
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].value){    //&& i != 1 && i != 4    
        newShowError[fields[i].name] = "This field is required";
        isValid = false;
      }
    }

    this.setState({
      showError: newShowError
    })

    if(!isValid){
      return;
    }

    let code_fields = {}
    let server_fields = {}
    
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].extend){
        server_fields[fields[i].name] = fields[i].value
      } else{
        code_fields[fields[i].name] = fields[i].value
      }
    }
    delete code_fields.program_name
    delete code_fields.card_id
    delete code_fields.available

    let bNoImageInCode = false
    if (this.state.card_program.matrix_size < 96){
      bNoImageInCode = true
    }

    let req_body = {}
    req_body['matrixsize'] = this.state.card_program.matrix_size
    req_body['compression'] = this.state.card_program.compression
    req_body['edac'] = this.state.card_program.edac

    // console.log ("jsonbarcode: ", this.props.selCard.jsonbarcode)
    let enc_string = '' 
    let bfind = false
    if (this.state.card_program.jsonbarcode){
      enc_string = this.props.location.state.program_id + '~' + this.props.location.state.unique_id
      for (let i = 0; i < Object.keys(this.state.card_program.jsonbarcode).length; i++){
        bfind = false
        for (let j = 0; j < fields.length; j++) {
          if (fields[j].label === this.state.card_program.jsonbarcode[i + '']){        
            enc_string = enc_string + '~' + fields[j].value
            bfind = true
            break
          }
        }
        if (!bfind){
          enc_string = enc_string + '~'
        }
      }
      const webp_str = bNoImageInCode? '' : this.state.webp       //~compress_image~available
      enc_string = enc_string + '~' + webp_str + '~' + 1
      req_body['message'] = enc_string
    } else {
      let body = {}
      body['unique_id'] = this.props.location.state.unique_id
      body['code_fields'] = code_fields
      body['server_fields'] = server_fields
      body['compressed_image'] = bNoImageInCode? '' : this.state.webp
      body['program_id'] = this.props.location.state.program_id
      body['available'] = true
      req_body['message'] = body
    }

    // console.log("body : ", body)
    
    this.setState({
      loader:true
    })
    axios
      .post(urlAPI, req_body, { headers })
      .then(response => {
        if (response.data.status === 'success' && response.data.data.length > 0) {    
          let enc_data = response.data.data.replace(/\u0002/g, '')
          this.setState({
            barcode: enc_data,
            openOrderConfirm:true,
            loader:false
          })
        } else {
          this.setState({ loader: false, showError: true, message: response.data.message.toString() })
        }
      })
      .catch((error) => {
        let err_str = error.toString()
        if (error.response){
          err_str = error.response.data.message
        }
        this.setState({ loader: false, showError: true , message:err_str})
      })
  }

  onEdit = () => {
    //check user role and permission
    const permissions = JSON.parse(localStorage.getItem('user_permissions'))
    const roles = localStorage.getItem('user_role')
    // console.log('permission : ', permissions['cards_reject'])

    let isPass = false
    if(permissions['cards_edit']){
      isPass = true   
    } else {
      if (roles == 'Administrator'){
        isPass = true
      } else if(roles == 'Program Manager'){
        isPass = true
      } else { //User, CardHolder
        isPass = false
      }
    }
    
    if (!isPass){
      if (this.alertRef.current) {
        this.alertRef.current.showDialog('', 'No permission to edit this card', () => {                    
        })
      }
    } else {
      this.setState({ showEditButton: !this.state.showEditButton })
    }
  }

  onCancel = () => {
    let fields = this.state.formFields
    let dispfields = this.state.disp_txt
    Object.entries(this.props.location.state).forEach(([key, value]) => {
      for(let index = 0; index < fields.length; index++){
        if (key == fields[index].name){
          fields[index].value = value
        }
      }
    })

    if (this.props.location.state.code_fields){
      Object.entries(this.props.location.state.code_fields).forEach(([key, value]) => {
        for(let index = 0; index < fields.length; index++){
          if (key == fields[index].name){
            fields[index].value = value
          }          
        }
        for(let ind = 0; ind < dispfields.length; ind++){
          if (key == dispfields[ind].name){
            dispfields[ind].value = value
          }
        }
      })
    }

    if (this.props.location.state.server_fields){
      Object.entries(this.props.location.state.server_fields).forEach(([key, value]) => {
        for(let index = 0; index < fields.length; index++){
          if (key == fields[index].name){
            fields[index].value = value
          }
        }
      })
    }

    let showEdit = true
    if (this.props.location.state.status === 'rejected'){
      showEdit = false
    }

    this.setState({ 
      openOrderConfirm: false, 
      showEditButton: showEdit,
      barcode:this.props.location.state.barcode,
      formFields:fields,
      webp:this.props.location.state.compressed_face_image,
      photo:this.props.location.state.face_image,
      showError:false,
      disp_txt: dispfields
    })
    
  }

  onConfirmOrder = () => {
    const token = localStorage.getItem('token')
    const userid = localStorage.getItem('userId')
    const urlAPI = API_URL + '/cards/'
    const beartoken = 'Bearer ' + token
    const headers = {
      Authorization: beartoken,
    }

    let fields = this.state.formFields
    let dispfields = this.state.disp_txt
    let body = {}
    let code_fields = {}
    let server_fields = {}
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].extend){
        server_fields[fields[i].name] = fields[i].value
      } else{
        code_fields[fields[i].name] = fields[i].value
      }
    }

    for(let ind = 0; ind < dispfields.length; ind++){
      dispfields[ind].value = code_fields[dispfields[ind].name]
    }

    body['card_id'] = code_fields.card_id
    body['card_status'] = code_fields.available

    delete code_fields.program_name
    delete code_fields.card_id
    delete code_fields.available

    body['face_image'] = this.state.photo
    body['compressed_face_image'] = this.state.webp
    body['program_id'] = this.props.location.state.program_id
    body['code_fields'] = code_fields
    body['server_fields'] = server_fields
    body['barcode'] = this.state.barcode
    body['nfc_fields'] = ''
    body['modified_user'] = userid
    body['cardstatus'] = this.props.location.state.cardstatus

    // console.log('req body :', body)
    axios
      .put(urlAPI, body, { headers })
      .then(response => {
        // console.log("response : ",response)
        if (response.data.status === 'unauthorized') {
          this.setState({ loader: false, showError: true, message: response.data.message.toString() })
        } else {
          this.setState({
            resultTitle: 'Your card has been updated. Finish update?',
            openResultDlg: true,
            loader: false,
            showCodeLabel:false,
            showEditButton: true,
            showError: false,
            disp_txt: dispfields
          })          
        }
      })
      .catch((error) => {
        let err_str = error.toString()
        if (error.response){
          err_str = error.response.data.message
        }
        this.setState({ loader: false, showError: true, message:err_str })
      })
    
    this.setState({ loader: true, openOrderConfirm: false })
  }

  handleDelete = () => {
    this.setState({ openDeleteConfirm: false })
    this.onDelete()
  }

  onDelete(){
    //check user role and permission
    const roles = localStorage.getItem('user_role')

    let isPass = false
    if (roles == 'Administrator'){
      isPass = true
    } else if(roles == 'Program Manager'){
      isPass = true
    } else { //User, CardHolder
      isPass = false
    }
    
    if (!isPass){
      if (this.alertRef.current) {
        this.alertRef.current.showDialog('', 'No permission to delete this card', () => {
        })
      }
      return
    }

    const token = localStorage.getItem('token')
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = API_URL + '/deletecard/' + this.props.location.state.card_id
    const body = {
      card_id: this.props.location.state.card_id,
    };

    this.setState({ showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/manage-cards/')
              })
            }
          } else{
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'This card has deleted', () => {
                navigate('/manage-cards/')
              })
            } else {
              navigate('/manage-cards/')
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
              navigate('/manage-cards/')
            })
          }
        })    
  }

  onReject = () => {
    //check user role and permission
    const permissions = JSON.parse(localStorage.getItem('user_permissions'))
    const roles = localStorage.getItem('user_role')

    let isPass = false
    if(permissions['cards_reject']){
      isPass = true   
    } else {
      if (roles == 'Administrator'){
        isPass = true
      } else if(roles == 'Program Manager'){
        isPass = true
      } else { //User, CardHolder
        isPass = false
      }
    }
    
    if (!isPass){
      if (this.alertRef.current) {
        this.alertRef.current.showDialog('', 'No permission to reject this card', () => {
        })
      }
      return
    }

    const token = localStorage.getItem('token')
    const userid = localStorage.getItem('userId')
    const urlAPI = API_URL + '/cards/' + this.props.location.state.id
    const beartoken = 'Bearer ' + token
    const headers = {
      Authorization: beartoken,
    }
    
    if (this.props.location.state.status != 'ordered'){
      this.alertRef.current.showDialog('Warning!', 'Ordered Card only should be rejected. Please check card status.', () => {
      })
      return
    }
    let body = {}
    body['status'] = 'rejected'
    axios
      .put(urlAPI, body, { headers })
      .then(response => {
        // console.log("response : ",response)
        if (response.data.status === 'unauthorized') {
          this.setState({ loader: false, showError: true, message: response.data.message.toString() })
        } else {
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('Success!', 'Card status updated', () => {
              navigate('/manage-cards/')
            })
          } else {
            navigate('/manage-cards/')
          }
        }
      })
      .catch((error) => {
        let err_str = error.toString()
        if (error.response){
          err_str = error.response.data.message
        }
        this.setState({ loader: false, showError: true, message:err_str })
      })
    
    this.setState({ loader: true, openOrderConfirm: false })
  }

  onPrint = () => {
    //check user role and permission
    const permissions = JSON.parse(localStorage.getItem('user_permissions'))
    const roles = localStorage.getItem('user_role')
    
    let isPass = false
    if(permissions['cards_print']){
      isPass = true   
    } else {
      if (roles == 'Administrator'){
        isPass = true
      } else if(roles == 'Program Manager'){
        isPass = true
      } else { //User, CardHolder
        isPass = false
      }
    }
    
    if (!isPass){
      if (this.alertRef.current) {
        this.alertRef.current.showDialog('', 'No permission to print this card', () => {
        })
      }
      return
    }

    let cur_license = null
    for(let i = 0; i < this.state.license.length; i++){
      if (this.state.license[i].program_id === this.props.location.state.program_id){
        cur_license = this.state.license[i]
        break;
      }
    }

    // check the license limit before print
    if (this.props.location.state.cardstatus === 'ordered'){
      if (cur_license){
        const start_num = cur_license.start_idcard
        const end_num = cur_license.end_idcard
        const card_count = cur_license.card_count
        if (end_num - start_num <= card_count){
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', 'License for template card ' + this.state.card_program.program_name + ' expired, Please contact to Veritec, Inc.')
          } 
          return
        }
      } else {
        if (this.alertRef.current) {
          this.alertRef.current.showDialog('', 'The Card Program is not License, Please contact Veritec, Inc.to resolve PDF printing')
        }
        return
      }
    }

    const token = localStorage.getItem('token')
    const userid = localStorage.getItem('userId')
    const urlAPI = API_URL + '/generate_card'
    const beartoken = 'Bearer ' + token
    const headers = {
      Authorization: beartoken,
    }

    let fields = this.state.formFields
    let body = {}
    let code_fields = {}
    let server_fields = {}
    let mem_id = ''
    
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].extend){
        server_fields[fields[i].name] = fields[i].value
      } else{
        code_fields[fields[i].name] = fields[i].value
      }
      if (fields[i].name == 'member_id'){
        mem_id = "ID: " + fields[i].value
      }
    }

    let dispfields = this.state.disp_txt
    let bName = false
    for(let ind = 0; ind < dispfields.length; ind++){
      if (dispfields[ind].label.trim().toLowerCase() == 'name'){
        dispfields[ind].value = this.props.location.state.first_name + ' ' + this.props.location.state.last_name
        bName = true
      } 
    }
    if(!bName){
      const dispName = {
        label: 'Name',
        placeholder: 'Name',
        name: 'name',
        type: 'text',
        value: this.props.location.state.first_name + ' ' + this.props.location.state.last_name,
        extend: false,
        removable: true,
        side: Constants.displaySide.back,
        xpos: 88,
        ypos: 125,
        color: 'black',
        size: 14
      }
      dispfields.push(dispName)
    }
    
    body['face_image'] = this.state.photo
    body['compressed_face_image'] = this.state.webp
    body['code_fields'] = code_fields
    body['server_fields'] = server_fields
    body['program_id'] = this.props.location.state.program_id
    body['barcode'] = this.state.barcode
    body['barcode_size'] = this.state.card_program.matrix_size
    body['modified_user'] = userid
    body['front_image'] = this.state.card_program.card_image_front
    body['back_image'] = this.state.card_program.card_image_back
    body['logo'] = this.state.card_program.logo
    body['cardstatus'] = this.props.location.state.cardstatus
    body['user_id'] = userid
    body['member_id'] = mem_id
    body['printed_size'] = this.state.card_program.printed_size
    body['disp_txt'] = dispfields
    
    if (cur_license){
      body['license_id'] = cur_license.license_id
    } else {
      body['license_id'] = 0
    }   

    axios
      .post(urlAPI, body, { headers })
      .then(response => {
        if (response.data.status === 'Unauthorized') {
          this.setState({ loader: false, showError: true, message: response.data.message.toString() })
        } else {
          this.setState({
            resultTitle: 'Virtual Card has generated. ' + serverURL + '/vcards/' + response.data.vcard,
            openResultDlg: true,
            loader: false,
            showCodeLabel:false,
            showEditButton: true,
            showError: false
          })
          
        }
      })
      .catch((error) => {
        let err_str = error.toString()
        if (error.response){
          err_str = error.response.data.message
        }
        this.setState({ loader: false, showError: true, message:err_str })
      })
    this.setState({ loader: true, openOrderConfirm: false })
  }

  render() {
    const { userData, classes, transitionDuration, isDesktop } = this.props

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
      <MainLayout menuIndex={this.props.menuIndex}>
        <Grid
          container
          justify="center"
          spacing={2}
          style={{ minHeight: '100%' }}
        >
          <Grid item sm={4} xs={12} className={classes.cardViewGridLeft}>
            <CardFrontBack editMode={!this.state.showEditButton}
                      card_id={this.state.member_id}
                      matrix_size={this.state.card_program.matrix_size? this.state.card_program.matrix_size : 114}
                      program_id={this.props.location.state.program_id}
                      program_front={this.state.card_program.card_image_front}
                      program_back={this.state.card_program.card_image_back}
                      logo={this.state.card_program.logo}
                      first_name={this.props.location.state.first_name}
                      middle_name={this.props.location.state.middle_name}
                      last_name={this.props.location.state.last_name}
                      webp={this.state.webp}
                      photo={this.state.photo} 
                      ordered_date={this.props.location.state.ordered_date} 
                      created_user={this.state.created_user}
                      barcode={this.state.barcode} 
                      printed_size={this.state.card_program.printed_size? this.state.card_program.printed_size : "small"}
                      dispfields={this.state.disp_txt} 
                      onChanged={(changedWebp, changedPhoto) => {
                            this.setState({
                              isPhotoChanged:true,
                              webp:changedWebp,
                              photo:changedPhoto,
                            })
                      }}/>
          </Grid>
          <Grid
            item
            sm={5}
            xs={12}
            className={classes.cardViewGrid}
            style={{ marginRight: 5 }}
          >
            <Paper style={{ padding: '0 10px' }} elevation={0}>
              {this.state.formFields.map((one, index) => {
                let disable = true
                let showErr = ''
                if(one.name && !this.state.showEditButton){
                  disable = false
                  showErr = this.state.showError[one.name];
                }

                if(one.name === 'program_name' || one.name === 'card_id' || one.name === 'available'){
                  disable = true
                }

                return (
                  <FilledTextInput
                    key={Utils.getKey()}
                    label={one.label}
                    type={one.type}
                    value ={one.value}
                    placeholder={one.placeholder}
                    formFields={this.formFields.bind(this)}
                    showError={showErr} 
                    disable={disable}
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
              {this.state.showEditButton ? (
                <>
                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="primary"
                      style={btnStyle}
                      onClick={()=>{
                        navigate('/manage-cards/')
                      }}
                    >
                      Next Card
                    </Button>
                  </div>

                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="primary"
                      style={btnStyle}
                      onClick={this.onPrint}
                    >
                      Print
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="primary"
                      style={btnStyle}
                    >
                      Write NFC
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="secondary"
                      style={btnStyle}
                      onClick={this.onReject}
                    >
                      Reject
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="secondary"
                      style={btnStyle}
                      onClick={() => {
                        this.setState({ openDeleteConfirm: true })
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="primary"
                      style={btnStyle}
                      onClick={this.onSave}
                      disabled={this.state.showEditButton}
                    >
                      Update
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="primary"
                      style={btnStyle}
                      onClick={this.onCancel}
                    >
                      cancel
                    </Button>
                  </div>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Zoom
          key={Utils.getKey()}
          in={this.state.showEditButton}
          timeout={transitionDuration}
          style={{
            transitionDelay: `${500}ms`,
          }}
          unmountOnExit
        >
          <Fab
            aria-label={''}
            style={{ position: 'fixed', bottom: 20, right: 30 }}
            color={'primary'}
            onClick={this.onEdit}
          >
            <img
              src={EditImg}
              style={{ width: 25, objectFit: 'contain', marginTop: 25 }}
            />
          </Fab>
        </Zoom>

        <ConfirmDlg
          title='You are about to update this card, Are you sure you want to do this?'
          open={this.state.openOrderConfirm}
          okTitle='Update'
          onOk={this.onConfirmOrder}
          onCancel={this.onCancel}
        />
        <ConfirmDlg
          title={this.state.resultTitle}
          open={this.state.openResultDlg}
          okTitle='OK'
          cancel=''
          onOk={()=>{
            this.setState({ 
              showEditButton: true,
              openResultDlg: false
            })
          }}
          onCancel={() => {
            this.setState({ 
              showEditButton: false,
              openResultDlg: false
            })
          }}
        />
        <ConfirmDlg
          title='Are you sure you want to delete this card?'
          open={this.state.openDeleteConfirm}
          okTitle="Confirm"
          cancelTitle="Cancel"
          onOk={this.handleDelete}
          onCancel={() => {
            this.setState({ openDeleteConfirm: false })
          }}
        />

        <Backdrop className={classes.backdrop} open={this.state.loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
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
    <ViewManageCard
      {...props}
      menuIndex={1}
      dispatch={dispatch}
      isDesktop={isDesktop}
      //   userData={userData}
      classes={classes}
      transitionDuration={transitionDuration}
    />
  )
}
