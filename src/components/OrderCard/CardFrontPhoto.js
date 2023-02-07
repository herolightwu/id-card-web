import React, { useState } from 'react'
import useStyles from '../../utils/styles'

import { Fade, Grid, Paper, Button } from '@material-ui/core'
import CardFront from '../../assets/images/card-front.png'
import Constants, { VColor } from '../../utils/constants'
import { useTheme } from '@material-ui/core'
import PhotoPickerDlg from '../../components/Dialog/PhotoPickerDlg'
import RestAPI, {uploadedDirUrl} from '../../utils/RestAPI'

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
    try {
      const res = await RestAPI.generalPost('api/compress_image', { file: img })
      //console.log('res:', res)
      if (res.status == 'success') {
        setWebp(res.webp)
        setUploadedPicture(img)
        setIsPicked(true)
      }
    } catch (ex) {
      console.log('Ex at upload base64: ', ex)
    }
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
