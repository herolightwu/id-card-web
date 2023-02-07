import 'date-fns'
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
import axios from 'axios'
import { MainLayout } from '../../../components/Layout'
import AlertDialog from '../../../components/Dialog/AlertDialog'
import { ConfirmDlg } from '../../../components/Dialog/PhotoPickerDlg'
import { VColor } from '../../../utils/constants'
import { Grid } from '@material-ui/core'
import {serverURL} from '../../../utils/RestAPI'

const API_URL = serverURL + '/api/licenses/';

export function LicenseDT(props) {  
  var datarows = props.data;
  
   const data = React.useRef({
   columns: columns,
   rows : datarows,
   rowLength: 100,
   maxColumns: 8,
  });

  const columns = [
    { field: 'license_id', headerName: 'ID', width: 100, headerAlign: 'center', align: 'center'},
    { field: 'domain_name', headerName: 'Domain', width: 160 , headerAlign: 'center', align: 'center'},
    { field: 'program_name', headerName: 'Program Name', width: 200, headerAlign: 'center', align: 'center' },
    { field: 'start_idcard', headerName: 'Start Number', width: 170, headerAlign: 'center', align: 'center' },
    { field: 'end_idcard', headerName: 'End Number', width: 170, headerAlign: 'center', align: 'center' },
    { field: 'card_count', headerName: 'Count', width: 120, headerAlign: 'center', align: 'center' },  
    { field: 'created_date', headerName: 'Created Date', width: 170, headerAlign: 'center', align: 'center' },
    { field: 'actions', headerName: 'Action', width: 120, align: 'center', renderCell: (params) => {
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

  columns[0].cellClassName = useStyles().cellText
  columns[1].cellClassName = useStyles().cellText
  columns[2].cellClassName = useStyles().cellText
  columns[3].cellClassName = useStyles().cellText
  columns[4].cellClassName = useStyles().cellText
 
  const dispatch = useDispatch()

  const [allData, setAllData] = React.useState([])
  const [page, setPage] = React.useState(0)
  const [rows, setRows] = React.useState([])
    
  const [pageSize, setPageSize] = React.useState(10)

  const [loading, setLoading] = React.useState(false)

  const handlePageChange = params => {
    setPage(params)
  }

  const loadSeverPrograms = (licenses)=>
  {
    if (licenses.length > 0){
      let promiseList = []
      for (let index = 0; index < licenses.length; index++) {
        promiseList.push(loadCardTemplate(licenses[index]))
      }

      let data_temp = []
      Promise.all(promiseList).then(resultArr=>{
        setAllData(resultArr)
      }).catch(errors => {
        console.log(errors)
      })
    }
  }

   const loadCardTemplate = (arg_license) => {
    const token = localStorage.getItem('token');
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const body = {
      domain: arg_license.domain_name
    }

    return new Promise(resolve => {
       setTimeout(() => {
        const card_URL = serverURL + '/api/allcardprograms';
        axios.post(card_URL, body, { headers })
        .then(response => {
          const programs = response.data.data;
          
          for (let i =0; i < programs.length; i++){
            if (arg_license.program_id == programs[i].program_id){
              arg_license.program_name = programs[i].program_name
              break
            }
          }          
          resolve(arg_license);
        })
        .catch((error) => {
          console.log(error);
          resolve(arg_license)
        }) 
        .finally(()=>{
 //         setLoading(false)
        })
      }, Math.random() * 400 + 100) // simulate network latency
    })
  }
 
   const loadSeverData = ()=>
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
           const licenses = response.data.data;
           setAllData([])
           loadSeverPrograms(licenses)
           resolve(licenses);
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
 
   const loadfromRows = (domaindata)=>{
     const licenses = domaindata.slice(page * pageSize, (page + 1) * pageSize)
     const newCards = licenses.map(item=>{
      item.id = item.license_id
      return item;
    })
    setRows(newCards);
   }

   const filterData = (filter_name) => {
    if (allData.length > 0){
      let resultdata = allData
      if (filter_name){
        resultdata = resultdata.filter((one) => {
          return one.domain_name.includes(filter_name)
        });
      }
      // if (filter_status){
      //   resultdata = resultdata.filter((one) => {
      //       if (filter_status == 'enabled'){
      //           return one.status
      //       } else if (filter_status == 'disabled'){
      //           return !one.status
      //       } else {
      //           return true
      //       }
      //   });
      // }
      resultdata = resultdata.map((one) => {
        if (one.created_date){
          const date_arr = one.created_date.split('T')
          one.created_date = date_arr[0]
        }
        return one
      })
      loadfromRows(resultdata)
    }
  }
  
   React.useEffect(() => {
     let active = true;
     
     loadSeverData()
 
     return () => {
       active = false
     }
   }, [page, data, pageSize, props.reload])

  React.useEffect(() => {
  filterData(props.domain_name);
  }, [props.domain_name, allData])

  const gotoView = data => {
    var selectData ={
      license_id: data.license_id,
      domain_name: data.domain_name,
      start_idcard: data.start_idcard,
      end_idcard: data.end_idcard,
      program_id: data.program_id,
      card_count: data.card_count,
      created_date:data.created_date,
      status: data.status,
    }
    navigate('/admin/licenses/view', {state: selectData});
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
      pageSize={10}
      rowsPerPageOptions={[5, 10, 20]}
      onPageSizeChange={({ page, pageCount, pageSize, rowCount }) => {
        setPageSize(pageSize)
      }}
      
      rowCount={100}
      paginationMode="server"
      onPageChange={handlePageChange}
      loading={loading}
      onCellClick={(data, event) => {
        gotoView(data.row)
      }}
    />
  </div>
)
}

class Licenses extends React.Component {
  constructor(props) {
    super(props)
    const roles = localStorage.getItem('user_role')
    
    this.state = {
      isLogin: true,
      status: '',
      domain_name:'',
      data:[],
      create_roles: roles === 'Administrator'|| roles === 'Program Manager',
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

  onManageDomain = ()=>{
    navigate('/admin/licenses/domains')
  }

  onNewLicense = () => {
    navigate('/admin/licenses/create')
  }

  onDeleteConfirm = (row) => {
    this.setState({openDeleteConfirm: true, del_row: row})
  }

  handleDelete = () => {
    this.setState({openDeleteConfirm: false})
    const token = localStorage.getItem('token')
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = serverURL + '/api/deletelicense'
    const body = {
      license_id: this.state.del_row.license_id,
    };

    this.setState({ showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/admin/licenses')
              })
            }
          } else{
            this.setState({ showLoader: false})
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'This license has deleted', () => {
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
          if (this.alertRef.current) {
            this.alertRef.current.showDialog('', err_str, () => {
              navigate('/admin/licenses')
            })
          }
        })    
  }

  onTapSearch = ()=>{

  }

  render() {
    const { userData, classes } = this.props

    return (
        <MainLayout menuIndex={5} loader={this.state.showLoader}>
          <Grid
            container
            spacing={3}
            style={{ maxWidth: 1250, marginLeft: 'auto', marginRight: 'auto' }}
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
                  <InputLabel htmlFor="filled-basic">Domain Name</InputLabel>
                  <Input
                    id="filled-basic"
                    type={'email'}
                    value={this.state.domain_name}
                    variant="filled"
                    onChange={e => {
                      this.setState({ domain_name: e.target.value })
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle visibility"
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
            <Grid item xs={12}>
              <LicenseDT 
                data={this.state.data}
                domain_name={this.state.domain_name}
                status={this.state.status}
                reload={this.state.reload}
                onConfirm={this.onDeleteConfirm}/>
            </Grid>
            { this.state.create_roles ? 
              <Grid container spacing={3} style={{maxWidth: 1400,marginLeft:'auto', marginRight:'auto'}}>
                <Grid item >
                  <Button
                    variant="contained"
                    size="medium"
                    color="primary"
                    fullWidth
                    onClick={this.onManageDomain}
                    // style={btnStyle}
                  >
                    Manage Domain
                  </Button>
                </Grid>
                <Grid item >
                  <Button
                    variant="contained"
                    size="medium"
                    color="primary"
                    fullWidth
                    onClick={this.onNewLicense}
                    // style={btnStyle}
                  >
                    New License
                  </Button>
                </Grid>
              </Grid> : null }

          </Grid>
          <ConfirmDlg
            title={'Are you sure you want to delete this license?'}
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
    <Licenses
      {...props}
      dispatch={dispatch}
      userData={userData}
      classes={classes}
    />
  )
}
