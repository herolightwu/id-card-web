import React from 'react'
import { navigate } from 'gatsby'

import useStyles from '../../utils/styles'

import { Fade, Paper, Button } from '@material-ui/core'
import Constants, { VColor } from '../../utils/constants'

import { useTheme } from '@material-ui/core'
import PhotoPickerDlg, { CropType } from '../../components/Dialog/PhotoPickerDlg'

import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';


export const PickerMode = {
  Back: 1,
  Logo: 2,
  Front: 3,
}

export default function CardProgramsLeft({ 
  isCreateMode = false, 
  editMode = false, 
  disabledProgram=false, 
  created_date='01/01/1970', 
  program_id='00000001', 
  front_img, 
  back_img, 
  logo_img, 
  status=true, 
  onChangeFront, 
  onChangeLogo, 
  onChangeBack }) {

  const classes = useStyles()
  const theme = useTheme()
  const transitionDuration = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  }


  const [cardFront, setCardFront ] = React.useState()
  const [cardBack, setCardBack ] = React.useState()
  const [logo ,setLogo] = React.useState()

  const [pickerMode, setPickerMode] = React.useState(PickerMode.Front)
  const [openPicker, setOpenPicker] = React.useState(false)
  const [blinxStatus, setBlinxStatus] = React.useState(false)

  React.useEffect(()=>{
    setCardFront(front_img)
  },[front_img])

  React.useEffect(()=>{
    setLogo(logo_img)
  },[logo_img])

  React.useEffect(()=>{
    setCardBack(back_img)
  },[back_img])

  return (
    <Paper elevation={0}>
      <div>
        <span className={classes.cardTitle}>Back Card</span>
      </div>
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
            src={cardBack}
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

              objectFit: 'contain',
              borderRadius: 7,
            }}
          />
          <Fade in={editMode}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
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
                  setPickerMode(PickerMode.Back)
                }}
              >
                change photo
              </Button>
            </div>
          </Fade>
        </div>
      </Paper>

      <div style={{marginTop: 10}}>
        <div>
          <span className={classes.cardTitle}>Front Card</span>
        </div>
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
              src={cardFront}
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

                objectFit: 'contain',
                borderRadius: 7,
              }}
            />
            <Fade in={editMode}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
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
                    setPickerMode(PickerMode.Front)
                  }}
                >
                  change photo
                </Button>
              </div>
            </Fade>
          </div>
        </Paper>        
      </div>
    
      <div style={{marginTop: 20}}>
        <div>
          <span className={classes.cardTitle}>Logo</span>
        </div>
        <Paper elevation={3} style={{width:'50%'}}>
          <div style={{ position: 'relative' }}>
            <img
              src={logo}
              style={{ width: '100%', objectFit: 'contain', minHeight: 80, marginBottom: 10, }}
            />
            <Fade in={editMode}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  width: '100%',
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
                    setPickerMode(PickerMode.Logo)

                  }}
                >
                  change photo
                </Button>
              </div>
            </Fade>
          </div>
        </Paper>        
      </div>
      
      <div>
      <FormControlLabel
          value="start"
          control={<Switch color="primary" value={blinxStatus} onChange={(event, value) => { setBlinxStatus(value)}} />}
          label="BlinxPay Card"
          labelPlacement="start"
          style={{marginLeft: 0}}
        />
      </div>
      <div>
        <Button color="primary" disabled={!disabledProgram} style={{marginLeft:-8}} onClick={()=>{
          navigate('/admin/card-programs/manage/cards')
        }}>
          Manage cards
        </Button>
      </div>

      <div className={classes.mainText}>Program ID: {program_id}</div>
      <div className={classes.mainText}>Created: {created_date}</div>
      <div className={classes.mainText}>Status: { status ? 'Enabled' : 'Disabled'}</div>
      <div className={classes.mainText}>BlinxPay: { blinxStatus ? 'Yes' : 'No'}</div>
      <PhotoPickerDlg
        open={openPicker}
        title={'Replace Photo?'}
        cropType={ (pickerMode == PickerMode.Front || pickerMode == PickerMode.Back) ? CropType.CardFront : CropType.Logo}
        handleClose={() => {
          setOpenPicker(false)
        }}
        onResult={img=>{
          // setCurImage(img)
          if(pickerMode == PickerMode.Front){
            setCardFront(img)
            onChangeFront(img)
          }else if(pickerMode == PickerMode.Logo){
            setLogo(img)
            onChangeLogo(img)
          } else if(pickerMode == PickerMode.Back){
            setCardBack(img)
            onChangeBack(img)
          }
          setOpenPicker(false)
        }}
      />
    </Paper>
  )
}
