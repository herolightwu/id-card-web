import React from 'react'

import { navigate } from 'gatsby'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import useStyles from '../../utils/styles'

import { MainLayout } from '../../components/Layout'
import {
  Backdrop,
  CircularProgress,
  Grid,
  Paper,
  useTheme,
} from '@material-ui/core'
import Constants from '../../utils/constants'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import Utils from '../../utils/utils'
import FilledTextInput from '../../components/scan-card/FilledTextInput'
import CardFrontPhoto from '../../components/OrderCard/CardFrontPhoto'
import AlertDialog from '../../components/Dialog/AlertDialog'
import { ConfirmDlg } from '../../components/Dialog/PhotoPickerDlg'
import { serverURL, cryptoURL} from '../../utils/RestAPI'
import Canvas from '../../components/OrderCard/Canvas'
import papa from 'papaparse'


const API_URL = serverURL + '/api'

// const formFields = [
//   {
//     label: 'First Name',
//     placeholder: 'First Name',
//     type: 'text',
//     name: 'first_name',
//   },
//   {
//     label: 'Middle Name',
//     placeholder: 'Middle Name',
//     type: 'text',
//     name: 'middle_name',
//   },
//   {
//     label: 'Last Name',
//     placeholder: 'Last Name',
//     type: 'text',
//     name: 'last_name',
//   },
//   {
//     label: 'Address 1',
//     placeholder: 'Address Line 1',
//     type: 'text',
//     name: 'address1',
//   },
//   {
//     label: 'Address 2',
//     placeholder: 'Address Line 2',
//     type: 'text',
//     name: 'address2',
//   },
//   {
//     label: 'City',
//     placeholder: 'City',
//     type: 'text',
//     name: 'city',
//   },
//   {
//     label: 'State',
//     placeholder: 'State',
//     type: 'text',
//     name: 'state',
//   },
//   {
//     label: 'Zip Code',
//     placeholder: 'Zip Code',
//     type: 'text',
//     name: 'zip_code',
//   },
//   {
//     label: 'Email',
//     placeholder: 'Email Address',
//     type: 'email',
//     name: 'email',
//   },
//   {
//     label: 'Phone Number',
//     placeholder: 'Phone Number',
//     type: 'phone',
//     name: 'phone',
//   },
// ]
let formFields = []

export class OrderCard extends React.Component {
  constructor (props) {
    super(props)
    formFields = this.props.selCard.program_template
    this.alertRef = React.createRef()
    this.linkRef = React.createRef()
    this.hiddenFileInput = React.createRef()

    this.state = {
      isLogin: true,
      showEditButton: true,
      openOrderConfirm: false,
      resultTitle: '',
      openResultDlg: false,
      loader: false,
      formFields: formFields,
      photoImage: '',
      webp:'', 
      uploadedPicture:'',
      showError:{},
      photoError:'',
      encodedData:'',
      vericodeData:'',
      barcode:'',
      showCodeLabel:false,
      unique_id: '',
      isBatch: false,
      bearer_token: ''
    }
    
  }

  photoImage (photoImage) {
    this.setState({ photoImage: photoImage })
  }

