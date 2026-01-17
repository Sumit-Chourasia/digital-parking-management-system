import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Bookings from './pages/Bookings'
import Auth from './components/Auth'
import Header from './components/Header'

export default function App(){
  return (
    <div>
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/bookings" element={<Bookings/>} />
          <Route path="/login" element={<Auth/>} />
        </Routes>
      </div>
    </div>
  )
}
