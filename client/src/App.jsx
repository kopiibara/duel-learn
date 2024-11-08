import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './assets/pages/Login';
import SignUp from './assets/pages/SignUp';
import axios from 'axios';
import Welcome from './assets/pages/Welcome';
import { Toaster } from 'react-hot-toast';
import './styles.css'
import {UserContextProvider} from '../context/userContext'

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" reverseOrder={false} toastOptions={{duration: 2000}}/> {/* Place Toaster here */}
    </UserContextProvider>
  )
}

export default App;
