import React, { useState, useEffect } from 'react'
import { navigate } from 'gatsby'
import axios from 'axios'

import { Button, Paper } from '@material-ui/core'
import Webcam from 'react-webcam'
import { VColor } from '../../utils/constants'
import { cryptoURL } from '../../utils/RestAPI'
import Cropper from 'react-easy-crop'

import getCroppedImg from '../cropping/cropImage'

const videoConstraints = {
  width: 600,
  height: 600,
  facingMode: "user"
}

export default function WebCamView(props) {
  const [capturedData, setCapturedData] = React.useState()

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)

  useEffect(()=>{
    if( navigator.mediaDevices.getUserMedia != null){
      const cam_access = localStorage.getItem('camera_access')
      if (cam_access == 'false'){
        navigator.mediaDevices.getUserMedia({audio:true,video:true}, function(stream) {
          stream.getTracks().forEach(x=>x.stop());
          localStorage.setItem('camera_access', 'true')
        }, err=>console.log(err));
      }
    } else {
      localStorage.setItem('camera_access', 'false')
    }

  }) 

  useEffect(()=>{
    setTimeout(() => {
      capture()
    }, 5000);
  }, [capturedData])

  const capture = React.useCallback( async () => {
    if (webcamRef.current != null){
      const imageSrc = webcamRef.current.getScreenshot()
      // console.log('captured image :', imageSrc)
      try {
        let state = await decodeCapturedData(imageSrc)
        // console.log("state : ", state)
        
        if (state.length > 600){
          props.onDetected(state)
        } else {
          setCapturedData(imageSrc)
        }
      } catch (ex){
        console.log("error : ", ex)
        setCapturedData(null)
      }
    }
  }, [webcamRef])

  const decodeCapturedData = (img) =>{
    return new Promise((resolve, reject)=>{
      if (img){
        const token = localStorage.getItem('token')
        const userid = localStorage.getItem('userId')
        const urlAPI = cryptoURL + '/api/decode/' 
        const beartoken = 'Bearer ' + token
        const headers = {
          Authorization: beartoken,
        }

        let body = {}
        body['base64image'] = img
        body['matrixsize'] = 114
        body['samplewidth'] = 4
        body['pixelspercell'] = 4
        body['edac'] = 2

        // console.log("body : ", body)

        axios
            .post(urlAPI, body, { headers })  
            .then(response => {
              // console.log("response : ",response)
              if (response.data.status === 'Unauthorized') {
                reject('unauthorized')
              } else {
                resolve(response.data.data);
              }
            })
            .catch(error => {
              reject('wrong vericode')
            })
      } else {
        reject('wrong vericode')
      }
    })
  }

  // const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
  //   console.log(
  //     'croppedArea, croppedAreaPixels: ',
  //     croppedArea,
  //     croppedAreaPixels
  //   )
  //   setCroppedAreaPixels(croppedAreaPixels)
  // }, [])

  // const showCroppedImage = useCallback(async () => {
  //   try {
  //     const croppedImage = await getCroppedImg(capturedData, croppedAreaPixels)
  //     console.log('donee', { croppedImage })
  //     setCroppedImage(croppedImage)
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }, [croppedAreaPixels])

  // const onClose = useCallback(() => {
  //   setCroppedImage(null)
  // }, [])

  const webcamRef = React.useRef(null)

  // const handleCrop = () => {
  //   showCroppedImage()
  // }

  const handleCancel = () => {
    // setCroppedImage(null)
    // setCapturedData(null)

    // clearInterval(intervalId)
    // setIntervalId(0)
    navigate('/order-card/')
  }

  // const handleContinue = ()=>{
  //   // navigate('/scan-card/view')
  //   setCapturedData(null)
  //   setCroppedImage(null)
  // }

  return (
    <Paper
      elevation={0}
      style={{
        width: '80vw',
        height: '80vw',
        maxWidth: 600,
        maxHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',

        // border: '1px solid red',
      }}
    >      
      <div style={{ marginTop: 30, position: 'relative' }}>
        <Webcam
          audio={false}
          height={'100%'}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={'100%'}
          videoConstraints={videoConstraints}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            textAlign: 'center',
            width: '100%',
            height: '10%',
            backgroundColor: VColor.opacityBlack,
            zIndex: 1000,
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            top: '90%',
            left: 0,
            width: '100%',
            height: '10%',
            backgroundColor: VColor.opacityBlack,
            zIndex: 1001,
            textAlign: 'center',
          }}
        >
          <Button
            variant="text"
            style={{ color: 'black', paddingTop: '10%' }}
            onClick={ handleCancel }
          >
            Click Here to Cancel
          </Button>
        </div>
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: 0,
            width: '10%',
            height: '80%',
            backgroundColor: VColor.opacityBlack,
            zIndex: 1000,
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '90%',
            width: '10%',
            height: '80%',
            backgroundColor: VColor.opacityBlack,
            zIndex: 1000,
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            border: '1px solid green',
            width: '80%',
            height: '80%',
            zIndex: 1000,
            textAlign: 'center',
          }}
        ></div>
      </div>
      
    </Paper>
  )
}
