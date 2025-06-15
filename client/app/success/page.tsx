"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const BACKEND_URL = "https://agoserver.a1devhub.tech"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authorizationId = searchParams.get("authorization_id")
  const sellerId = searchParams.get("seller_id")
  const repoUrl = searchParams.get("repo_url")
  const repoName = searchParams.get("repo_name")
  const errorParam = searchParams.get("error")

  useEffect(() => {
    if (errorParam) {
      setError(errorParam)
      return
    }

    if (authorizationId && sellerId && repoUrl && repoName) {
      confirmPayment()
    }
  }, [authorizationId, sellerId, repoUrl, repoName, errorParam])

  const confirmPayment = async () => {
    setProcessing(true)

    try {
      const formData = new FormData()
      formData.append("authorization_id", authorizationId!)
      formData.append("seller_id", sellerId!)
      formData.append("repo_url", repoUrl!)
      formData.append("repo_name", repoName!)

      const response = await fetch(`${BACKEND_URL}/confirm`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setCompleted(true)
        toast({
          title: "¡Pago Exitoso!",
          description: "El repositorio ha sido transferido a tu cuenta",
        })
      } else {
        throw new Error("Error al confirmar el pago")
      }
    } catch (error) {
      setError("Error al procesar el pago")
      toast({
        title: "Error",
        description: "No se pudo completar la transacción",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Error en el Pago</CardTitle>
            <CardDescription className="text-gray-400">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={goToDashboard} className="w-full">
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (processing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Procesando Pago</CardTitle>
            <CardDescription className="text-gray-400">
              Confirmando la transacción y transfiriendo el repositorio...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Verificando pago con PayPal</p>
              <p>• Clonando repositorio</p>
              <p>• Transfiriendo a tu cuenta</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">¡Compra Exitosa!</CardTitle>
            <CardDescription className="text-gray-400">
              El repositorio "{repoName}" ha sido transferido a tu cuenta de GitHub
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="text-green-400 font-medium mb-2">¿Qué sigue?</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• El repositorio ya está en tu cuenta de GitHub</li>
                <li>• Puedes clonarlo y comenzar a trabajar</li>
                <li>• Revisa tu dashboard para más detalles</li>
              </ul>
            </div>
            <Button onClick={goToDashboard} className="w-full">
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Cargando...</h1>
          <p className="text-gray-400">Procesando información del pago</p>
        </CardContent>
      </Card>
    </div>
  )
}
