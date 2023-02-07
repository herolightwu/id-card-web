import React, { useState } from 'react'
import useStyles from '../../utils/styles'
import axios from 'axios'

import { Fade, Grid, Paper, Button } from '@material-ui/core'
import CardFront from '../../assets/images/card-front.png'
import Constants, { VColor } from '../../utils/constants'
import { useTheme } from '@material-ui/core'
import PhotoPickerDlg from '../../components/Dialog/PhotoPickerDlg'
import {serverURL, cryptoURL} from '../../utils/RestAPI'

export default function CardFrontPhoto ({
  editMode = true,
  cardFrontImage,
  photoImage,
  onUploaded,
  photoError
}) {
  const classes = useStyles()
  const theme = useTheme()
  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  }
  const [curImg, setCurImg] = React.useState()
  const [openPicker, setOpenPicker] = React.useState(false)
  const [webp, setWebp] = useState(undefined)
  const [uploadedPicture, setUploadedPicture] = useState(undefined)
  const [isPicked, setIsPicked] = useState(false)

  React.useEffect(()=>{
    if (webp && uploadedPicture) {
      if(onUploaded){
        onUploaded(webp, uploadedPicture)
      }      
    }
  }, [webp, uploadedPicture])


  const loadData = data => {
    photoImage(data)
  }

  const onPhotoPickDLGResult = async img => {
    setCurImg(img)
    loadData(img)
    setOpenPicker(false)
    const urlAPI = serverURL + '/api/compress_image' 
    const token = localStorage.getItem('token')
    const beartoken = 'Bearer ' + token
    const headers = {
      Authorization: beartoken,
    }
    let body = {}
    body['file'] = img
    axios
      .post(urlAPI, body, { headers })
      .then(response => {
        if (response.data.status === 'success' && response.data.webp.length > 0) { 
          setWebp(response.data.webp)
          setUploadedPicture(img)
          setIsPicked(true)
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

//`${uploadedDirUrl}${webp}`
  return (
    <Paper elevation={0}>
      <Paper elevation={4}>
        <div
          style={{
            width: '100%',
            paddingTop: Constants.cardSize.paddingTop,
            position: 'relative',
            borderRadius: 7,
          }}
        >
          <img
            src={cardFrontImage ? cardFrontImage : CardFront}
            ref={el => {
              if (!el) {
                // console.log('el is null')
                return
              }
            }}
            style={{
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: 7,
            }}
          />
        </div>
      </Paper>

      { (photoError && !isPicked) && <div className={classes.errorText} style={{marginTop:20}}>{photoError}</div>}

      <Paper
        style={{
          marginTop: 20,
          position: 'relative',
          borderRadius: 7,
          height: 300,
        }}
        elevation={4}
      >

        <div>
          <img
            src={curImg}
            style={{
              width: '100%',
              height: 300,
              objectFit: 'cover',
              marginBottom: 0,
              borderRadius: 7,
              display: curImg ? 'block' : 'none',
            }}
          />
          {
            webp && <div className={classes.labelText} style={{marginTop:10, marginLeft:10}} >Compressed Image</div>
          }
          
          <img
            src={'data:image/webp;base64,' + webp}
            style={{
              width: '60%',
              objectFit: 'contain',
              marginTop: 10,
              borderRadius: 7,
              display: !!webp ? 'inherit' : 'none'
            }}
          />
        </div>

        <Fade in={editMode}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              top: 0,
              borderRadius: 7,
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
              Add a photo
            </Button>
          </div>
        </Fade>
      </Paper>

      <PhotoPickerDlg
        open={openPicker}
        title={'Add a photo?'}
        handleClose={() => {
          setOpenPicker(false)
        }}
        onResult={onPhotoPickDLGResult}
      />
    </Paper>
  )
}
