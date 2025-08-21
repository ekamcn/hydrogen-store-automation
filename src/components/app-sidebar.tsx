"use client"

import { Calendar,  Inbox, Search, Users ,ScrollText, FileText, LogOutIcon, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  { title: "Customers", url: "/allCustomers", icon: Users  },
  { title: "Create Store", url: "/store-creator", icon: ScrollText   },
  { title: "CSV Collection Creator", url: "/csv-collection-creator", icon: FileText },
  { title: "Google Script Form", url: "/google-script-form", icon: Calendar },
  { title: "CSV Product Creator", url: "/product-uploader", icon: FileText },

]

export function AppSidebar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menus</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* {mounted && (
                <SidebarMenuItem key={"theme-toggle"}>
                  <SidebarMenuButton onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <Sun /> : <Moon />}
                    <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )} */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
      <SidebarMenu>
        <SidebarMenuItem key={"logout"} className="mb-5">
          <SidebarMenuButton asChild>
            <a href={"/"}>
              <LogOutIcon />
              <span>Logout</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </Sidebar>
  )
}
