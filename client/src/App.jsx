
import React, { useContext } from 'react'
import { Routes,Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import Profile from './pages/Profile'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext'


const App = () => {
  
  const { authUser } = useContext(AuthContext)
  
  return (
    <div className="bg-[url('./src/assets/bgImage.svg')]">
      <Toaster/>
      <Routes>
        <Route path='/' element= {authUser ? <HomePage/> : <Navigate to='/login'/>} />
        <Route path='/login' element={!authUser ? <LoginPage/> : <Navigate to='/'/>} />
        <Route path='/profile' element={authUser ? <Profile/> : <Navigate to='/login'/>} />

      </Routes>
    </div>
  )
}

export default App
