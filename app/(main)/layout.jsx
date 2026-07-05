import React from 'react'
import AppHeader from './_components/AppHeader'

function DashboardLayout({ children }) {
  return (
    <div className="w-full min-h-screen">
      <AppHeader />

      {/* FULL-WIDTH CONTENT AREA */}
      <div className="mt-14 px-6 md:px-10">
        {children}
      </div>
    </div>
  )
}

export default DashboardLayout
