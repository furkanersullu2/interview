import { Box, Typography, useTheme, Button } from "@mui/material";
import {  GridRowModes,
          DataGrid,
          GridToolbarContainer,
          GridActionsCellItem,
          GridRowEditStopReasons
} from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import useToken from "../../hooks/useToken"
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import PlayArrow from '@mui/icons-material/PlayArrow';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';



const Team = () => {
  const [role, setRole] = useState(false);
  const handleChange = (event) => {
    setRole(event.target.value);
  };
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [tokenData, setTokenData] = useState({
    access_token:'',
    token_type:''
});
  const [userData, setUserData] = useState({
    first_name:'',
    last_name:'',
    email:'',
    password:'',
    employee_role:''
  });
  const [rowModesModel, setRowModesModel] = useState({});
  const { first_name, last_name, employee_role, id } = useToken();

  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "first_name",
      headerName: "First Name",
      flex: 1,
      editable:(params) => params.row.employee_role !== "Superadmin",
      //cellClassName: "name-column--cell",
    },
    {
      field: "last_name",
      headerName: "Last Name",
      flex: 1,
      editable:true
    },
    {
      field: "email",
      headerName: "E-mail",
      flex: 1,
    },
    {
      field: "suspended",
      headerName: "Suspended",
      flex: 1,
    },    
    {
      field: "employee_role",
      headerName: "Employee Role",
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              row.employee_role === "Admin"
                ? colors.greenAccent[600]
                : row.employee_role === "Superadmin"
                ? colors.greenAccent[700]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {row.employee_role === "Admin" && <AdminPanelSettingsOutlinedIcon />}
            {row.employee_role === "Superadmin" && <SecurityOutlinedIcon />}
            {row.employee_role === "Basic" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {row.employee_role}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ row,id }) => {

        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (row.employee_role === "Superadmin") {
          if (isInEditMode) {
            return [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                sx={{
                  color: 'greenAccent.main',
                }}
                onClick={handleSaveClick(id)}
              />,
              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />,
            ];
          }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
        ];
        }

          if (isInEditMode) {
            return [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                sx={{
                  color: 'greenAccent.main',
                }}
                onClick={handleSaveClick(id)}
              />,
              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                className="textPrimary"
                onClick={handleCancelClick(id)}
                color="inherit"
              />,
            ];
          }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,

          <>{!row.suspended && <GridActionsCellItem
            icon={<PauseOutlinedIcon />}
            label="Suspend"
            onClick={handleSuspendClick(id)}
            color="inherit"
          />
          }</>,
          <>{row.suspended && <GridActionsCellItem
            icon={<PlayArrow />}
            label="Suspend"
            onClick={handleEnableClick(id)}
            color="inherit"
          />
          }</>,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];

        }
      },
  ];
  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };
  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };
  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };
  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = users.find((row) => row.id === id);
    if (editedRow.isNew) {
      setUsers(users.filter((row) => row.id !== id));
    }
  };
  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setUsers(users.map((row) => (row.id === newRow.id ? updatedRow : row)));
    async function updateUsers(newRow) {
      try {
        const response = await axios.patch(`http://localhost:8000/users/?user_id=${newRow.id}`, newRow);
        if (response.status === 200) {
          setTokenData(response.data);
          console.log("DEBUG")
          console.log(tokenData.access_token)
          localStorage.setItem('token', tokenData.access_token);
          const token = localStorage.getItem('token');
          localStorage.setItem('token', tokenData.access_token);
          const token2 = localStorage.getItem('token');
          
          if (token2){
              navigate("/team")
          }
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    }
    updateUsers(updatedRow);
    return updatedRow; 
  };
  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };
  const handleDeleteClick =  (user_id) => async () => {
    try {
      const response = await axios.delete(`http://localhost:8000/users/?user_id=${user_id}`);
      if (response.status === 200) {
          if(employee_role=="Superadmin"){
        const response1 = await axios.get(`http://localhost:8000/users/all/`)
        .then(response1 => {
          setUsers(response1.data);})}
          else{
        const response2 = await axios.get(`http://localhost:8000/users/`)
        .then(response2 => {
          setUsers(response2.data);})
          }
        }

      
    } catch (error) {
      console.error('Error deleting data: ', error);
    }
  
  };

  const handleSuspendClick =  (user_id) => async () => {
    try {
      const response = await axios.patch(`http://localhost:8000/users/suspend/?suspended_user_id=${user_id}&suspender_id=${id}`);
      if (response.status === 200) {
          if(employee_role=="Superadmin"){
        const response1 = await axios.get(`http://localhost:8000/users/all/`)
        .then(response1 => {
          setUsers(response1.data);})}
          else{
        const response2 = await axios.get(`http://localhost:8000/users/`)
        .then(response2 => {
          setUsers(response2.data);})
          }
        }

      
    } catch (error) {
      console.error('Error deleting data: ', error);
    }
  
  };

  const handleEnableClick =  (user_id) => async () => {
    try {
      if(employee_role=="Admin"){
        const response = await axios.patch(`http://localhost:8000/users/enable/?suspended_user_id=${user_id}&suspender_id=${id}`);
        if (response.status === 200) {
          if(employee_role=="Superadmin"){
        const response1 = await axios.get(`http://localhost:8000/users/all/`)
        .then(response1 => {
          setUsers(response1.data);})}
          else{
        const response2 = await axios.get(`http://localhost:8000/users/`)
        .then(response2 => {
          setUsers(response2.data);})
          }
        }
      }
      if(employee_role=="Superadmin"){
        const response = await axios.patch(`http://localhost:8000/users/enable/sa/?suspended_user_id=${user_id}`);
        if (response.status === 200) {
          if(employee_role=="Superadmin"){
        const response1 = await axios.get(`http://localhost:8000/users/all/`)
        .then(response1 => {
          setUsers(response1.data);})}
          else{
        const response2 = await axios.get(`http://localhost:8000/users/`)
        .then(response2 => {
          setUsers(response2.data);})
          }
        }}
     
    } catch (error) {
      console.error('Error deleting data: ', error);
    }
  
  };  
  useEffect(() => {
    if (tokenData.access_token) {
      console.log(tokenData.access_token);
      localStorage.setItem('token', tokenData.access_token);
      const token = localStorage.getItem('token');
      if (token) {
        navigate("/team")
      }
    }
  }, [tokenData.access_token, navigate]);

  useEffect(  () => {
    async function fetchData() {
      if(employee_role=="Superadmin"){
        const response1 = await axios.get(`http://localhost:8000/users/all/`)
        .then(response1 => {
          setUsers(response1.data);})}
          else{
        const response2 = await axios.get(`http://localhost:8000/users/`)
        .then(response2 => {
          setUsers(response2.data);})
          }}
        fetchData();
        }, [employee_role,setUsers]);
    
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      userData.employee_role=role;
      const response = await axios.post('http://localhost:8000/auth/', userData);
      if (response.status === 201) {
        setUserData({
          first_name:'',
          last_name:'',
          email:'',
          password:'',
          employee_role:''
        });
        if(employee_role=="Admin"){
          const response = await axios.get('http://localhost:8000/users/')
          .then(response => {
            setUsers(response.data);})}
          else{
            const response = await axios.get('http://localhost:8000/users/all/')
          .then(response => {
            setUsers(response.data);})}}
          
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };
  useEffect(  () => {
    async function fetchUsers() {
    if(employee_role==="Admin"){
      const response = await axios.get('http://localhost:8000/users/')
      .then(response => {
        setUsers(response.data);})}
      else{
        const response = await axios.get('http://localhost:8000/users/all')
      .then(response => {
        setUsers(response.data);})}}
        fetchUsers();
      }, [employee_role]);

  const handleInputChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  
  };

      return (
    <Box m="20px">
      <Box>
      <Header title="TEAM" subtitle="Managing the Team Members" />
      </Box>
      <Box
      display="grid"
      gridTemplateColumns="repeat(12, 1fr)"
      gridAutoRows="80px"
      gap="5px"
    >
        {/* ROW 1 */}
        {employee_role != "Admin" && <>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
        <TextField
          fullWidth
          variant="filled"
          type="text"
          label="First Name"
          onChange={handleInputChange}
          value={userData.first_name}
          name="first_name"
          sx={{ gridColumn: "span 2" }}
        />

        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
        <TextField
          fullWidth
          variant="filled"
          type="text"
          label="Last Name"
          onChange={handleInputChange}
          value={userData.last_name}
          name="last_name"
          sx={{ gridColumn: "span 2" }}
        />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
        <TextField
          fullWidth
          variant="filled"
          type="text"
          label="E-mail"
          onChange={handleInputChange}
          value={userData.email}
          name="email"
          sx={{ gridColumn: "span 2" }}
        />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
        <TextField
          fullWidth
          variant="filled"
          type="text"
          label="Password"
          onChange={handleInputChange}
          value={userData.password}
          name="password"
          sx={{ gridColumn: "span 2" }}
        />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
        <FormControl fullWidth>
          <InputLabel 
            id="demo-simple-select-label"
            color="secondary">Role
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={role}
            label="Role"
            onChange={handleChange}
          >
            <MenuItem value={"Basic"}>Basic</MenuItem>
            <MenuItem value={"Admin"}>Admin</MenuItem>
            <MenuItem value={"Superadmin"}>Superadmin</MenuItem>
          </Select>
        </FormControl>
        </Box>
        <Box 
          component="form" noValidate 
          onSubmit={handleSubmit}
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
         <Button 
         type="submit"
         onSubmit={handleSubmit} 
         variant="contained">
          Create</Button>
        </Box>
        </>
        }      
        {/* ROW 2 */}
        <Box //BACKGROUND BOX
          gridColumn="span 12"
          gridRow="span 6"
          backgroundColor={colors.primary[400]}
          sx={{ height: 400, width: '100%' }}
        >
        <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
          <DataGrid
            rows={users}
            columns={columns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            slotProps={{
              toolbar: { setUsers, setRowModesModel },
            }}
              />  
              </Box>
      </Box>
    </Box>
    </Box>

  );
};

export default Team;