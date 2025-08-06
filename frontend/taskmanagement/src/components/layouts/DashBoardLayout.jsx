"use client"

import React, { useContext } from "react"
import AppSidebar from "~/components/layouts/AppSidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { UserContext } from "~/context/userContext"
import { Menu } from 'lucide-react'

const DashBoardLayout = ({ children }) => {
  const { user } = useContext(UserContext)

  if (!user) return null

  return (
    <SidebarProvider 
      style={{
        "--sidebar-width": "18rem", 
        "--sidebar-width-icon": "4rem", 
        "--sidebar-width-mobile": "20rem"
      }}
    >
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
        <AppSidebar />
        <SidebarInset className="flex-1 m-0 rounded-none shadow-none bg-transparent">
          <div className="p-6">
            {/* Enhanced Header */}
            <div className="flex items-center gap-4 mb-6">
              <SidebarTrigger className="
                -ml-1 p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-primary/10 
                shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white/90
                hover:border-primary/20 group
              ">
                <Menu className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
              </SidebarTrigger>
              
              {/* Breadcrumb or Page Title could go here */}
              <div className="flex-1">
                <div className="h-px bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 min-h-[calc(100vh-8rem)]">
                <div className="p-6">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default DashBoardLayout
