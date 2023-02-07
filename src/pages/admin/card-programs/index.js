import React from 'react'
import { navigate } from 'gatsby'

import { useDispatch, useSelector } from 'react-redux'

import { DataGrid } from '@material-ui/data-grid'
import IconButton from '@material-ui/core/IconButton'

import useStyles from '../../../utils/styles'
import Search from '@material-ui/icons/Search'
import InputAdornment from '@material-ui/core/InputAdornment'
import Button from '@material-ui/core/Button'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import axios from 'axios'
import { MainLayout } from '../../../components/Layout'
import AlertDialog from '../../../components/Dialog/AlertDialog'
import { ConfirmDlg } from '../../../components/Dialog/PhotoPickerDlg'
import { VColor } from '../../../utils/constants'
import { Grid } from '@material-ui/core'

import { setSelCard } from '../../../state/actions'
import {serverURL} from '../../../utils/RestAPI'

const API_URL = serverURL + '/api/allcardprograms/';

export function CardsDataTable(props) {

  var cardrows = props.data;
  if (typeof cardrows !== 'undefined'){
    cardrows = cardrows.map((row, index) => {
      row.id = index;
      return row
     });
  }

   const data = React.useRef({
    columns: columns,
    rows : cardrows,
    rowLength: 100,
    maxColumns: 5,
  });

  const columns = [  
    { field: 'status', headerName: 'Status', width: 160 },
    { field: 'program_name', headerName: 'Program Name', width: 300 },
    { field: 'domain', headerName: 'Domain', width: 200 },
    { field: 'date', headerName: 'Date Created', width: 200 },
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
  
  const [allCards, setAllCards] = React.useState([])
  const [domainlist, setDomainlist] = React.useState([])
  const [page, setPage] = React.useState(0)
  const [rows, setRows] = React.useState([])
  const [pageSize, setPageSize] = React.useState(10)
  const [rowCount, setRowCount] = React.useState(100)

  const [loading, setLoading] = React.useState(false)

  const handlePageChange = params => {
    setPage(params)
  }

  const loadCardPrograms = (sel_domain) =>{
    setLoading(true)
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    const body = {
      domain: sel_domain
    }

    return new Promise(resolve => {
      setTimeout(() => {
        axios.post(API_URL, body, { headers })
        .then(response => {
          const cards = response.data.data;
          if (cards){
            let carddata = cards.map((row) => {
              let rowdata = {
                ...row,
                domain: sel_domain
              }
              return rowdata
            });
            resolve(carddata)
          } else {
            resolve([])
          }
        })
        .catch((error) => {
          console.log(error);
          resolve([])
        }) 
        .finally(()=>{
          setLoading(false)
        })
      }, Math.random() * 500 + 100) // simulate network latency
    })
  }

  const loadSeverCardData = ()=>
  {
    if (domainlist.length > 0){
      let promiseList = []
      
      for (let index = 0; index < domainlist.length; index++) {
        const element = domainlist[index].domain_name;
        promiseList.push(loadCardPrograms(element))
      }

      Promise.all(promiseList).then(resultArr=>{
        let pre_allcards = allCards
        for (let i = 0; i < resultArr.length; i++){
          pre_allcards = [...pre_allcards, ...resultArr[i]]
        }
        // console.log(pre_allcards)
        setAllCards(pre_allcards)
      }).catch(errors => {
        console.log(errors)
      })
    }
  }

  const loadDomainlist = () => {
    setAllCards([])
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    const DOMAIN_URL = serverURL + '/api/domains';
    return new Promise(resolve => {
      setTimeout(() => {
        axios.get(DOMAIN_URL, { headers })
        .then(response => {
          const domaindata = response.data.data;   
          // console.log(domaindata)  
          setDomainlist(domaindata)
          resolve(domaindata);
        })
        .catch((error) => {
          console.log(error);
          return null;
        }) 
      }, Math.random() * 400 + 100) // simulate network latency
    })
  }

  const loadServerRows = (carddata)=>{
    if (carddata !== 'undefined'){
      const cards = carddata.slice(page * pageSize, (page + 1) * pageSize)
      const newCards = cards.map( (card, index) => {
        card.id= index;
        card.status = 'Available'
        if (!card.program_enabled){
          card.status = 'Disabled'
        }
        card.date = card.created_date
        return card;
      })
      setRowCount(carddata.length)
      setRows(newCards);
    }
  }

  const filterCardData = (filter_name, filter_status) => {
    if (allCards.length > 0){
      let resultdata = allCards
      if (filter_name){
        resultdata = resultdata.filter((card) => {
          return card.program_name.includes(filter_name)
        });
      }
      if (filter_status){
        resultdata = resultdata.filter((card) => {
          return card.cardstatus == filter_status
        });
      }

      loadServerRows(resultdata)
    }
  }

  React.useEffect(() => {
    let active = true;

    loadDomainlist();

    return () => {
      active = false
    }
  }, [page, data, pageSize, props.reload])

  React.useEffect(() => {
    loadSeverCardData()
  }, [domainlist])

  React.useEffect(() => {
    filterCardData(props.program_name, props.status);
  }, [props.program_name, props.status, allCards])

  const gotoCardView = data => {

    var selectManageCard={
      program_id: data.program_id, 
      program_name: data.program_name,
      program_enabled: data.program_enabled, 
      program_template: data.program_template,
      matrix_size: data.matrix_size,
      compression: data.compression,       
      logo: data.logo,   
      card_image_front: data.card_image_front,
      card_image_back: data.card_image_back,
      edac: data.edac,
      pxpcw: data.pxpcw,
      sampleWidth: data.sample_width,
      created_date: data.created_date,
      domain: data.domain,
      printed_size: data.printed_size,
    }

    dispatch(setSelCard(data))
    navigate('/admin/card-programs/view', {state: selectManageCard})
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
        onPageSizeChange={(pageSize) => {
          setPageSize(pageSize)
        }}
        rowCount={rowCount}        
        paginationMode="server"
        onPageChange={handlePageChange}
        loading={loading}
        onCellClick={(data, event) => {
          // console.log('cellData : ', data.row)
          gotoCardView(data.row)
        }}
      />
    </div>
  )
}

class CardPrograms extends React.Component {
  constructor(props) {
    super(props)
    const roles = localStorage.getItem('user_role')

    this.state = {
      isLogin: true,
      cards:[],
      status: '',
      program_name:'',
      create_roles: roles === 'Administrator' || roles === 'Program Manager',
      showLoader: false,
      openDeleteConfirm: false,
      del_row:'',
      reload:false
    }
    this.alertRef = React.createRef()
  }

  componentDidMount() {
    const { dispatch, userData, basicData } = this.props
  }

  onNewProgram = ()=>{
    // make current date 
    let d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
    const today = month + '-' + day + '-' + year

    var selectManageCard={
      program_id: this.state.cards.length + 1, 
      program_name: '',
      program_enabled: true, 
      program_template: [],
      matrix_size: 114,
      compression: '0',       
      logo: '',   
      card_image_front: '',
      card_image_back: '',
      edac: 2,
      pxpcw: 4,
      sampleWidth: 4,
      created_date: today,
      domain: '',
      printed_size: "small"
    }
    navigate('/admin/card-programs/create', {state: selectManageCard})
  }

  onDeleteConfirm = (row) => {
    this.setState({openDeleteConfirm: true, del_row: row})
  }

  handleDelete = () => {
    this.setState({ openDeleteConfirm: false })
    const token = localStorage.getItem('token')
    const programid = this.state.del_row.program_id;
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = serverURL + '/api/deleteprogram/' + programid
    const body = {
      program_id: programid,
      domain: this.state.del_row.domain
    };

    this.setState({ showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/admin/card-programs/')
              })
            }
          } else{
            this.setState({ showLoader: false})
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'This card program has deleted', () => {
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
              navigate('/admin/card-programs/')
            })
          }
        })
  }

  onTapSearch = ()=>{

  }

  render() {
    const { userData, classes } = this.props

    return (
        <MainLayout menuIndex={3} loader={this.state.showLoader}>
          <Grid
            container
            spacing={3}
            style={{ maxWidth: 1080, marginLeft: 'auto', marginRight: 'auto' }}
          >
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
                  <InputLabel htmlFor="filled-basic">Card Program Name</InputLabel>
                  <Input
                    id="filled-basic"
                    type={'text'}
                    value={this.state.program_name}
                    variant="filled"
                    onChange={e => {
                      this.setState({ program_name: e.target.value })
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
            <Grid item sm={4} xs={false}></Grid>
            <Grid item sm={2} xs={12}>
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
                >
                  <MenuItem value={1}>Enabled</MenuItem>                  
                  <MenuItem value={2}>Disabled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <CardsDataTable 
                data={this.state.cards}
                program_name={this.state.program_name}
                status={this.state.status}
                reload={this.state.reload}
                onConfirm={this.onDeleteConfirm}/>
            </Grid>
            { this.state.create_roles ? 
            <Grid item md={3} sm={4} xs={12}>
              <Button
                variant="contained"
                size="medium"
                color="primary"
                fullWidth
                onClick={this.onNewProgram}
              >
                New Program
              </Button>
            </Grid> : null }
          </Grid>
          <ConfirmDlg
            title={'Are you sure you want to delete this card program?'}
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
    )
  }
}

export default function(props) {
  const dispatch = useDispatch()
  const userData = useSelector(state => state.app.userData)
  const classes = useStyles()

  return (
    <CardPrograms
      {...props}
      dispatch={dispatch}
      userData={userData}
      classes={classes}
    />
  )
}
