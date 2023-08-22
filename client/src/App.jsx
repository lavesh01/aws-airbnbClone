import './App.css'

import { Route, Routes } from 'react-router-dom'

import BookingPage from './pages/BookingPage'
import BookingsPage from './pages/BookingsPage'
import IndexPage from './pages/IndexPage'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import PlacePage from './pages/PlacePage'
import PlacesFormPage from './pages/PlacesFormPage'
import PlacesPage from './pages/PlacesPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import { UserContextProvider } from './UserContext'
import axios from 'axios'

axios.defaults.baseURL= import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

function App() {

  return (
    <> 
    <UserContextProvider>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/account/:subpage?' element={<ProfilePage />} />
          <Route path='/account/places' element={<PlacesPage />} />
          <Route path='/account/places/new' element={<PlacesFormPage />} />
          <Route path='/account/places/:id' element={<PlacesFormPage />} />
          <Route path='/account/bookings/' element={<BookingsPage />} />
          <Route path='/account/bookings/:id' element={<BookingPage />} />
          <Route path='/place/:id' element={<PlacePage />} />
        </Route>
      </Routes>
    </UserContextProvider>
    </>
  )
}


export default App
