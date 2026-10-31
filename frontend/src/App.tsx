import { Route, Routes } from 'react-router';
import './App.css'
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import { ProtectedRoute } from './components/routes/ProtectedRoute';

function App() {
  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={ <SignIn /> } 
        />

        <Route 
          path="/sign-up" 
          element={ <SignUp /> } 
        />

        <Route element={<ProtectedRoute/>}>
          <Route 
            path="/home" 
            element={ <Home /> } 
          />

          <Route 
            path="/about" 
            element={ <About /> } 
          />
        </Route>
      </Routes>
    </>
  );
}

export default App
