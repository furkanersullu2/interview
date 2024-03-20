import { Box, Button, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import axios from 'axios'
import Header from "../../components/Header";
import TextField from '@mui/material/TextField';
import useToken from "../../hooks/useToken"
import { useNavigate } from 'react-router-dom';

const Profile = () => {
const navigate = useNavigate();
  const { first_name, last_name, employee_role, id } = useToken();
  const [tokenData, setTokenData] = useState({
    access_token:'',
    token_type:''
});
  const [updateSelf,setUpdateSelf] = useState({
    id:"",
    first_name:"",
    last_name:"",
    email:"",
    hashed_password:"",
    employee_role:""
  });
  

const handleInputChange = (e) => {
    setUpdateSelf({
    ...updateSelf,
    [e.target.name]: e.target.value,
  });

};


const handleSubmit = async (event) => {
  event.preventDefault();
  try {
    
    const response = await axios.patch(`http://localhost:8000/users/?user_id=${id}`, updateSelf);
    if (response.status === 200) {
        setUpdateSelf({
            first_name:"",
            last_name:"",
            email:"",
            hashed_password:"",
            employee_role:""
      });
    
        setTokenData(response.data);
        console.log("DEBUG")
        console.log(tokenData.access_token)
        localStorage.setItem('token', tokenData.access_token);
        const token = localStorage.getItem('token');
        localStorage.setItem('token', tokenData.access_token);
        const token2 = localStorage.getItem('token');
        
        if (token2){
            navigate("/profile")
        }
          
    }
  } catch (error) {
    console.error('Error fetching data: ', error);
  }
};

useEffect(() => {
    if (tokenData.access_token) {
      console.log(tokenData.access_token);
      localStorage.setItem('token', tokenData.access_token);
      const token = localStorage.getItem('token');
      if (token) {
        navigate("/profile")
      }
    }
  }, [tokenData.access_token, navigate]);
 
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
 
  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="PROFILE" subtitle="Welcome to your profile" />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="80px"
        gap="5px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
        <TextField
          InputLabelProps={{ shrink: true }}
          fullWidth
          variant="filled"
          type="text"
          placeholder={first_name}
          label="Your First Name"
          onChange={handleInputChange}
          value={updateSelf.first_name}
          name="first_name"
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
          InputLabelProps={{ shrink: true }} 
          fullWidth
          variant="filled"
          type="text"
          placeholder={last_name}
          label="Your Last Name"
          onChange={handleInputChange}
          value={updateSelf.last_name}
          name="last_name"
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
          Update</Button>
        </Box>

      </Box>
    </Box>
  );
};

export default Profile;