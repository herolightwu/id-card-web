import React, { useState } from 'react'

import useStyles from '../../utils/styles'
import { Fade, Paper, Button } from '@material-ui/core'
import Constants, { VColor } from '../../utils/constants'
import { useTheme } from '@material-ui/core'
import PhotoPickerDlg from '../../components/Dialog/PhotoPickerDlg'
import Canvas from '../../components/OrderCard/Canvas'
import {serverURL} from '../../utils/RestAPI'


export default function CardFrontBack({ 
  editMode = false,
  card_id='0',
  matrix_size,
  program_id='1',
  program_front='',
  program_back='',
  logo='',
  first_name = '',
  middle_name = '',
  last_name = '',
  webp = '',
  photo = '',
  ordered_date = '',
  created_user={},
  barcode = '',
  printed_size = "small",
  dispfields = [],
  onChanged,
 }) {
  
  const classes = useStyles()
  const theme = useTheme()
  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  }

  const [curPhoto, setCurPhoto] = useState(photo)
  const [curWebp, setCurWebp] = useState(webp)
  const [openPicker, setOpenPicker] = useState(false)
  const [barcodeBuf, setBarcodeBuf] = useState()
  const [dispTxts, setDispTxts] = useState([])

  const changePhoto = async changed_img => {
    setOpenPicker(false)
    const urlAPI = serverURL + '/api/compress_image' 
    const token = localStorage.getItem('token')
    const beartoken = 'Bearer ' + token
    const headers = {
      Authorization: beartoken,
    }
    let body = {}
    body['file'] = changed_img
    axios
      .post(urlAPI, body, { headers })
      .then(response => {
        if (response.data.status === 'success' && response.data.webp.length > 0) { 
          setCurWebp(response.data.webp)
          setCurPhoto(changed_img)
          if (onChanged){
            onChanged(response.data.webp, changed_img)
          }
        } else { 
          console.log('There is no encoded data')
        }
      })
      .catch((error) => {
        let err_str = error.toString()
        if (error.response){
          err_str = error.response.data.message
        }
        console.log('Ex at upload base64: ', err_str)
      })
  }

  const showVericode = async enc_data => {
    let barcode_size = matrix_size;
    let size_per_width = barcode_size * Constants.barCode.preview_size_per_pixel
    let buf_size = size_per_width * size_per_width * Constants.barCode.color_size
    let buf = new ArrayBuffer(buf_size);
    let buf_data = new Uint8Array(buf)
    let offset = 0
    let index = 0 
    for (let i=0; i < size_per_width; i++) {
      offset = i * size_per_width * Constants.barCode.color_size
      for (let j = 0; j < size_per_width * Constants.barCode.color_size; j+=Constants.barCode.color_size){
        let x = j / (Constants.barCode.preview_size_per_pixel * Constants.barCode.color_size)
        index = parseInt(x) + parseInt(i/Constants.barCode.preview_size_per_pixel) * barcode_size
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
    
    setBarcodeBuf(buf_data)
  }

  React.useEffect(()=>{
    let bName = false
    for (let k = 0 ; k < dispfields.length; k++){
      if (dispfields[k].label.trim().toLowerCase() == 'name'){
        dispfields[k].value = first_name + ' ' + (middle_name ? middle_name + ' ':'') + last_name
        bName = true
      }
    }
    if (!bName){
      const newList = [
        ...dispfields,
        {
          label: 'Name',
          placeholder: 'Name',
          type: 'text',
          value: first_name + ' ' + (middle_name ? middle_name + ' ':'') + last_name,
          extend: false,
          removable: true,
          side: Constants.displaySide.back,
          xpos: 88,
          ypos: 125,
          color: 'black',
          size: 14
        },
      ]
      setDispTxts(newList)
    } else {
      setDispTxts(dispfields)
    }
    console.log(dispTxts)
  }, [dispfields])

  React.useEffect(()=>{
    // console.log("photo:", photo)
    showVericode(barcode)
    setCurPhoto(photo)
    setCurWebp(webp)
  }, [barcode, webp, photo, matrix_size])

  return (
    <Paper elevation={0}>
      <Paper elevation={4}>
        <div
          style={{
            width: '100%',
            paddingTop: Constants.cardSize.paddingTop,
            position: 'relative',
            borderRadius: 7
          }}
        >
          <img
            src={program_front}
            ref={el => {
              if (!el) {
                return
              }
              // console.log(el.getBoundingClientRect().width) // prints 200px
            }}
            style={{
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: 7,
            }}
          />          
          <div>            
            {
              dispTxts.map((item) => {
                if(item.label.trim().toLowerCase() != 'name'){
                  return(item.side == Constants.displaySide.front ? <span className={classes.dispText} style={{color: item.color, position: 'absolute', fontSize: item.size + 'px', left: item.xpos * 100/Constants.cardSize.width + 2 + '%', top: item.ypos * 100/Constants.cardSize.height + '%'}}>{item.label=='Member ID'||item.label=='Card ID' ?  "ID: " + item.value : item.label + " : " + item.value}</span> : null)
                } else{
                  return(item.side == Constants.displaySide.front ? <span className={classes.dispText} style={{color: item.color, position: 'absolute', fontSize: item.size + 'px', left: item.xpos * 100/Constants.cardSize.width + 2 + '%', top: item.ypos * 100/Constants.cardSize.height + '%'}}>{item.value}</span> : null)
                }
              })
            }
          </div>
        </div>
      </Paper>      
      <Paper
        style={{
          width: '100%',
          paddingTop: Constants.cardSize.paddingTop,
          position: 'relative',
          marginTop: 30,
        }}
        elevation={4}
      >
        <div>
          <img
            src={program_back}
            ref={el => {
              if (!el) {
                return
              }
              // console.log(el.getBoundingClientRect().width) // prints 200px
            }}
            style={{
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: 7,
            }}
          />
          <div>            
            {
              dispTxts.map((item) => {
                if(item.label.trim().toLowerCase() != 'name'){
                  return(item.side == Constants.displaySide.back ? <span className={classes.dispText} style={{color: item.color, position: 'absolute', fontSize: item.size + 'px' , left: item.xpos * 100/Constants.cardSize.width + 2 + '%', top: item.ypos * 100/Constants.cardSize.height + '%'}}>{item.label=='Member ID'||item.label=='Card ID' ?  "ID: " + item.value : item.label + " : " + item.value}</span> : null)
                } else {
                  return(item.side == Constants.displaySide.back ? <span className={classes.dispText} style={{color: item.color, position: 'absolute', fontSize: item.size + 'px', left: item.xpos * 100/Constants.cardSize.width + 2 + '%', top: item.ypos * 100/Constants.cardSize.height + '%'}}>{item.value}</span> : null)
                }
              })
            }
          </div>
        </div>        
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            margin: `${Constants.cardSize.getMargin(100)}%`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexGrow: 1,
            }}
          >
            <div
              style={{
                width:'100%',
                display: 'flex'
              }}
            >
              <img
                  src={!!curPhoto && curPhoto.length < 100 ? serverURL+'/uploads/'+ curPhoto: curPhoto }
                  style={{
                    width: `${Constants.cardSize.photoRate * 100}%`,                    
                    objectFit: 'contain',
                    aspectRatio:1,
                    paddingRight: 4,
                    marginBottom: 0,
                  }}
                />
              
            </div>
            <div
              style={{                
                position: 'absolute',
                bottom: 0,
                right: 0,
                left: -40,
              }}
            >
              <div
                style={{     
                  display: 'flex', 
                  flexDirection: 'row', 
                  justifyContent: 'end',
                  width: `${Constants.cardSize.codeRate * 100}%`,
                  objectFit: 'contain',
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  marginRight: 0,
                  marginBottom: -2,
                }}>
                <Canvas 
                    pixel_data={barcodeBuf}
                    width = {matrix_size * Constants.barCode.preview_size_per_pixel}
                    height = {matrix_size * Constants.barCode.preview_size_per_pixel} 
                    printed_size = {printed_size}
                    onBarcode = {(barcode_img) => {
                      //setBarcodeImg(barcode_img)
                    }}/>
              </div>
              
              
            </div>
          </div>
        </div>
      </Paper>

      <div style={{ marginTop: 20, position: 'relative' }}>
        <img
          src={!!curPhoto && curPhoto.length < 100 ? serverURL+'/uploads/'+ curPhoto: curPhoto }
          style={{ width: '100%', objectFit: 'contain', marginBottom: 10 }}
        />
        <Fade in={editMode}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 17,
              top: 0,
              backgroundColor: editMode
                ? VColor.opacityBlack
                : VColor.transparent,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              style={{ color: VColor.white }}
              onClick={() => {
                setOpenPicker(true)
              }}
            >
              change photo
            </Button>
          </div>
        </Fade>
      </div>
      <div className={classes.labelText}>Ordered: {ordered_date.slice(0, 10)} ({ created_user ? created_user.email : 'user@email.com' })</div>
      <div className={classes.labelText}>Printed: {ordered_date.slice(0, 10)} ({ created_user ? created_user.email : 'user@email.com' })</div>
      <div className={classes.labelText}>NFC    : {ordered_date.slice(0, 10)} ({ created_user ? created_user.email : 'user@email.com' })</div>
      <div className={classes.labelText}>BlinxPay: Yes</div>
      <PhotoPickerDlg
        open={openPicker}
        title={'Replace Photo?'}
       
        handleClose={() => {
          setOpenPicker(false)
        }}
        onResult={img=>{
          changePhoto(img)
        }}
      />
    </Paper>
  )
}
