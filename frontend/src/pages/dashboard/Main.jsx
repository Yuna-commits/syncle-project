import React from 'react'
import Header from '../../components/common/Header'
import Sidebar from '../../components/common/Sidebar'
import Dashboard from './Dashboard'

function Main() {
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <Dashboard />
      </div>
    </>
  )
}

export default Main
