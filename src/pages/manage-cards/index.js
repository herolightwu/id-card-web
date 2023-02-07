import 'date-fns'
import React from 'react'
import {navigate } from 'gatsby'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'

import { DataGrid } from '@material-ui/data-grid'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'

import useStyles from '../../utils/styles'
import Search from '@material-ui/icons/Search'
import InputAdornment from '@material-ui/core/InputAdornment'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import { MainLayout } from '../../components/Layout'
import { VColor } from '../../utils/constants'
import { Grid } from '@material-ui/core'

import DateFnsUtils from '@date-io/date-fns'
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers'
import ProgressDlg from '../../components/Dialog/ProgressDlg'
import { ConfirmDlg } from '../../components/Dialog/PhotoPickerDlg'
import AlertDialog from '../../components/Dialog/AlertDialog'
import { setSelCard } from '../../state/actions'
import {serverURL} from '../../utils/RestAPI'

const API_URL = serverURL + '/api/cards/';

const columns = [  
  { field: 'id', headerName: 'Card ID', width: 140 },
  { field: 'first_name', headerName: 'First Name', width: 200 },
  { field: 'last_name', headerName: 'Last Name', width: 200 },
  { field: 'email', headerName: 'Email Address', width: 300 },
  { field: 'status', headerName: 'Status', width: 140 },
  { field: 'program_name', headerName: 'Program Name', width: 200 },
]

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

