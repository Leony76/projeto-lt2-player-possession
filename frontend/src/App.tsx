import { Route, Routes } from 'react-router';
import './App.css'
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import Profile from './pages/Profile';
import Items from './pages/Items';
import MyItems from './pages/MyItems';
import ItemDetails from './pages/ItemDetails';
import ContactProfile from './pages/ContactProfile';
import Contacts from './pages/Contacts';
import MyContacts from './pages/MyContacts';
import ContactContacts from './pages/ContactContacts';
import ContactItems from './pages/ContactItems';
import type React from 'react';
import Layout from './pages/Layout';

function App(): React.JSX.Element {
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
          <Route element={<Layout/>}>
            <Route 
              path="/home" 
              element={ <Home /> } 
            />     

            <Route 
              path="/profile" 
              element={ <Profile /> } 
            />

            <Route 
              path="/contact/:id" 
              element={ <ContactProfile /> } 
            />

            <Route 
              path="/items" 
              element={ <Items /> } 
            /> 

            <Route 
              path="/my-items" 
              element={ <MyItems /> } 
            /> 

            <Route
              path="/item/:id"
              element={<ItemDetails />}
            />

            <Route
              path="/contacts"
              element={<Contacts />}
            />

            <Route
              path="/contact/:id/contacts"
              element={<ContactContacts />}
            />

            <Route
              path="/contact/:id/items"
              element={<ContactItems />}
            />

            <Route
              path="/my-contacts"
              element={<MyContacts />}
            />

            <Route 
              path="/about" 
              element={ <About /> } 
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App
