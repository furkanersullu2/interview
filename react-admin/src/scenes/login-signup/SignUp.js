import * as React from 'react';
import { useState } from "react";
import axios from 'axios'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Formik } from "formik";
import * as yup from "yup";


function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://www.solarvis.co/">
        solarVis
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}
const defaultTheme = createTheme();

export default function SignUp() {
  //const { validateForm } = useFormikContext();
  const [errorMessage, setErrorMessage] = useState("");
  const [role, setRole] = useState(false);
  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name:'',
    last_name:'',
    email:'', 
    password:'',
    employee_role:''
});
const handleInputChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};


const handleSubmit = async (event) => {
  try{
  event.preventDefault();
  formData.employee_role=role;
    if(isEmailValid(formData.email)){
      const response = await axios.post('http://localhost:8000/auth/', formData);
      if (response.status === 201) {
        navigate("/")
        }
    }
  }
  catch(error){
    if (error.response?.status === 409){
      setErrorMessage("This email address has been registered before. Please use a different email.")  }
    else{
      setErrorMessage("An error occurred while processing the request. Please try again.");}
  }

};
  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Formik
            onSubmit={handleSubmit}
            initialValues={initialValues}
            validationSchema={checkoutSchema}
          >
            {({
              errors,
              touched,
              handleBlur,
              handleChange,
            }) => (
              <form onSubmit={handleSubmit}>
            <Box  sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="given-name"
                    name="first_name"
                    required
                    fullWidth
                    id="first_name"
                    label="First Name"
                    type="text"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    error={!!touched.first_name && !!errors.first_name}
                    helperText={touched.first_name && errors.first_name}
                    value={formData.first_name}
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    error={!!touched.last_name && !!errors.last_name}
                    helperText={touched.last_name && errors.last_name}
                    required
                    fullWidth
                    id="last_name"
                    label="Last Name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    autoComplete="family-name"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    onChange={(event) => 
                      {handleInputChange(event);
                        handleChange(event);}}
                    onBlur={handleBlur}
                    error={!!touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    required
                    fullWidth
                    type="text"
                    id="email"
                    label="Email Address"
                    name="email"
                    value={formData.email}
                    autoComplete="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    error={!!touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="text"
                    id="password"
                    value={formData.password}
                    autoComplete="new-password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Role</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={role}
                      label="Role"
                      onChange={handleRoleChange}
                    >
                      <MenuItem value={"Basic"}>Basic</MenuItem>
                      <MenuItem value={"Admin"}>Admin</MenuItem>
                      <MenuItem value={"Superadmin"}>Superadmin</MenuItem>
                    </Select>
                  </FormControl>



                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
              
              {errorMessage && (
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography color="error">{errorMessage}</Typography>
              </Box>
              )}

              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="/" variant="body2">
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Box>
            </form>
            )}
            </Formik>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}

const checkoutSchema = yup.object().shape({
  first_name: yup.string().required("required"),
  last_name: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  password: yup.string(),
  employee_role: yup.string(),
});
const initialValues = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  employee_role: ""
};

function isEmailValid(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  console.log(emailRegex.test(email));
  return emailRegex.test(email);
}