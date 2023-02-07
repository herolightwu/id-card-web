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

const API_URL = serverURL + '/api/domains/';

export function DomainDT(props) {  
  var datarows = props.data;

   const data = React.useRef({
   columns: columns,
   rows : datarows,
   rowLength: 100,
   maxColumns: 4,
  });

  const columns = [
    { field: 'domain_id', headerName: 'ID', width: 100, headerAlign: 'center', align: 'center' },
    { field: 'domain_name', headerName: 'Domain', width: 300 , headerAlign: 'center', align: 'center'},
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
 
  const dispatch = useDispatch()

  const [allData, setAllData] = React.useState([])
  const [page, setPage] = React.useState(0)
  const [rows, setRows] = React.useState([])
    
  const [pageSize, setPageSize] = React.useState(10)

  const [loading, setLoading] = React.useState(false)

  const handlePageChange = params => {
    setPage(params)
  }

const loadSeverData = ()=> {
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
        const domainlist = response.data.data;
        setAllData(domainlist)
        resolve(domainlist);
      })
      .catch((error) => {
        console.log(error);
        return null;
      }) 
      .finally(()=>{
        setLoading(false)
      })
    }, Math.random() * 400 + 100) // simulate network latency
  })
}
 
const loadfromRows = (domaindata) => {
    const domains = domaindata.slice(page * pageSize, (page + 1) * pageSize)
    const newCards = domains.map(item=>{
    item.id = item.domain_id
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
  let selectData ={
      domain_id: data.domain_id,
      domain_name: data.domain_name,
      isAdd: false,
    }
  navigate('/admin/licenses/domain', {state: selectData});
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

class Domains extends React.Component {
  constructor(props) {
    super(props)
    const roles = localStorage.getItem('user_role')
    
    this.state = {
      isLogin: true,
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

  onNewDomain = ()=>{
    let selectData ={
        domain_id: -1,
        domain_name: '',
        isAdd: true,
      }
     navigate('/admin/licenses/domain', {state: selectData});
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
    
    const urlAPI = serverURL + '/api/deletedomain'
    const body = {
      domain_id: this.state.del_row.domain_id
    };

    this.setState({ showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/admin/licenses/domains')
              })
            }
          } else{
            this.setState({ showLoader: false})
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'This domain has deleted', () => {
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
              navigate('/admin/licenses/domains')
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
            style={{ maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}
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
            

            <Grid item xs={12}>
              <DomainDT 
                data={this.state.data}
                domain_name={this.state.domain_name}
                reload={this.state.reload}
                onConfirm={this.onDeleteConfirm}
              />
            </Grid>
            { this.state.create_roles ? 
              <Grid container spacing={3} style={{maxWidth: 1400,marginLeft:'auto', marginRight:'auto'}}>
                <Grid item md={2} sm={3} xs={12}>
                  <Button
                    variant="contained"
                    size="medium"
                    color="primary"
                    fullWidth
                    onClick={this.onNewDomain}
                    // style={btnStyle}
                  >
                    New Domain
                  </Button>
                </Grid>                
              </Grid> : null }
          </Grid>
          <ConfirmDlg
            title={'Are you sure you want to delete this domain?'}
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
    <Domains
      {...props}
      dispatch={dispatch}
      userData={userData}
      classes={classes}
    />
  )
}
