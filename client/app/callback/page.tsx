"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function CallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Procesando autenticación...")
  const router = useRouter()

  useEffect(() => {
    // Simular el procesamiento del callback
    // En este punto, el backend ya debería haber establecido las cookies
    const timer = setTimeout(() => {
      // Verificar si las cookies fueron establecidas
      const hasAccessToken = document.cookie.includes("access_token")
      const hasRefreshToken = document.cookie.includes("refresh_token")

      if (hasAccessToken && hasRefreshToken) {
        setStatus("success")
        setMessage("¡Autenticación exitosa!")

        // Redirigir a la página principal después de 2 segundos
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        setStatus("error")
        setMessage("Error en la autenticación. No se pudieron establecer las credenciales.")
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  const handleRetry = () => {
    router.push("/login")
  }

  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Procesando..."}
            {status === "success" && "¡Éxito!"}
            {status === "error" && "Error"}
          </CardTitle>
          <CardDescription>Callback de autenticación de GitHub</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
              <p className="text-gray-600 text-center">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-lg font-semibold text-green-700">{message}</p>
              <p className="text-gray-600 text-center">Serás redirigido a la página principal...</p>
              <Button onClick={handleGoHome} className="w-full">
                Ir a Inicio
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-lg font-semibold text-red-700">{message}</p>
              <p className="text-gray-600 text-center">Por favor, intenta iniciar sesión nuevamente.</p>
              <Button onClick={handleRetry} className="w-full">
                Volver a Intentar
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
