"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft } from "lucide-react"

export default function CancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 shadow-2xl w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <CardTitle className="text-xl text-white">Pago Cancelado</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-400">
            Has cancelado el proceso de pago. No se ha realizado ningún cargo a tu cuenta.
          </p>

          <div className="space-y-3">
            <Button onClick={() => router.push("/dashboard")} className="w-full bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>

            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Intentar de Nuevo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
