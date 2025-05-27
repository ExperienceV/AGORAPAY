"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const response = await fetch("https://agoserver.a1devhub.tech/home", {
        method: "GET",
        credentials: "include", // Incluir cookies
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log(response)
      if (response.status === 200) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        // Redirigir a login si no está autenticado
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
      setIsAuthenticated(false)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    // Limpiar cookies y redirigir a login
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=a1devhub.tech;"
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=a1devhub.tech;"
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Verificando autenticación...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{isAuthenticated ? "Bienvenido" : "Acceso Denegado"}</CardTitle>
          <CardDescription>
            {isAuthenticated ? "Has iniciado sesión correctamente" : "Redirigiendo al login..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {isAuthenticated ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-lg font-semibold text-green-700">¡Estás autenticado!</p>
              <p className="text-gray-600 text-center">
                Tu sesión está activa y puedes acceder a todas las funcionalidades.
              </p>
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-lg font-semibold text-red-700">No estás autenticado</p>
              <p className="text-gray-600 text-center">Serás redirigido a la página de login en unos segundos...</p>
              <Button onClick={() => router.push("/login")} className="w-full">
                Ir a Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
