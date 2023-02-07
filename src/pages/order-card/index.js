import React from 'react'
import { navigate } from 'gatsby'
import { useDispatch, useSelector } from 'react-redux'
import useStyles from '../../utils/styles'
import axios from 'axios'
import { MainLayout } from '../../components/Layout'
import { ButtonBase, Grid, Paper } from '@material-ui/core'
import Utils from '../../utils/utils'
import { setSelCard } from '../../state/actions'
import AlertDialog from '../../components/Dialog/AlertDialog'
import {serverURL} from '../../utils/RestAPI'


const API_URL = serverURL + '/api/allcardprograms';

class SelectCard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLogin: true,
      images:[],
    }
    this.alertRef = React.createRef()
  }

  loadCardTemplate(){
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };

    const cur_domain = localStorage.getItem('domain');    
    const body = {
      domain: cur_domain
    }

    return new Promise(resolve => {
       setTimeout(() => {
        axios.post(API_URL, body,{ headers })
        .then(response => {
          const cardprograms = response.data.data;
          var imagetps = cardprograms.map((row) => {
              var cardTemplate = {
                front: row.card_image_front,
                program_id: row.program_id,
                program_name:row.program_name,
                matrix_size: row.matrix_size,
                edac:row.edac,
                compression: row.compression,
                pxpcw: row.pxpcw,
                sample_width: row.sample_width,
                logo: row.logo,
                program_template: row.program_template,
                created_date: row.created_date
              }
              const isAdmin = localStorage.getItem('user_role') === 'Administrator'
              const isManger = localStorage.getItem('user_role') === 'Program Manager'
              const programs = JSON.parse(localStorage.getItem('user_programs'))
              if (isAdmin || isManger){
                return cardTemplate
              } else if (programs[cardTemplate.program_name]){
                return cardTemplate
              }
           });

          this.setState({images: imagetps})
          resolve(cardprograms);
        })
        .catch((error) => {
          console.log(error);
          navigate('/order-card/')
          return null;
        }) 
        .finally(()=>{
 //         setLoading(false)
        })
      }, Math.random() * 500 + 100) // simulate network latency
    })
  }

  componentDidMount() {
    const { dispatch, userData, basicData } = this.props
    this.loadCardTemplate();
  }

  onTapCard = (selCard) => {
    const { dispatch, userData, basicData } = this.props
    //check user role and permission
    const permissions = JSON.parse(localStorage.getItem('user_permissions'))
    const programs = JSON.parse(localStorage.getItem('user_programs'))
    const roles = localStorage.getItem('user_role')

    console.log('permission : ', permissions['cards_order'])
    // console.log('permission : ', programs[selCard.program_name])

    let isPass = false
    if(permissions['cards_order'] && programs[selCard.program_name]){
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
    
    if (isPass){
      dispatch(setSelCard(selCard))
      navigate('/order-card/order')
    } else{
      if (this.alertRef.current) {
        this.alertRef.current.showDialog('', 'No permission to order this card', () => {
        })
      }
    }
  }

  render() {
    const { userData, classes } = this.props

    return (
      <MainLayout menuIndex={2}>
        <Grid
          container
          justify="center"
          alignItems={'flex-start'}
          spacing={6}
          style={{ padding: 20, maxWidth: 1200 }}
        >
         
          {
          //  this.state.image ? <img src ={this.state.image}></img>:""
          this.state.images.map(one => {
            if (one){
              return (
                <Grid
                  key={Utils.getKey()}
                  item
                  lg={4}
                  md={4}
                  sm={6}
                  xs={12}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Paper elevation={4}>
                    <ButtonBase onClick={() => this.onTapCard(one)}>
                      <img
                        src={one.front}
                        style={{
                          objectFit: 'contain',
                          borderRadius: 7,
                          marginBottom: 0,
                        }}
                      />
                    </ButtonBase>
                  </Paper>
                </Grid>
              )
            }
          })} 
        </Grid>

        <AlertDialog ref={this.alertRef} okTitle={'done'} />
      </MainLayout>
    )
  }
}

export default function(props) {
  const dispatch = useDispatch()
  const userData = useSelector(state => state.app.userData)
  const classes = useStyles()

  return (
    <SelectCard
      {...props}
      dispatch={dispatch}
      userData={userData}
      classes={classes}
    />
  )
}
