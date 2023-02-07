import React from 'react'

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
import Fab from '@material-ui/core/Fab'
import EditImg from '../../assets/images/edit.png'
import FilledTextInput from '../../components/scan-card/FilledTextInput'
import { ConfirmDlg } from '../../components/Dialog/PhotoPickerDlg'

import axios from 'axios'
import { serverURL } from '../../utils/RestAPI'

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

export class ViewCard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLogin: true,
      showEditButton: true,
      formFields: defaultFields,
      openOrderConfirm: false,
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
      sel_card:{},
    }
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
    
    this.setState({
      barcode:this.props.location.state.barcode,
    })
    this.getCreatedUser()
    this.getCardProgram()
  }

  setFieldValues() {
    let valFields = this.state.card_program.program_template
    let formfields = defaultFields
    
    for(let ind = 0; ind < valFields.length; ind++){
      valFields[ind].name = valFields[ind].label.toString().toLowerCase().replace(/\s/g, '_')
      formfields.push(valFields[ind])
    }
    // console.log("form fileds :", formfields)

    Object.entries(this.props.location.state).forEach(([key, value]) => {
      for(let index = 0; index < formfields.length; index++){
        if (key == formfields[index].name){
          formfields[index].value = value
        }
      }
    })

    this.setState({formFields: formfields, sel_card: this.props.location.state})
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
        console.log(error);
        navigate('/manage-cards/')
        return null;
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
        const prog_data = response.data.data;
        
        this.setState({card_program: prog_data[0]}, ()=>{
          this.setFieldValues()
        })
        resolve(prog_data[0]);
      })
      .catch((error) => {
        console.log(error);
        navigate('/scan-card/')
        return null;
      }) 
      .finally(()=>{
      })
    })
  }

  getCardById(){
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };

    return new Promise(resolve => {
      const card_URL = serverURL + '/api/cards/'+this.props.location.state.card_id;
      axios.get(card_URL, { headers })
      .then(response => {
        const db_data = response.data.data;
        
        this.setState({sel_card: db_data[0]}, ()=>{
          this.setFieldValuesFromDB()
        })
        resolve(db_data[0]);
      })
      .catch((error) => {
        console.log(error);
        this.setFieldValues()
      }) 
      .finally(()=>{
      })
    })
  }

  setFieldValuesFromDB() {
    let valFields = this.state.card_program.program_template
    let formfields = defaultFields
    
    for(let ind = 0; ind < valFields.length; ind++){
      valFields[ind].name = valFields[ind].label.toString().toLowerCase().replace(/\s/g, '_')
      formfields.push(valFields[ind])
    }
    
    Object.entries(this.state.sel_card).forEach(([key, value]) => {
      for(let index = 0; index < formfields.length; index++){
        if (key == formfields[index].name){
          formfields[index].value = value
        }
      }
    })

    this.setState({formFields: formfields})
  }

  onNext = () => {
    navigate('/scan-card/')
  }

  onSave = () => {}

  onCancel = () => {
    this.setFieldValues()

    this.setState({ 
      openOrderConfirm: false, 
      showEditButton: true,
      barcode:this.state.sel_card.barcode,
      webp:this.state.sel_card.compressed_face_image,
      photo:this.state.sel_card.face_image,
      showError:false
    })
  }

  onConfirmOrder = () => {}

  onPrint = () => {}

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
                      card_id={this.state.sel_card.card_id}
                      program_id={this.state.card_program.program_id}
                      first_name={this.state.sel_card.first_name}
                      middle_name={this.state.sel_card.middle_name}
                      last_name={this.state.sel_card.last_name}
                      webp={this.state.sel_card.webp}
                      photo={this.statesel_card.photo} 
                      ordered_date={this.state.sel_card.ordered_date} 
                      barcode={this.state.sel_card.barcode} 
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
                      onClick={this.onNext}
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
                    >
                      Reject
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
                      update
                    </Button>
                  </div>
                  <div>
                    <Button
                      variant="contained"
                      size="medium"
                      color="primary"
                      style={btnStyle}
                      onClick={onCancel}
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
            onClick={() => {
              this.setState({ showEditButton: !this.state.showEditButton })
            }}
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

        <Backdrop className={classes.backdrop} open={this.state.loader}>
          <CircularProgress color='inherit' />
        </Backdrop>
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
    <ViewCard
      {...props}
      menuIndex={0}
      dispatch={dispatch}
      isDesktop={isDesktop}
      //   userData={userData}
      classes={classes}
      transitionDuration={transitionDuration}
    />
  )
}
