"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"

export default function LoginPage() {
  const handleGitHubLogin = () => {
    // Redirigir al endpoint de login del backend
    window.location.href = "https://agoserver.a1devhub.tech/auth/github/login"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu cuenta usando GitHub</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Github className="h-16 w-16 text-gray-700" />
            </div>
            <p className="text-gray-600">Utiliza tu cuenta de GitHub para acceder de forma segura</p>
          </div>

          <Button
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800"
            size="lg"
          >
            <Github className="h-5 w-5" />
            <span>Continuar con GitHub</span>
          </Button>

          <div className="text-center text-sm text-gray-500">
            <p>Al continuar, aceptas nuestros términos de servicio y política de privacidad</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
