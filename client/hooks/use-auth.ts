"use client"

import { useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("https://agoserver.a1devhub.tech/home", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.status === 200) {
        setIsAuthenticated(true)
        // Aquí podrías hacer otra llamada para obtener los datos del usuario
        // o extraerlos del token si el backend los devuelve
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Limpiar cookies
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=a1devhub.tech;"
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=a1devhub.tech;"

    setUser(null)
    setIsAuthenticated(false)

    // Redirigir a login
    window.location.href = "/login"
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    checkAuth,
    logout,
  }
}