export function CardsDataTable(props) {
  
  var cardrows = props.data;
  cardrows = cardrows.map((row) => {
   row.id = row.card_id;
   return row
  });
 
  const data = React.useRef({
   columns: columns,
   rows : cardrows,
   rowLength: 100,
   maxColumns: 8,
  });

  const columns = [  
    { field: 'id', headerName: 'Card ID', width: 140 },
    { field: 'first_name', headerName: 'First Name', width: 200 },
    { field: 'last_name', headerName: 'Last Name', width: 180 },
    { field: 'email', headerName: 'Email Address', width: 260 },
    { field: 'status', headerName: 'Status', width: 140 },
    { field: 'program_name', headerName: 'Program Name', width: 180 },
    { field: 'actions', headerName: 'Action', width: 120, renderCell: (params) => {
      return (
        <Button
          size="small"
          color="secondary"
          style={{
            float: 'right',
            marginLeft: 5,
            marginRight: 5,
            marginBottom: 5,
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={(e) => onDeleteClick(e, params.row)}
          variant="contained"
        >
          Delete
        </Button>
      );
    } }
  ]

  const dispatch = useDispatch()
  
  const [allcards, setAllCards] = React.useState([])
  const [page, setPage] = React.useState(0)
  const [rows, setRows] = React.useState([])
  const [pageSize, setPageSize] = React.useState(10)
  const [loading, setLoading] = React.useState(false)
  const [selectionModel, setSelectionModel] = React.useState([])
  const [rowCount, setRowCount] = React.useState(100)
  
  const handlePageChange = params => {
    setPage(params)
  }

  const loadSeverCardData = ()=>
  {
    setLoading(true)
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };

    return new Promise(resolve => {
      setTimeout(() => {
        axios.get(API_URL, { headers })
        .then(response => {
          const cards = response.data.data;
          //loadTableRows(cards);
          setAllCards(cards);
          resolve(cards);
        })
        .catch((error) => {
          console.log(error);
          return null;
        }) 
        .finally(()=>{
          setLoading(false)
        })
      }, Math.random() * 500 + 100) // simulate network latency
    })
  }

  const loadTableRows = (carddata)=>{
    let cardnum = 0
    if (carddata !== 'undefined'){
      const cards = carddata.slice(page * pageSize, (page + 1) * pageSize)
      const newCards = cards.map(card=>{
        card.id= card.card_id;
        if (!card.first_name){
          card.first_name = card.code_fields.first_name
        }
        if (!card.last_name){
          card.last_name = card.code_fields.last_name
        }
        if(!card.email){
          card.email = card.code_fields.email
        }
        card.status = card.cardstatus
        return card;
      })
      cardnum = carddata.length;
      setRowCount(cardnum)
      setRows(newCards);
    }
    if (props.onLoad){
      props.onLoad(cardnum)
    }
  }

  const filterCardData = (filterId, filterType, filterStatus, filterSort, beginDate, endDate)=>{
    if (allcards.length > 0){
      let resultdata = allcards
      if (filterId){
        resultdata = resultdata.filter((card) => {
          return card.card_id == filterId
        });
      }

      if (filterType){
        resultdata = resultdata.filter((card) => {
          return card.program_id == filterType
        });
      }

      if (filterStatus){
        resultdata = resultdata.filter((card) => {
          let cardstatus = card.cardstatus
          if (filterStatus === 1 && cardstatus === 'ordered'){
            return true
          } else if (filterStatus === 2 && cardstatus === 'updated'){
            return true
          } else if (filterStatus === 3 && cardstatus === 'printed'){
            return true
          } else if (filterStatus === 4 && cardstatus === 'nfc'){
            return true
          } else if (filterStatus === 5 && cardstatus === 'rejected'){
            return true
          } else if (filterStatus === 0){
            return true
          }
          return false
        });
      }

      if (filterSort){
        resultdata = resultdata.sort((a,b) => {
          let a_time = a.created_date
          let b_time = b.created_date
          if (filterSort == 2){
            a_time = a.printed_date
            b_time = b.printed_date
            if (!a_time){
              return true
            }
          }
          if (filterSort == 3){
            a_time = a.nfc_date
            b_time = b.nfc_date
            if (!a_time){
              return true
            }
          }
          let a_date = Date.parse(a_time)
          let b_date = Date.parse(b_time)
          return a_date - b_date
        });
      }

      if (beginDate){
        resultdata = resultdata.filter((card) => {
          let cardDate = Date.parse(card.created_date)
          return beginDate < cardDate
        });
      }

      if (endDate){
        resultdata = resultdata.filter((card) => {
          let cardDate = Date.parse(card.created_date)
          return endDate > cardDate
        });
      }      
      loadTableRows(resultdata)
    }
  }

  React.useEffect(() => {
    let active = true;

    loadSeverCardData();

    return () => {
      active = false
    }
  }, [page, data, pageSize, props.reload])

  React.useEffect(() => {
    filterCardData(props.cardId, props.cardType, props.status, props.sortBy, props.beginDate, props.endDate);
  }, [props.cardId, props.cardType, props.status, props.sortBy, props.beginDate, props.endDate, allcards])

  React.useEffect(() => {
    setSelectionModel(props.selectionModel)
  }, [props.selectionModel])

  const gotoCardView = data => {
    console.log("data:", data)
    dispatch(setSelCard(data))
    navigate('/manage-cards/view', {state: data}) //selectManageCard
  }

  const onDeleteClick = (e, row) => {
    e.stopPropagation()    
    //do whatever you want with the row
    props.onConfirm?.(row)
  }

  return (
    <div
      style={{
        width: '100%',
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        pagination
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 20]}
        onPageSizeChange={(pagesize) => {
          setPageSize(pagesize)
        }}
        rowCount={rowCount}
        checkboxSelection
        paginationMode="server"
        onPageChange={handlePageChange}
        loading={loading}
        onSelectionModelChange={(ids) => {
          const selectedIDs = new Set(ids);
          setSelectionModel(ids.selectionModel)
          const selectedRowData = rows.filter((row) =>
            selectedIDs.has(row.id)
          );
          props.onChangeSelected(selectedRowData)
        }}
        selectionModel={selectionModel}
        onCellClick={(data, event)=>{
          gotoCardView(data.row)
        }}
        
      />
    </div>
  )
}

class ManageCards extends React.Component {
  timer = null
  constructor(props) {
    super(props)

    this.state = {
      isLogin: true,
      beginDate: new Date(2022, 0, 1),
      endDate: new Date(),
      cardId: '',
      cardType: '',
      status: '',
      sortBy: '',
      progressValue: 0,
      openProgress: false,
      openNFCPorgress: false,
      nfcProgValue: 0,
      cards:[],
      cardcount: 0,
      selRowData:[],
      progressID: 0,
      formFields: defaultFields,
      openResultDlg: false,
      resultTitle: '',
      gridSelection: [],  
      card_programs:[],
      licenselist: null,
      openDeleteConfirm: false,
      showLoader: false,
      del_row:'',
      reload:false
    }
    this.alertRef = React.createRef()
  }

  getLicenselist() {
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    let body = {}
    const domain = localStorage.getItem('domain')
    body['domain_name'] = domain

    return new Promise(resolve => {
      const card_URL = serverURL + '/api/getLicense/';

      axios.post(card_URL, body, { headers })
      .then(response => {
        const prog_data = response.data.data;
        
        this.setState({licenselist: prog_data})
        resolve(prog_data);
      })
      .catch((error) => {
        console.log(error);
        if (this.alertRef.current) {
          this.alertRef.current.showDialog('', 'Cannot get the card licenses', () => {
            navigate('/manage-cards/')
          })
        }
        return null;
      }) 
      .finally(()=>{
      })
    })
  }

  loadCardTemplate(){
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };

    const cur_domain = localStorage.getItem('domain')
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
                card_image_front: row.card_image_front,
                card_image_back: row.card_image_back,
                program_id: row.program_id,
                program_name:row.program_name,
                matrix_size: row.matrix_size,
                edac:row.edac,
                compression: row.compression,
                pxpcw: row.pxpcw,
                sample_width: row.sample_width,
                logo: row.logo,
                program_template: row.program_template,
                created_date: row.created_date,
                printed_size: row.printed_size
              }
            return cardTemplate
           });
           this.setState({card_programs: imagetps})
          resolve(imagetps);
        })
        .catch((error) => {
          console.log(error);
          navigate('/manage-cards/')
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
    this.getLicenselist()
  }

  onTapSearch = () => {
  }

  generateVirtualCard = (rowdata) =>{

    return new Promise((resolve, reject)=>{

       if (rowdata){
        let cur_license = null
        for(let i = 0; i < this.state.licenselist.length; i++){
          if (this.state.licenselist[i].program_id === rowdata.program_id){
            cur_license = this.state.licenselist[i]
            break;
          }
        }
        
        const token = localStorage.getItem('token')
        const userid = localStorage.getItem('userId')
        const urlAPI = serverURL + '/api/generate_card/'
        const beartoken = 'Bearer ' + token
        const headers = {
          Authorization: beartoken,
        }

        let valFields = []
        let front_image = ''
        let back_image = ''
        let matrixsize = 114
        let logo = ''
        let program_name = ''
        let printed_size = "small"
        for(let ind = 0; ind < this.state.card_programs.length; ind++){
          let card_prog = this.state.card_programs[ind]
          if (card_prog.program_id == rowdata.program_id){
            // console.log("card Prog : ", card_prog)
            valFields = card_prog.program_template
            front_image = card_prog.card_image_front
            back_image = card_prog.card_image_back
            logo = card_prog.logo
            matrixsize = card_prog.matrix_size
            program_name = card_prog.program_name
            printed_size = card_prog.printed_size
            break
          }
        }

        if (valFields.length == 0){
          reject('Can not find the temaplate') 
          return
        }
        // check the license limit before print
        if (rowdata.cardstatus === 'ordered'){
          if (cur_license){
            const start_num = cur_license.start_idcard
            const end_num = cur_license.end_idcard
            if (end_num - start_num <= cur_license.card_count){
              if (this.alertRef.current) {
                this.alertRef.current.showDialog('', 'License for template card ' + program_name + ' expired, Please contact to Veritec, Inc.')
              } 
              reject('License for template card ' + program_name + ' expired, Please contact to Veritec, Inc.')
            }
          } else {
            reject('The Card Program is not License, Please contact Veritec, Inc.to resolve PDF printing')
          }
        }
        
        // let fields = defaultFields        
        for(let ind = 0; ind < valFields.length; ind++){
          valFields[ind].name = valFields[ind].label.toString().toLowerCase().replace(/\s/g, '_')
          // fields.push(valFields[ind])
        }
        // console.log("form fileds :", valFields)
        // console.log("row data : ", rowdata)
  
        let body = {}
        let mem_id = ''
        let text_one = ''
        let text_two = ''
        for (let i = 4; i < valFields.length; i++) {
          let code_fields = rowdata.code_fields
          if (i == 4 && !valFields[i].extend && code_fields[valFields[i].name] != 'undefined'){
            text_one = valFields[i].label + ": " + code_fields[valFields[i].name]
          } else if(i == 5 && !valFields[i].extend && code_fields[valFields[i].name] != 'undefined'){
            text_two = valFields[i].label + ": " + code_fields[valFields[i].name]
          }
        }
        if (rowdata.code_fields["member_id"]){
          mem_id = "ID: " + rowdata.code_fields["member_id"]
        }
        rowdata.code_fields["card_id"] = rowdata.card_id
        
        body['face_image'] = rowdata.face_image
        body['compressed_face_image'] = rowdata.compressed_face_image
        body['code_fields'] = rowdata.code_fields
        body['server_fields'] = rowdata.server_fields
        body['program_id'] = rowdata.program_id
        body['barcode'] = rowdata.barcode
        body['barcode_size'] = matrixsize
        body['modified_user'] = rowdata.modified_user
        body['front_image'] = front_image
        body['back_image'] = back_image
        body['logo'] = logo
        body['cardstatus'] = rowdata.cardstatus
        body['user_id'] = userid
        body['member_id'] = mem_id
        body['printed_size'] = printed_size
        body['text_one'] = text_one
        body['text_two'] = text_two

        if (cur_license){
          body['license_id'] = cur_license.license_id
        } else {
          body['license_id'] = 0
        }
        // console.log("body:", body)
        // return 
        setTimeout(() => {
          axios
            .post(urlAPI, body, { headers })
            .then(response => {
              if (response.data.status === 'Unauthorized') {
                reject('unauthorized')
              } else {
                if (rowdata.cardstatus === 'ordered'){
                  this.setState({print_count: this.state.print_count+1})
                }
                resolve(response.data.vcard);
              }
            })
            .catch(error => {
              reject(error)
            })
        }, Math.random() * 500 + 500) 
      }
    })   
  }

  rejectCard = (rowdata) =>{

    return new Promise((resolve, reject)=>{
      if (rowdata){
        const token = localStorage.getItem('token')
        const userid = localStorage.getItem('userId')
        const urlAPI = serverURL + '/api/cards/' + rowdata.id
        const beartoken = 'Bearer ' + token
        const headers = {
          Authorization: beartoken,
        }
        
        let body = {}
        body['status'] = 'rejected'
        axios
          .put(urlAPI, body, { headers })
          .then(response => {
            // console.log("response : ",response)
            if (response.data.status === 'unauthorized') {
              reject(response.data.message.toString())
            } else {
              resolve('ok')
            }
          })
          .catch(error => {
            reject(error)
          })
      }
    })
  }

  onReject = () => {
    //check user role and permission
    const permissions = JSON.parse(localStorage.getItem('user_permissions'))
    const roles = localStorage.getItem('user_role')
    // console.log('permission : ', permissions['cards_reject'])

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
        this.alertRef.current.showDialog('', 'No permission to reject the cards', () => {
          navigate('/manage-cards/')
        })
      }
      return
    }

    let selData = this.state.selRowData;
    if (selData.length > 0) {
      this.setState({
        openProgress: true,
      })

      let promiseList = []
      let newVal = 0
      for (let index = 0; index < selData.length; index++) {
        const element = selData[index]
        if (element.status === 'ordered'){
          promiseList.push(this.rejectCard(element))
          // progressbar
          newVal = index * 100 / selData.length;
          this.setState({
            progressValue: newVal,
          })
        }        
      }

      Promise.all(promiseList).then(resultArr=>{
        const title = 'Ordered cards (' + resultArr.length + '/' + selData.length + ') has rejected successfully.'
        this.setState({
          openProgress: false,
          openResultDlg:true,
          resultTitle : title,
        })
        
      }).catch((errors) => {
        this.setState({
          openProgress: false,
          openResultDlg: true,
          resultTitle: 'Some error has rejected. ' + errors.response.data.message,
        })
      })
    }  else {
      const title = 'Please choose the cards.'
        this.setState({
          openProgress: false,
          openResultDlg:true,
          resultTitle : title
        })
    }
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
        this.alertRef.current.showDialog('', 'No permission to print the cards', () => {
          navigate('/manage-cards/')
        })
      }
      return
    }
    let selData = this.state.selRowData;
    // console.log("sel row:", selData)
    // console.log("card program :", this.state.card_programs)
    //  return
    if (selData.length > 0) {
      this.setState({
        openProgress: true,
      })

      let promiseList = []
      let newVal = 0
      for (let index = 0; index < selData.length; index++) {
        const element = selData[index];
        promiseList.push(this.generateVirtualCard(element))
        // progressbar
        newVal = index * 100 / selData.length;
        this.setState({
          progressValue: newVal,
        })
      }

      Promise.all(promiseList).then(resultArr=>{
        const title = 'Virtual cards (' + resultArr.length + '/' + selData.length + ') has generated successfully.'
        this.setState({
          openProgress: false,
          openResultDlg:true,
          resultTitle : title,
        })
        
      }).catch((errors) => {
        this.setState({
          openProgress: false,
          openResultDlg: true,
          resultTitle: 'Some error has generated. ' + errors,
        })
      })
    }  else {
      const title = 'Please choose the cards.'
        this.setState({
          openProgress: false,
          openResultDlg:true,
          resultTitle : title
        })
    }    
  }

  onTapNFC = ()=>{
    //check user role and permission
    const permissions = JSON.parse(localStorage.getItem('user_permissions'))
    const roles = localStorage.getItem('user_role')
    // console.log('permission : ', permissions['cards_reject'])

    let isPass = false
    if(permissions['nfc_write']){
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
        this.alertRef.current.showDialog('', 'No permission to write the cards for NFC', () => {
          navigate('/manage-cards/')
        })
      }
      return
    }
    this.setState({
      openNFCPorgress: true,
    })

    if (this.timer) {
      clearInterval(this.timer)
      this.setState({ nfcProgValue: 0 })
    }

    this.timer = setInterval(() => {
      let newVal = 0
      if (this.state.nfcProgValue < 100) {
        newVal += this.state.nfcProgValue + 5
      } else {
        newVal = 100
        clearInterval(this.timer)
        this.setState({
          openNFCPorgress: false,
        })
      }
      this.setState({
        nfcProgValue: newVal,
      })
    }, 500)
  }

  onStop = () => {
    this.setState({
      openProgress: false,
    })
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  onStopNFCProg = ()=>{
    this.setState({
      openNFCPorgress: false,
    })
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  onDeleteConfirm = (row) => {
    this.setState({openDeleteConfirm: true, del_row: row})
  }

  handleDelete = () => {
    this.setState({ openDeleteConfirm: false })
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
    
    const urlAPI = serverURL + '/api/deletecard/' + this.state.del_row.card_id
    const body = {
      card_id: this.state.del_row.card_id,
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
                this.setState({reload: !this.state.reload})
              })
            } else {
              this.setState({reload: !this.state.reload})
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

  render() {
    const { userData, classes } = this.props

    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <MainLayout menuIndex={1} loader={this.state.showLoader} >
          <Grid container spacing={3} style={{maxWidth: 1300,marginLeft:'auto', marginRight:'auto'}}>
            <Grid item sm={6}>
              <div
                style={{
                  paddingLeft: 5,
                  paddingRight: 5,
                  background: VColor.lightGray,
                  maxWidth: 300,
                }}
              >
                <FormControl style={{ width: '100%' }}>
                  <InputLabel htmlFor="filled-basic">Card ID</InputLabel>
                  <Input
                    id="filled-basic"
                    type={'number'}
                    value={this.state.cardId}
                    variant="filled"
                    onChange={e => {
                      const { value } = e.target;
                      if (value){
                        const parsedInt = parseInt(value);
                        if (parsedInt) {
                          this.setState({ cardId: parsedInt });
                        }
                      } else {
                        this.setState({ cardId: '' });
                      }
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={this.onTapSearch}
                          onMouseDown={this.onTapSearch}
                        >
                          <Search />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </div>
            </Grid>

            <Grid item sm={6} xs={false}>
              <Typography
                variant="h5"
                style={{ float: 'right', marginTop: 10 }}
              >
                Available Cards: {this.state.cardcount}
              </Typography>
            </Grid>

            <Grid item md={2} sm={4} xs={12}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Card Type</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={this.state.cardType}
                  onChange={e => {
                    this.setState({ cardType: e.target.value })
                  }}
                >
                  <MenuItem value={0}>All Programs</MenuItem>
                  { this.state.card_programs.length > 0 ? this.state.card_programs.map( one => {
                      return(<MenuItem value={one.program_id} key={one.program_id}>{one.program_name}</MenuItem>)
                    }):null }
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={2} sm={4} xs={12}>
              <FormControl fullWidth>
                <InputLabel id="select-status">Status</InputLabel>
                <Select
                  labelId="select-status"
                  id="select-status"
                  value={this.state.status}
                  fullWidth
                  onChange={e => {
                    this.setState({ status: e.target.value })
                  }}
                  // style={{ height: 45 }}
                >
                  <MenuItem value={0}>All</MenuItem>
                  <MenuItem value={1}>Ordered</MenuItem>
                  <MenuItem value={2}>Updated</MenuItem>
                  <MenuItem value={3}>Printed</MenuItem>
                  <MenuItem value={4}>NFC</MenuItem>
                  <MenuItem value={5}>Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={2} sm={4} xs={12}>
              <FormControl fullWidth>
                <InputLabel id="label-date-ordered">Sort by</InputLabel>
                <Select
                  labelId="label-date-ordered"
                  id="date-ordered-select"
                  value={this.state.sortBy}
                  fullWidth
                  onChange={e => {
                    this.setState({ sortBy: e.target.value })
                  }}
                >
                  <MenuItem value={0}>None</MenuItem>
                  <MenuItem value={1}>Date Ordered</MenuItem>
                  <MenuItem value={2}>Date Printed</MenuItem>
                  <MenuItem value={3}>Date NFC</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item md={2} sm={false} xs={12}></Grid>
            <Grid item md={2} sm={4} xs={12}>
              <KeyboardDatePicker
                margin="normal"
                id="date-picker-dialog"
                label="Start Date"
                format="MM/dd/yyyy"
                style={{ marginTop: 0 }}
                value={ this.state.beginDate }
                onChange={date => {
                  this.setState({ beginDate: date })
                }}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </Grid>
            <Grid item md={2} sm={4} xs={12}>
              <KeyboardDatePicker
                margin="normal"
                id="date-picker-dialog"
                label="End Date"
                format="MM/dd/yyyy"
                style={{ marginTop: 0 }}
                minDate={ this.state.beginDate }
                value={ this.state.endDate }
                onChange={date => {
                  this.setState({ endDate: date })
                }}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <CardsDataTable 
                  programs={this.state.card_programs}
                  data={this.state.cards}
                  cardId={this.state.cardId}
                  cardType={this.state.cardType}
                  status={this.state.status}
                  sortBy={this.state.sortBy}
                  beginDate={this.state.beginDate}
                  endDate={this.state.endDate}
                  selectionModel = {this.state.gridSelection}
                  onLoad={(count) => {
                    this.setState({ cardcount: count })
                  }}
                  onChangeSelected={(selecteddata) => {
                    this.setState({selRowData: selecteddata})
                  }}
                  reload={this.state.reload}
                  onConfirm={this.onDeleteConfirm}
              />
            </Grid>
            <Grid item md={2} sm={3} xs={12}>
              <Button
                variant="contained"
                size="medium"
                color="primary"
                fullWidth
                onClick={this.onPrint}
                // style={btnStyle}
              >
                Print
              </Button>
            </Grid>
            <Grid item md={2} sm={3} xs={12}>
              <Button
                variant="contained"
                size="medium"
                color="primary"
                fullWidth
                onClick={this.onTapNFC}
                // style={btnStyle}
              >
                Write NFC
              </Button>
            </Grid>
            <Grid item md={2} sm={3} xs={12}>
              <Button
                variant="contained"
                size="medium"
                color="secondary"
                fullWidth
                onClick={this.onReject}
                // style={btnStyle}
              >
                Reject
              </Button>
            </Grid>
          </Grid>
          <ProgressDlg
            open={this.state.openProgress}
            value={this.state.progressValue}
            onStop={this.onStop}
            handleClose={() => {}}
            textContent={
              <Typography variant="body1">
                Printing cards {this.state.progressValue/5}/{this.state.selRowData.length}
              </Typography>
            }
          />
          <ProgressDlg
            open={this.state.openNFCPorgress}
            value={this.state.nfcProgValue}
            onStop={this.onStopNFCProg}
            handleClose={() => {}}
            textContent={
              <Typography variant="body1">
                Place card on writer 1/50
                <br />
                ID: 5555487269872541
              </Typography>
            }
          />
          <ConfirmDlg
            title={this.state.resultTitle}
            open={this.state.openResultDlg}
            okTitle='OK'
            cancel=''
            onOk={()=>{
              this.setState({ 
                openResultDlg: false,
                gridSelection: []
              })
            }}
            onCancel={() => {
              this.setState({ 
                openResultDlg: false,
                gridSelection: []
              })
            }}
          />
          <ConfirmDlg
            title={'Are you sure you want to delete this card?'}
            open={this.state.openDeleteConfirm}
            okTitle="Confirm"
            cancelTitle="Cancel"
            onOk={this.handleDelete}
            onCancel={() => {
              this.setState({ openDeleteConfirm: false })
            }}
          />
          <AlertDialog ref={this.alertRef} okTitle={'done'} />
        </MainLayout>
      </MuiPickersUtilsProvider>
    )
  }
}

export default function(props) {
  const dispatch = useDispatch()
  const userData = useSelector(state => state.app.userData)
  const classes = useStyles()

  return (
    <ManageCards
      {...props}
      dispatch={dispatch}
      userData={userData}
      classes={classes}
    />
  )
}
