"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function CallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const res = await fetch("https://agoserver.a1devhub.tech/auth/verify_user", {
          credentials: "include",
        })

        if (res.status === 200) {
          setStatus("success")
          setMessage("Autenticación exitosa. Redirigiendo al dashboard...")

          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } else {
          setStatus("error")
          setMessage("Error en la autenticación. No se pudieron verificar las credenciales.")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Error inesperado durante la autenticación.")
        console.error("Callback error:", error)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-2xl w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-white">Procesando Autenticación</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
              <p className="text-gray-400">Verificando credenciales...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
              <p className="text-green-400">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
              <p className="text-red-400">{message}</p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Volver al inicio
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
