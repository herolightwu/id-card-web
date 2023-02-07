import React from 'react'

import { navigate } from 'gatsby'
import { useDispatch, useSelector } from 'react-redux'
import useStyles from '../../utils/styles'
import { MainLayout } from '../../components/Layout'
import WebCamView from '../../components/scan-card/WebCamView'
import axios from 'axios'
import { serverURL } from '../../utils/RestAPI'

class ScanCard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isLogin: true,
      card_programs:[]
    }    
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
        const card_URL = serverURL + '/api/allcardprograms';
        axios.post(card_URL, body, { headers })
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
            return cardTemplate
           });
           this.setState({card_programs: imagetps})
          resolve(imagetps);
        })
        .catch((error) => {
          console.log(error);
          navigate('/scan-card/')
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

    this.loadCardTemplate()
  }

  onTap = ()=>{
      navigate('/scan-card/view')
  }

  gotoView = data => {
    
    // var scanedCard={
    //   CardName: data.program_name,
    //   cardID: data.card_id,
    //   address1: data.address1,
    //   address2: data.address2,  
    //   available: data.available, 
    //   barcode: data.barcode,
    //   city: data.city,  
    //   code_fields: data.code_fields,  
    //   compressed_face_image: data.compressed_face_image,       
    //   email: data.email,   
    //   face_image: data.face_image,  
    //   first_name: data.first_name,  
    //   middle_name: data.middle_name,       
    //   last_name: data.last_name, 
    //   nfc_fields: data.nfc_fields, 
    //   phone: data.phone, 
    //   program_id: data.program_id, 
    //   program_name: data.program_name,
    //   server_fields: data.server_fields, 
    //   state: data.state, 
    //   zip_code: data.zip_code,
    //   ordered_date: data.created_date,
    // }
     navigate('/scan-card/view', {state: data})
  }

  render() {
    const { userData, classes } = this.props

    return (
      <MainLayout menuIndex={0}>
        <WebCamView 
          onClick={this.onTap}
          onDetected={(data) => {
            gotoView(data)
          }}
        />
     
      </MainLayout>
    )
  }
}

export default function(props) {
  const dispatch = useDispatch()
  const userData = useSelector(state => state.app.userData)
  const classes = useStyles()
  
  return (
    <ScanCard
      {...props}
      dispatch={dispatch}
      userData={userData}
      classes={classes}
    />
  )
}
