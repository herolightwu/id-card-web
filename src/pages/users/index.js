import React from 'react'

import { navigate } from 'gatsby'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { DataGrid } from '@material-ui/data-grid'
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
import AlertDialog from '../../components/Dialog/AlertDialog'
import { ConfirmDlg } from '../../components/Dialog/PhotoPickerDlg'
import { VColor } from '../../utils/constants'
import { Grid } from '@material-ui/core'
import {serverURL} from '../../utils/RestAPI'

const API_URL = serverURL + '/api/users/';

export function UsersDT(props) {  

 var userrows = props.data;
 userrows = userrows.map((row) => {
  row.id = row.user_id;
   return row
 });

 const data = React.useRef({
  columns: columns,
  rows : userrows,
  rowLength: 100,
  maxColumns: 8,
 });

 const columns = [
  { field: 'email', headerName: 'Email', width: 240 },
  { field: 'first_name', headerName: 'First Name', width: 200 },
  { field: 'last_name', headerName: 'Last Name', width: 180 },  
  { field: 'user_status', headerName: 'Status', width: 140, hide: true },
  { field: 'id', headerName: 'ID', width: 100 },
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

  const [allUsers, setAllUsers] = React.useState([])
  const [page, setPage] = React.useState(0)
  const [rows, setRows] = React.useState([])
  
  const [pageSize, setPageSize] = React.useState(10)

  const [loading, setLoading] = React.useState(false)

  const handlePageChange = params => {
    setPage(params)
  }

  const loadSeverUserData = ()=>
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
          const users = response.data.data;
          setAllUsers(users)
          resolve(users);
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

  const loadfromUserRows = (userdata)=>{
    const users = userdata.slice(page * pageSize, (page + 1) * pageSize)
    const newUsers = users.map(user=>{
      user.id= user.user_id;
      return user;
    })

    setRows(newUsers);
  }

  const filterUserData = (filter_mail, filter_status) => {
    if (allUsers.length > 0){
      // console.log('All Users : ', allUsers)
      let resultdata = allUsers
      resultdata = resultdata.filter((user) => {
        return !user.user_role.includes('Administrator')
      })
      if (filter_mail){
        resultdata = resultdata.filter((user) => {
          return user.email.includes(filter_mail)
        });
      }
      if (filter_status){
        resultdata = resultdata.filter((user) => {
          return user.user_status == filter_status
        });
      }
      loadfromUserRows(resultdata)
    }
  }

  React.useEffect(() => {
    let active = true;

    loadSeverUserData();

    return () => {
      active = false
    }
  }, [page, data, pageSize, props.reload])

  React.useEffect(() => {
    filterUserData(props.email, props.status);
  }, [props.email, props.status, allUsers])

  const gotoUserView = data => {
    var selectUser ={
      id: data.user_id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      user_role: data.user_role,
      user_status: data.user_status,
      user_permissions: data.user_permissions,
      user_programs: data.user_programs,
      created_date:data.created_date
    }
    // console.log("sel data:", selectUser)
    navigate('/users/view', {state: selectUser});
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
        checkboxSelection
        paginationMode="server"
        onPageChange={handlePageChange}
        loading={loading}
        onCellClick={(data, event) => {
          gotoUserView(data.row)
        }}
      />
    </div>
  )
}

class Users extends React.Component {
  constructor(props) {
    super(props)
    const roles = localStorage.getItem('user_role')
    this.state = {
      isLogin: true,
      status: '',
      email:'',
      users:[],
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

  onNewUser = ()=>{
    var newUser ={
      id: 0,
      email: '',
      first_name: '',
      last_name: '',
      user_role: '',
      user_status: true,
      user_permissions: '',
      user_programs: '',
      created_date: '01-01-2020'
    }
    navigate('/users/create/',{state: newUser})
  }

  onDeleteConfirm = (row) => {
    this.setState({openDeleteConfirm: true, del_row: row})
  }

  handleDelete = () => {
    this.setState({ openDeleteConfirm: false })
    if (!this.state.create_roles){
      if (this.alertRef.current) {
        this.alertRef.current.showDialog('', 'No permission to delete this user', () => {    
        })
      }
      return
    }
    const token = localStorage.getItem('token')
    const beartoken = "Bearer " + token;
    const headers = { 
      'Authorization': beartoken
    };
    
    const urlAPI = serverURL + '/api/deleteuser/' + this.state.del_row.user_id
    const body = {
      user_id: this.state.del_row.user_id,
    };
    
    this.setState({ showLoader: true })
    axios.put(urlAPI, body, { headers })
        .then(response => {
          this.setState({ showLoader: false })
          if(response.data.status ==='unauthorized'){
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', response.data.message.toString(), () => {
                navigate('/users')
              })
            }
          } else{
            this.setState({ showLoader: false})
            if (this.alertRef.current) {
              this.alertRef.current.showDialog('', 'This user has deleted', () => {
                this.setState({reload: !this.state.reload})
              })
            } else {
              this.setState({reload: !this.state.reloadue})
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
              navigate('/users')
            })
          }
        })    
  }

  onTapSearch = ()=>{
    
  }
  
  render() {
    const { userData, classes } = this.props

    return (
        <MainLayout menuIndex={4} loader={this.state.showLoader}>
          <Grid
            container
            spacing={3}
            style={{ maxWidth: 950, marginLeft: 'auto', marginRight: 'auto' }}
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
                  <InputLabel htmlFor="filled-basic">Email Address</InputLabel>
                  <Input
                    id="filled-basic"
                    type={'email'}
                    value={this.state.email}
                    variant="filled"
                    onChange={e => {
                      this.setState({ email: e.target.value })
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
                  <MenuItem value={''}>All</MenuItem>
                  <MenuItem value={'enabled'}>Enabled</MenuItem>
                  <MenuItem value={'disabled'}>Disabled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <UsersDT 
                  data={this.state.users}
                  email={this.state.email}
                  status={this.state.status}
                  reload={this.state.reload}
                  onConfirm={this.onDeleteConfirm}
                />
            </Grid>
            { this.state.create_roles? 
              <Grid item md={2} sm={3} xs={12}>
                <Button
                  variant="contained"
                  size="medium"
                  color="primary"
                  fullWidth
                  onClick={this.onNewUser}
                >
                  New User
                </Button>
              </Grid> : null }
            
          </Grid>
          <ConfirmDlg
            title={'Are you sure you want to delete this user?'}
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
    <Users
      {...props}
      dispatch={dispatch}
      userData={userData}
      classes={classes}
    />
  )
}
