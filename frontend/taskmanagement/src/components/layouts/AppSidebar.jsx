"use client"

import { ChevronRight, ChevronsUpDown, User2, Sparkles } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "~/context/userContext"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"
import { Link, useNavigate, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "~/components/ui/sidebar"

import logo from "~/assets/images/tasks.png"
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "~/utils/data"

const AppSidebar = () => {
  const { user, clearUser, loading } = useContext(UserContext)
  const [sideMenuData, setSideMenuData] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useSidebar()

  useEffect(() => {
    if (user) {
      setSideMenuData(user?.role === "admin" ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA)
    }
  }, [user])

  // Check if current path matches menu item
  const isActiveRoute = (url) => {
    return location.pathname === url
  }

  // Check if any submenu item is active
  const hasActiveSubmenu = (children) => {
    return children?.some(child => isActiveRoute(child.url))
  }

  if (loading) {
    return (
      <Sidebar variant="sidebar" collapsible="icon" className="border-r-0">
        <div className="h-full bg-gradient-to-b from-primary/5 to-primary/10 backdrop-blur-sm flex flex-col">
          <div className="flex-1" />
          <SidebarFooter className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="bg-white/50 backdrop-blur-sm">
                  <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
                  <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </div>
      </Sidebar>
    )
  }

  if (!user) return null

  const signOutHandler = () => {
    localStorage.clear()
    clearUser()
    navigate("/login")
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r-0 shadow-xl">
      <div className="h-full bg-gradient-to-b from-primary/5 via-primary/3 to-primary/8 backdrop-blur-sm relative flex flex-col">
        <SidebarHeader>
          <div className="flex justify-center items-center">
            <img src={logo} alt="logo" style={{ width: "75px", height: "auto" }} />
          </div>
        </SidebarHeader>

        {/* Menu Section - Takes remaining space */}
        <SidebarContent className="relative z-10 px-2 flex-1 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel className="text-primary/70 font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <Sparkles className="h-3 w-3" />
              <span className="group-data-[collapsible=icon]:hidden">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Panel
              </span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {sideMenuData?.map((item) =>
                  item?.children?.length > 0 ? (
                    <Collapsible
                      key={item.title}
                      asChild
                      className="group/collapsible"
                      defaultOpen={hasActiveSubmenu(item.children) && state === "expanded"}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={`
                              relative overflow-hidden transition-all duration-300 hover:bg-primary/10 hover:text-primary
                              ${hasActiveSubmenu(item.children) ? 'bg-primary/10 text-primary shadow-sm' : ''}
                              rounded-xl mb-1 group hover:shadow-md
                            `}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative flex items-center w-full">
                              {item.icon && <item.icon className="h-4 w-4" />}
                              <span className="font-medium group-data-[collapsible=icon]:hidden ml-3">{item.title}</span>
                              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                            </div>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="transition-all duration-300 group-data-[collapsible=icon]:hidden">
                          <SidebarMenuSub className="ml-6 mt-2 space-y-1">
                            {item.children.map((sub) => (
                              <SidebarMenuSubItem key={sub.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  className={`
                                    transition-all duration-200 hover:bg-primary/10 hover:text-primary rounded-lg
                                    ${isActiveRoute(sub.url) ? 'bg-primary text-white shadow-md font-medium' : ''}
                                  `}
                                >
                                  <Link to={sub.url} className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-3 transition-colors ${isActiveRoute(sub.url) ? 'bg-white' : 'bg-primary/30'
                                      }`} />
                                    {sub.title}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        className={`
                          relative overflow-hidden transition-all duration-300 hover:bg-primary/10 hover:text-primary
                          ${isActiveRoute(item.url) ? 'bg-primary text-white shadow-lg' : ''}
                          rounded-xl mb-1 group hover:shadow-md
                        `}
                      >
                        <Link to={item.url}>
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative flex items-center">
                            <item.icon className="h-4 w-4" />
                            <span className="font-medium group-data-[collapsible=icon]:hidden ml-3">{item.title}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer - User Profile - Fixed at bottom */}
        <SidebarFooter className="relative z-10 p-2 flex-shrink-0 mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={`${user?.name} - ${user?.email}`}
                    className="
                      bg-white/80 backdrop-blur-sm border border-primary/10 shadow-lg hover:shadow-xl
                      transition-all duration-300 hover:bg-white/90 rounded-xl p-3
                      data-[state=open]:bg-white data-[state=open]:shadow-xl
                    "
                  >
                    <div className="flex items-center w-full">
                      <div className="relative">
                        <Avatar className="h-8 w-8 rounded-xl border-2 border-primary/20 shadow-md">
                          <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                            {user?.profileImageUrl ? (
                              <img src={user.profileImageUrl || "/placeholder.svg"} alt="Profile" className="rounded-xl" />
                            ) : (
                              <User2 className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight ml-3 group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold text-gray-900">{user?.name}</span>
                        <span className="truncate text-xs text-gray-500">{user?.email}</span>
                      </div>
                      <ChevronsUpDown className="ml-auto h-4 w-4 text-gray-400 group-data-[collapsible=icon]:hidden" />
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="right"
                  className="w-[--radix-popper-anchor-width] bg-white/95 backdrop-blur-sm border border-primary/10 shadow-xl"
                >
                  <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 transition-colors">
                    <User2 className="h-4 w-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={signOutHandler}
                    className="cursor-pointer hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}

export default AppSidebar
