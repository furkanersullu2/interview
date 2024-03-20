import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import {  GridRowModes,
          DataGrid,
          GridToolbarContainer,
          GridActionsCellItem,
          GridRowEditStopReasons
} from "@mui/x-data-grid";

import { useState, useEffect } from "react";
import axios from 'axios'
import Header from "../../components/Header";
import TextField from '@mui/material/TextField';
import useToken from "../../hooks/useToken"
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';



const Dashboard = () => {
  const [rowModesModel, setRowModesModel] = useState({});
  const { first_name, last_name, employee_role, id } = useToken();
  const [editable,setEditable]=useState(true);

  useEffect(() => {
    if (employee_role === "Basic") {
      setEditable(false);
    }
  }, [employee_role]);

  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "item_name",
      headerName: "Item Name",
      flex: 1,
      editable:editable
      //cellClassName: "item-name-column--cell",
    },
    {
      field: "item_description",
      headerName: "Item Description",
      flex: 1,
      editable:editable
    },
    {
      field: "item_data",
      headerName: "Item Data",
      flex: 1,
      editable:editable
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
      if (editable){
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
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];

        } else{
            return[
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={handleDeleteClick(id)}
                color="inherit"
              />,
            ]
        }
      },
    },
  ];



  const [itemData, setItemData] = useState({
    item_name:'',
    item_description:'',
    item_data:'',
    creator_id:''
  });
  itemData.creator_id=id.toString();
  const [items, setItems] = useState([]);

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

    const editedRow = items.find((row) => row.id === id);
    if (editedRow.isNew) {
      setItems(items.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setItems(items.map((row) => (row.id === newRow.id ? updatedRow : row)));
    async function updateItems(newRow) {
      try {
        const response = await axios.patch(`http://localhost:8000/items/?item_id=${newRow.id}`, newRow);
        if (response.status === 200) {
                 
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    }
    updateItems(updatedRow);
    return updatedRow; 
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

const handleInputChange = (e) => {
  setItemData({
    ...itemData,
    [e.target.name]: e.target.value,
  });

};

const handleDeleteClick =  (item_id) => async () => {
  try {
    console.log(item_id)
    const response = await axios.delete(`http://localhost:8000/items/?item_id=${item_id}`);
    if (response.status === 200) {
      if(employee_role=="Basic"){
      const response = await axios.get(`http://localhost:8000/items/?creator_id=${id}`)
      .then(response => {
        setItems(response.data);})}
      else{
        const response = await axios.get('http://localhost:8000/items/all')
      .then(response => {
        setItems(response.data);})}
      }
    
  } catch (error) {
    console.error('Error deleting data: ', error);
  }

};

const handleSubmit = async (event) => {
  event.preventDefault();
  try {
    
    const response = await axios.post('http://localhost:8000/items/', itemData);
    if (response.status === 200) {
      setItemData({
        item_name:'',
        item_description:'',
        item_data:''
      });
      if(employee_role=="Basic"){
        const response = await axios.get(`http://localhost:8000/items/?creator_id=${id}`)
        .then(response => {
          setItems(response.data);})}
        else{
          const response = await axios.get('http://localhost:8000/items/all')
        .then(response => {
          setItems(response.data);})}
        }
  } catch (error) {
    console.error('Error fetching data: ', error);
  }
};




useEffect(  () => {
  async function fetchData() {
  if(employee_role==="Basic"){
    const response = await axios.get(`http://localhost:8000/items/?creator_id=${id}`)
    .then(response => {
      setItems(response.data);})}
    else{
      const response = await axios.get('http://localhost:8000/items/all')
    .then(response => {
      setItems(response.data);})}}
      fetchData();
    }, [employee_role,id]);
  

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
 
  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="80px"
        gap="5px"
      >
        {/* ROW 1 */}
        {employee_role != "Admin" && <>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
        <TextField
          fullWidth
          variant="filled"
          type="text"
          label="Item Name"
          onChange={handleInputChange}
          value={itemData.item_name}
          name="item_name"
          sx={{ gridColumn: "span 2" }}
        />

        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
        <TextField
          fullWidth
          variant="filled"
          type="text"
          label="Item Description"
          onChange={handleInputChange}
          value={itemData.item_description}
          name="item_description"
          sx={{ gridColumn: "span 2" }}
        />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
        <TextField
          fullWidth
          variant="filled"
          type="text"
          label="Item Data"
          onChange={handleInputChange}
          value={itemData.item_data}
          name="item_data"
          sx={{ gridColumn: "span 2" }}
        />
        </Box>
        <Box 
          component="form" noValidate 
          onSubmit={handleSubmit}
          gridColumn="span 3"
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
            height="56vh"
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
            rows={items}
            columns={columns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            slotProps={{
              toolbar: { setItems, setRowModesModel },
            }}
              />  

          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;