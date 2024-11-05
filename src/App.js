import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp'; // Import the SignUp component
// import Welcome from './components/Welcome'; // Uncomment when the component is ready

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/sign-up" element={<SignUp />} /> {/* Add the SignUp route */}
                
                {/* Uncomment the following line when the Welcome component is ready */}
                {/* <Route path="/welcome" element={<Welcome />} /> */}
                
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
