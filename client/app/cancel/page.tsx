"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CancelPage() {
  const router = useRouter()

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  const goHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Pago Cancelado</CardTitle>
          <CardDescription className="text-gray-400">
            Has cancelado el proceso de pago. No se ha realizado ningún cargo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <h3 className="text-orange-400 font-medium mb-2">¿Qué pasó?</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• El pago fue cancelado por el usuario</li>
              <li>• No se realizó ningún cargo</li>
              <li>• Puedes intentar nuevamente cuando gustes</li>
            </ul>
          </div>
          <div className="flex space-x-2">
            <Button onClick={goToDashboard} className="flex-1">
              Ir al Dashboard
            </Button>
            <Button onClick={goHome} variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10">
              Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
