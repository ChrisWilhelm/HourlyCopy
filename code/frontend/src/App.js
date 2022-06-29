import React, { useEffect, useState } from 'react';
import AppHeader from './components/app-header/AppHeader';
import Login from './pages/Login';
import ViewCourses from './pages/ViewCourses';
import SignUp from './pages/SignUp';
import { Container } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthCourses } from './pages/AuthCourses';
import { AuthCalendar } from './pages/AuthCalendar';
import MyPage from './pages/MyPage';
import Analytics from './pages/Analytics';
import Topics from './pages/Topics';
import AccountInfo from './pages/AccountInfo';
import Roster from './pages/Roster';
import { getMe } from './utils/requests/users';
import { ToastContainer, errorToast } from './utils/toast';
import Feedback from './pages/Feedback';
import CourseDetails from './pages/CourseDetails';
import { ThemeProvider } from '@mui/material';
import theme from './theme';
import Homepage from './pages/Homepage';
import Calendar from './pages/Calendar';
import Queue from './pages/Queue';

function App(props) {
  const [authenticated, setAuthentication] = useState(false);
  const [userToken, setToken] = useState(null);
  const [user, setUser] = useState({});
  const [homepage, setHomepage] = useState(true);

  // If user is logged in, get account information
  useEffect(() => {
    const getTokenUser = async () => {
      if (userToken) {
        getMe(userToken)
          .then((res) => {
            if (res.status === 200) {
              setUser(res.data);
            }
          })
          .catch((err) => {
            errorToast(err);
          });
      }
    };
    getTokenUser();
  }, [userToken]);

  // Set authenticated false when userToken null
  useEffect(() => {
    if (!userToken) {
      setAuthentication(false);
    }
  }, [userToken, setAuthentication]);

  return (
    <ThemeProvider theme={theme}>
      <Container
        sx={{ margin: 0, minWidth: '100vw', height: '100vh' }}
        disableGutters
      >
        <BrowserRouter>
          {!homepage && (
            <AppHeader
              text="Hourly"
              fontWeight="700"
              margin="0px"
              setToken={setToken}
              token={userToken}
              homepage={homepage}
            />
          )}
          <Routes>
            <Route path="/" element={<Homepage setHomepage={setHomepage} />} />
            <Route
              path="/login"
              element={
                <Login
                  setAuth={setAuthentication}
                  setToken={setToken}
                  setHomepage={setHomepage}
                />
              }
            />
            <Route
              path="/signup"
              element={
                <SignUp
                  setAuth={setAuthentication}
                  setToken={setToken}
                  setHomepage={setHomepage}
                />
              }
            />
            <Route
              path="/courses"
              element={
                <AuthCourses auth={authenticated}>
                  <ViewCourses token={userToken} />
                </AuthCourses>
              }
            />
            <Route
              path="/calendar"
              element={
                <AuthCalendar auth={authenticated}>
                  <Calendar token={userToken} accountid={user.accountid} />
                </AuthCalendar>
              }
            />
            <Route
              path="/registrations"
              element={
                <MyPage
                  header="My Registrations"
                  token={userToken}
                  type="registration"
                />
              }
            />
            <Route
              path="/office-hours"
              element={
                <MyPage
                  header="My Office Hours"
                  token={userToken}
                  type="office"
                />
              }
            />
            <Route path="/queue" element={<Queue token={userToken} />} />
            <Route path="/topics" element={<Topics token={userToken} />} />
            <Route
              path="/analytics"
              element={<Analytics token={userToken} />}
            />
            <Route
              path="/info"
              element={<AccountInfo token={userToken} setToken={setToken} />}
            />
            <Route
              path="/roster"
              element={<Roster token={userToken} user={user} />}
            />
            <Route
              path="/feedback"
              element={<Feedback token={userToken} user={user} />}
            />
            <Route
              path="/details"
              element={<CourseDetails token={userToken} user={user} />}
            />
          </Routes>
        </BrowserRouter>
      </Container>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;
