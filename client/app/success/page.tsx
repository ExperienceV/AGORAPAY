"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, AlertCircle, CreditCard } from "lucide-react"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [authorizationId, setAuthorizationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConfirmed, setIsConfirmed] = useState(false)

  useEffect(() => {
    const id = searchParams.get("authorization_id")
    if (id) {
      setAuthorizationId(id)
      setIsLoading(false)
    } else {
      setError("No se encontró el ID de autorización")
      setIsLoading(false)
    }
  }, [searchParams])

  // Modificar la función confirmPurchase para incluir los datos adicionales
  const confirmPurchase = async () => {
    if (!authorizationId) return

    setIsConfirming(true)
    try {
      // Obtener los parámetros de la URL para el repositorio y vendedor
      const sellerId = searchParams.get("seller_id")
      const repoName = searchParams.get("repo_name")
      const repoUrl = searchParams.get("repo_url")

      // Verificar que tenemos todos los datos necesarios
      if (!sellerId || !repoName || !repoUrl) {
        setError("Faltan datos necesarios para completar la compra")
        setIsConfirming(false)
        return
      }

      const response = await fetch("https://agoserver.a1devhub.tech/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `authorization_id=${authorizationId}&seller_id=${sellerId}&repo_name=${encodeURIComponent(repoName)}&repo_url=${encodeURIComponent(repoUrl)}`,
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        setIsConfirmed(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } else {
        setError("Error al confirmar la compra")
      }
    } catch (err) {
      setError("Error de conexión al confirmar la compra")
    } finally {
      setIsConfirming(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-2xl w-full max-w-md">
          <CardContent className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400">Procesando autorización...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-2xl w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-xl text-white">Error en el Pago</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-400">{error}</p>
            <Button onClick={() => router.push("/dashboard")} className="w-full bg-blue-600 hover:bg-blue-700">
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-2xl w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <CardTitle className="text-xl text-white">¡Compra Confirmada!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-green-400">Tu repositorio ha sido transferido exitosamente.</p>
            <p className="text-gray-400">Redirigiendo al dashboard...</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-2xl w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <CardTitle className="text-xl text-white">Pago Autorizado Correctamente</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-400">
            Ahora puedes confirmar la compra para completar la transferencia del repositorio.
          </p>

          <div className="p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">ID de Autorización:</p>
            <p className="text-blue-400 font-mono text-xs break-all">{authorizationId}</p>
          </div>

          <Button
            onClick={confirmPurchase}
            disabled={isConfirming}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-all duration-200"
            size="lg"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Confirmar Compra
              </>
            )}
          </Button>

          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancelar y Volver
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
