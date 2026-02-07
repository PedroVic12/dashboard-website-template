"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/widgets/Sidebar"
import { Header } from "@/widgets/Header"

export function DashboardLayout({ children, title, subtitle }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0f1c]">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00b4d8]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#0077b6]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00b4d8]/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Header */}
      <Header collapsed={sidebarCollapsed} title={title} subtitle={subtitle} />

      {/* Main Content */}
      <main 
        className={cn(
          "pt-28 pb-8 px-8 transition-all duration-300 relative",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        {children}
      </main>
    </div>
  )
}
