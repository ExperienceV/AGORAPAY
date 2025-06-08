"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateOrderPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const repoName = params.repo_name as string
  const userName = params.user_name as string
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Auto-redirect to PayPal when page loads
    handleCreateOrder()
  }, [])

  // Modificar la función handleCreateOrder para incluir los datos adicionales en la URL
  const handleCreateOrder = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Extraer el seller del parámetro de la URL si existe
      const seller = params.user_name || searchParams.get("seller")

      if (!seller) {
        setError("Falta información del vendedor")
        setIsProcessing(false)
        return
      }

      // Obtener información del vendedor para conseguir su ID
      const sellerResponse = await fetch(
        `https://agoserver.a1devhub.tech/get_user_info?username=${encodeURIComponent(seller)}`,
        {
          credentials: "include",
        },
      )

      if (!sellerResponse.ok) {
        setError("No se pudo obtener información del vendedor")
        setIsProcessing(false)
        return
      }

      const sellerData = await sellerResponse.json()
      const sellerId = sellerData.user.profile.id

      // Obtener información del repositorio
      let repoUrl = ""

      // Buscar el repositorio en los repositorios del vendedor
      for (const repo of sellerData.user.repositories) {
        if (repo.name === repoName) {
          repoUrl = repo.url
          break
        }
      }

      if (!repoUrl) {
        setError("No se pudo encontrar la URL del repositorio")
        setIsProcessing(false)
        return
      }

      // Redirect to the backend endpoint with all necessary parameters
      window.location.href = `https://agoserver.a1devhub.tech/create-order/${encodeURIComponent(repoName)}?seller_id=${sellerId}&repo_url=${encodeURIComponent(repoUrl)}`
    } catch (err) {
      setError("Error al procesar el pago. Por favor, intenta de nuevo.")
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-2xl w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-white">Procesando Pago</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Repositorio:</h3>
              <p className="text-blue-400 font-mono">{decodeURIComponent(repoName)}</p>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Precio:</h3>
              <p className="text-green-400 text-2xl font-bold">$10.00 USD</p>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
              <p className="text-gray-400">Redirigiendo a PayPal...</p>
              <p className="text-sm text-gray-500">
                Si no eres redirigido automáticamente, haz clic en el botón de abajo.
              </p>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <p className="text-red-400">{error}</p>
              <Button onClick={handleCreateOrder} className="w-full bg-blue-600 hover:bg-blue-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Reintentar Pago
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-gray-700">
            <Link href="/dashboard">
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
