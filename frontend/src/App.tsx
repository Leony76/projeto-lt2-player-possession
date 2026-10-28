import { Route, Routes } from 'react-router';
import './App.css'
import Home from './pages/Home';
import About from './pages/About';
import Login from './auth/Login';
import Register from './auth/Register';

function App() {
  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={ <Login /> } 
        />

        <Route 
          path="/register" 
          element={ <Register /> } 
        />

        <Route 
          path="/home" 
          element={ <Home /> } 
        />

        <Route 
          path="/about" 
          element={ <About /> } 
        />
      </Routes>
    </>
  );
}

export default App