  formFields (val, placeholder) {
    let fields = this.state.formFields
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].placeholder == placeholder){
        fields[i].value = val 
      }
    }
  }

  componentDidMount () {
    const { dispatch, userData, basicData, selCard } = this.props
    
    formFields = selCard.program_template
    for(let ind = 0; ind < formFields.length; ind++){
      formFields[ind].name = formFields[ind].label.toString().toLowerCase().replace(/\s/g, '_')
    }
    const uid = String( Date.now().toString(32) + Math.random().toString(16)).replace(/\./g, '')
    // console.log("unique_id : ", uid)
    const isUser = localStorage.getItem('user_role') === 'User'
    const token = localStorage.getItem('token')
    const beartoken = 'Bearer ' + token
    
    this.setState({formFields: formFields, unique_id: uid, isBatch: isUser, bearer_token: beartoken})
  }

  showVericode (enc_data) {
    //demo data (18*18)
    //const enc_data = '111111111111111111111110101110010001101111010000001111100000111111100001100110000010110011100100010111100101100010100011101101111011011001100101111011000001111011110011011100010111101100111011011101111100010010000101100010111011100001110010010011100001110000101001110101101011000100001111111001001100001111111111111111111111'
    this.setState({
      loader:true
    })
    let barcode_size = this.props.selCard.matrix_size;  //114
    let size_per_width = barcode_size * Constants.barCode.size_per_pixel
    let buf_size = size_per_width * size_per_width * Constants.barCode.color_size
    let buf = new ArrayBuffer(buf_size);
    let buf_data = new Uint8Array(buf)
    let offset = 0
    let index = 0 
    for (let i=0; i < size_per_width; i++) {
      offset = i * size_per_width * Constants.barCode.color_size
      for (let j = 0; j < size_per_width * Constants.barCode.color_size; j+=Constants.barCode.color_size){
        let x = j / (Constants.barCode.size_per_pixel * Constants.barCode.color_size)
        index = parseInt(x) + parseInt(i/Constants.barCode.size_per_pixel) * barcode_size
        if (enc_data[index] === '1'){
          buf_data[offset+j] = 0      //R value
          buf_data[offset+j+1] = 0      //G value
          buf_data[offset+j+2] = 0      //B value
          buf_data[offset+j+3] = 255      //Alpha
        } else if (enc_data[index] === '0'){
          buf_data[offset+j] = 255      //R value
          buf_data[offset+j+1] = 255      //G value
          buf_data[offset+j+2] = 255     //B value
          buf_data[offset+j+3] = 255      //Alpha
        }
      }
    }
    
    // console.log("vericode data : ", buf_data)
    this.setState({
      vericodeData: buf_data,
      showCodeLabel: true,
    })
    
    // setTimeout(() => {
      this.setState({
        openOrderConfirm: true,
        loader: false
      })
    // }, 1200)
  }

  onSave = () => {
    const userid = localStorage.getItem('userId')
    const urlAPI = serverURL + '/api/encode' 
    var fields = this.state.formFields

    let isValid = true;
    let newShowError = {};
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].value && fields[i].placeholder != 'Middle Name' && fields[i].placeholder != 'Address 2'){        
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

    if (!this.state.webp || !this.state.uploadedPicture){
      this.setState({
        photoError: 'Please pick a facial photo'
      })
      return
    }

    var body = {}
    let code_fields = {}
    let server_fields = {}
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].extend){
        server_fields[fields[i].name] = fields[i].value
      } else{
        code_fields[fields[i].name] = fields[i].value
      }
    }

  let bNoImageInCode = false
    if (this.props.selCard.matrix_size < 114){
      bNoImageInCode = true
    }

    body['unique_id'] = this.state.unique_id
    body['code_fields'] = code_fields
    body['server_fields'] = server_fields
    body['compressed_image'] = bNoImageInCode? '' : this.state.webp
    body['program_id'] = this.props.selCard.program_id
    body['created_user'] = userid
    body['modified_user'] = userid
    body['available'] = true

    let req_body = {}
    req_body['message'] = body
    req_body['matrixsize'] = this.props.selCard.matrix_size
    req_body['compression'] = this.props.selCard.compression
    req_body['edac'] = this.props.selCard.edac
    
    // console.log ("body: ", req_body, JSON.stringify(body).length)
    // return
    const headers = {
      Authorization: this.state.bearer_token,
    }
    axios
      .post(urlAPI, req_body, { headers })
      .then(response => {
        this.setState({ loader: false })
        if (response.data.status === 'success' && response.data.data.length > 0) { 
          let enc_data = response.data.data.replace(/\u0002/g, '')
          // console.log ("body: ", response.data.data)
          // console.log("replace: ", enc_data)
          this.setState({
            encodedData: enc_data
          })
          this.showVericode(enc_data)
        } else {
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', 'There is no encoded data', () => {
            })
          }
        }
      })
      .catch((error) => {
        this.setState({ loader: false })  
        let err_str = error.toString()
        if (error.response){
          err_str = error.response.data.message
        }
        if (this.alertRef.current) {
          this.alertRef.current.showDialog('', err_str, () => {
          })
        }
      })
      this.setState({ loader: true })      
  }

  onConfirmOrder = () => {
    const userid = localStorage.getItem('userId')
    const urlAPI = API_URL + '/cards/'
    
    let fields = this.state.formFields
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

    body['unique_id'] = this.state.unique_id
    body['face_image'] = this.state.uploadedPicture
    body['compressed_face_image'] = this.state.webp
    body['program_id'] = this.props.selCard.program_id
    body['code_fields'] = code_fields
    body['server_fields'] = server_fields
    body['barcode'] = this.state.encodedData
    body['nfc_fields'] = ''
    body['created_user'] = userid
    body['modified_user'] = userid
    body['available'] = true

    // console.log('req body :', body)
    const headers = {
      Authorization: this.state.bearer_token,
    }
    axios
      .post(urlAPI, body, { headers })
      .then(response => {
        if (response.data.status === 'unauthorized') {
          this.setState({loader: false })
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', "Unauthorized", () => {
            })
          }
        } else {
          this.setState({
            resultTitle: 'Your card has been ordered. Continue order?',
            openResultDlg: true,
            loader: false,
            showCodeLabel:false,
            vericodeData: '',
            barcode:''
          })
          
        }
      })
      .catch((error) => {
        this.setState({ loader: false})
        let err_str = error.toString()
        if (error.response){
          err_str = error.response.data.message
        }
        if (this.alertRef.current) {
          this.alertRef.current.showDialog('', err_str, () => {
          })
        }
      })
    
    this.setState({ loader: true, openOrderConfirm: false })
  }

  onDone = () => {
    this.setState({ 
      isLogin: true,
      showEditButton: true,
      openOrderConfirm: false,
      resultTitle: '',
      openResultDlg: false,
      loader: false,
      formFields: formFields,
      photoImage: '',
      webp:'', 
      uploadedPicture:'',
      showError:{},
      photoError:'',
      encodedData:'',
      vericodeData:'',
      barcode:'',
      showCodeLabel:false,
    })
    location.reload()
  }

  onCancel = () => {
    this.onDone()
    navigate('/order-card/')
  }

  //----- batch order functions --------------
  onBatchOrder = () => {
    this.hiddenFileInput.current.click()
  }

  compressWebp(img) {
    const urlAPI = serverURL + '/api/compress_image'
    const headers = {
      Authorization: this.state.bearer_token,
    }
    let body = {}
    body['file'] = img
    return new Promise ((resolve, reject) => {
      axios
        .post(urlAPI, body, { headers })
        .then(response => {
          if (response.data.status === 'success' && response.data.webp.length > 0) { 
            resolve(response.data.webp)
          } else {            
            console.log('There is no encoded data')
            reject('There is no encoded data')
          }
        })
        .catch((error) => {
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          console.log('Ex at upload base64: ', err_str)
          reject(err_str)
        })
    })
  }

  async processBatchData (data_arr) {
    let fields = this.state.formFields
    // console.log("field: ", fields)
    if (Object.keys(data_arr[0]).length === (fields.length + 1)){
      let order_err = false
      this.setState({ loader: true})
      for (let i = 0; i < data_arr.length; i++){
        let one_item = data_arr[i]
        var body = {}
        let code_fields = {}
        let server_fields = {}
        for (let j = 0; j < fields.length; j++) {
          if (!one_item[fields[j].label]){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', "The needed field does not exist. Please check the " + (i + 1) + " row")
            }
            order_err = true
            break
          }
          if (fields[j].extend){
            server_fields[fields[j].name] = one_item[fields[j].label]
          } else{
            code_fields[fields[j].name] = one_item[fields[j].label]
          }
        }

        let bNoImageInCode = false
        if (this.props.selCard.matrix_size < 114){
          bNoImageInCode = true
        }

        if(!one_item.Photo || one_item.Photo.length < 30){
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', "There is no photo. Please check the photo field of " + (i + 1) + " row")
          }
          order_err = true
          break
        }
        
        // generate webp
        let webp_data = ''
        try {
          webp_data = await this.compressWebp(one_item.Photo)
          console.log("webp:", webp_data)
        } catch (ex) {
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', ex)
          }
          order_err = true
          break
        }

        const uid = String( Date.now().toString(32) + Math.random().toString(16)).replace(/\./g, '')
        const userid = localStorage.getItem('userId')
        
        body['unique_id'] = uid
        body['code_fields'] = code_fields
        body['server_fields'] = server_fields
        body['compressed_image'] = bNoImageInCode? '': webp_data
        body['program_id'] = this.props.selCard.program_id
        body['created_user'] = userid
        body['modified_user'] = userid
        body['available'] = true
        
        let req_body = {}
        req_body['message'] = body
        req_body['matrixsize'] = this.props.selCard.matrix_size
        req_body['compression'] = this.props.selCard.compression
        req_body['edac'] = this.props.selCard.edac
        // console.log(req_body)

        // encode data
        let enc_data = ''
        try {
          const res_enc = await this.getEncodedData(req_body)
          console.log("encode:", res_enc)
          if (res_enc){
            enc_data = res_enc
          } else {
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', "There is no encoded data for " + (i + 1) + " row.")
            }
            order_err = true
            break
          }
        } catch (ex) {
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', "Network Error for Encode")
          }
          order_err = true
          break
        }

        // order a card
        let order_body = {}
        order_body['unique_id'] = uid
        order_body['face_image'] = one_item.Photo
        order_body['compressed_face_image'] = webp_data
        order_body['program_id'] = this.props.selCard.program_id
        order_body['code_fields'] = code_fields
        order_body['server_fields'] = server_fields
        order_body['barcode'] = enc_data
        order_body['nfc_fields'] = ''
        order_body['created_user'] = userid
        order_body['modified_user'] = userid
        order_body['available'] = true

        console.log('req body :', order_body)

        try {
          const res = await this.orderCardData(order_body)
          if (res){
            continue
          } else {
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', "This card cannot be ordered. Please check the " + (i + 1) + " row")
            }
            order_err = true
            break
          }
        } catch (ex) {
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', "Unknown Error for card order")
          }
          order_err = true
          break
        }
      }
      this.setState({ loader: false})
      if (order_err === false){
        if (this.alertRef.current) {
          this.alertRef.current.showDialog('', data_arr.length + " cards has been ordered successfully.")
        }
      }
    } else {
      if (this.alertRef.current) {
        this.alertRef.current.showDialog('', "This batch file has never matched fields. Please choose the correct batch file")
      }
    }
  }

  orderCardData (reqParam) {
    return new Promise ((resolve, reject) => {
      const urlAPI = API_URL + '/cards/'
      const headers = {
        Authorization: this.state.bearer_token,
      }
      axios
        .post(urlAPI, reqParam, { headers })
        .then(response => {
          if (response.data.status === 'unauthorized') {
            console.log("Unauthorized")
            reject("Unauthorized")
          } else {
            resolve(true)
          }
        })
        .catch((error) => {
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          console.log("error: ", error)
          reject(err_str)
        })
    })
  }

  getEncodedData (reqParam) {
    return new Promise ((resolve, reject) => {
      const urlAPI = serverURL + '/api/encode' 
      const headers = {
        Authorization: this.state.bearer_token,
      }
      axios
        .post(urlAPI, reqParam, { headers })
        .then(response => {
          if (response.data.status === 'success' && response.data.data.length > 0) { 
            let enc_data = response.data.data.replace(/\u0002/g, '')
            resolve(enc_data)
          } else {
            console.log("err_res: ", response)
            reject('There is no encoded data')
          }
        })
        .catch((error) => {
          let err_str = error.toString()
          if (error.response){
            err_str = error.response.data.message
          }
          console.log("error: ", error)
          reject(err_str)
        })
    })
  }

  handleChange = event => {
    const csvfile = event.target.files[0];
    // console.log("csv file:", csvfile)
    
    papa.parse(csvfile, {
      header: true,
      skipEmptyLines: true,
      complete:  (results) => {
        this.processBatchData(results.data)
      },
    })
  }

  downloadCSVTemplate (fname) {
    const urlAPI = API_URL + '/csvdownload/' + fname
    
    const a = this.linkRef.current;
    a.download = fname;
    a.href = urlAPI;
    a.click();
    a.href = '';
  }

  onSaveTemplate = () => {
    const urlAPI = API_URL + '/batchtemplate/'
    const cur_domain = localStorage.getItem('domain');
    let fields = this.state.formFields
    let body = {}
    let column_headers = []
    let column_types = []
    for (let i = 0; i < fields.length; i++) {
      column_headers.push(fields[i].label)
      column_types.push(fields[i].type)
    }
    let data = []
    column_headers.push("Photo")
    column_types.push("base64string")
    data.push(column_headers)
    data.push(column_types)
    let pname = this.props.selCard.program_name.replace(/ /g, '_')

    body['domain'] = cur_domain
    body['program_name'] = pname
    body['data'] = data

    const headers = {
      Authorization: this.state.bearer_token,
    }
    // console.log("Header : ", header)

    axios
      .post(urlAPI, body, { headers })
      .then(response => {
        this.setState({loader: false })
        if (response.data.status === 'unauthorized') {
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', "Unauthorized", () => {
            })
          }
        } else {
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', "CSV Template file has created : " + serverURL + "/csv_templates/" + response.data.data, () => {
              this.downloadCSVTemplate(response.data.data)
            })
          }
        }
      })
      .catch((error) => {
        this.setState({ loader: false})
        let err_str = error.toString()
        if (error.response){
          err_str = error.response.data.message
        }
        if (this.alertRef.current) {
          this.alertRef.current.showDialog('', err_str, () => {
          })
        }
      })
    
    this.setState({ loader: true, openOrderConfirm: false })
  }

  render () {
    const {
      userData,
      classes,
      transitionDuration,
      isDesktop,
      selCard,
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
    // console.log("vericode data : ", this.state.vericodeData)
    return (
      <MainLayout menuIndex={0}>
    
        <Grid container justify='center' spacing={2}>
          <Grid item sm={4} xs={12} className={classes.cardViewGridLeft}>
            <CardFrontPhoto
              cardFrontImage={selCard.front}
              photoImage={this.photoImage.bind(this)}
              onUploaded={(webp, originImg) => {
                this.setState({webp, uploadedPicture: originImg})
              }}
              photoError = {this.state.photoError}
            />
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
                    value={one.value}
                    name={one.name}
                    placeholder={one.placeholder}
                    showError={showErr} 
                    formFields={this.formFields.bind(this)}
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
                // minWidth: isDesktop ? 300 :  600,
                flexDirection: isDesktop ? 'column' : 'row',
                justifyContent: 'center',
                alignItems: isDesktop ? 'stretch' : 'center',
                flexWrap: isDesktop ? 'nowrap' : 'wrap',
              }}
              elevation={0}
            >
              <div>
                <Button
                  variant='contained'
                  size='medium'
                  color='primary'
                  style={btnStyle}
                  onClick={this.onSave}
                >
                  save
                </Button>
              </div>
              { this.state.isBatch && 
                <div>
                  <Button
                    variant='contained'
                    size='medium'
                    color='primary'
                    style={btnStyle}
                    onClick={this.onBatchOrder}
                  >
                    Batch Order
                  </Button>
                  <input
                    type="file"
                    accept='.csv'
                    ref={this.hiddenFileInput}
                    onChange={this.handleChange}
                    style={{display: 'none'}} 
                  />
                </div>
              }
              { this.state.isBatch && 
                <div>
                  <Button
                    variant='contained'
                    size='medium'
                    color='secondary'
                    style={btnStyle}
                    onClick={this.onSaveTemplate}
                  >
                    Save Template
                  </Button>
                </div>
              }
              {
                this.state.showCodeLabel && <div className={classes.labelText} style={{marginTop:30, marginLeft:50}} >Vericode Image</div>
              }
              <div style={{
                      width: '100%',
                      objectFit: 'contain',
                      justifyContent: 'center',
                      marginTop: '10px',
                      display: !!this.state.vericodeData ? 'inherit' : 'none'
                    }}>
                      <Canvas 
                          pixel_data={this.state.vericodeData}
                          width = {this.props.selCard.matrix_size * Constants.barCode.size_per_pixel}
                          height = {this.props.selCard.matrix_size * Constants.barCode.size_per_pixel} 
                          printed_size = {this.props.selCard.printed_size}
                          onBarcode = {(barcode) => {
                            this.setState({barcode})
                      }}/>
                  
              </div>
            </Paper>
          </Grid>
        </Grid>   

        <ConfirmDlg
          title='You are about to order a card, Are you sure you want to do this?'
          open={this.state.openOrderConfirm}
          okTitle='Order'
          onOk={this.onConfirmOrder}
          onCancel={() => {
            this.setState({ openOrderConfirm: false })
          }}
        />
        <ConfirmDlg
          title={this.state.resultTitle}
          open={this.state.openResultDlg}
          okTitle='DONE'
          cancel=''
          onOk={this.onDone}
          onCancel={this.onCancel}
        />
        <AlertDialog ref={this.alertRef} okTitle={'done'} />
        <a ref={this.linkRef}/>
        <Backdrop className={classes.backdrop} open={this.state.loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
        
      </MainLayout>
    )
  }
}

export default function (props) {
  const dispatch = useDispatch()
  const userData = useSelector(state => state.app.userData)
  const classes = useStyles()

  const selCard = useSelector(state => state.app.selCard)
  const theme = useTheme()

  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  }

  // const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const isDesktop = useMediaQuery('(min-width:1053px)')

  return (
    <OrderCard
      {...props}
      selCard={selCard}
      menuIndex={0}
      dispatch={dispatch}
      isDesktop={isDesktop}
      //   userData={userData}
      classes={classes}
      transitionDuration={transitionDuration}
    />
  )
}
