import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Profile from "./scenes/profile";
import Team from "./scenes/team";
import SignIn from "./scenes/login-signup/SignIn";
import SignUp from "./scenes/login-signup/SignUp";
import { AuthProvider } from "./AuthContext/AuthContext";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import PrivateRoute from "./routes/privateroute";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);


  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
          <AuthProvider>
              <div className="app">
                <Sidebar isSidebar={isSidebar} />
                  <main className="content">
                    <Topbar setIsSidebar={setIsSidebar} />
                      <Routes>
                        <Route path="/" element={<SignIn/> } />
                        <Route path="/signup" element={<SignUp/> } />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route element={<PrivateRoute/>}>
                          <Route path="/team" element={<Team />} />
                        </Route>
                      </Routes>
                  </main>
              </div>
          </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;