"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Code, ArrowLeft } from "lucide-react"
import Link from "next/link"

const BACKEND_URL = "https://agoserver.a1devhub.tech"

export default function LoginPage() {
  const handleGitHubLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/github/login`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Back Button */}
      <Link href="/" className="absolute top-6 left-6">
        <Button variant="ghost" className="text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </Link>

      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Card */}
        <Card className="bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="text-center">
            {/* Logo */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Code className="w-8 h-8 text-white" />
            </div>

            <CardTitle className="text-3xl font-bold text-white mb-2">Bienvenido a AgoraPay</CardTitle>
            <CardDescription className="text-gray-400">
              Inicia sesión con tu cuenta de GitHub para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* GitHub Button */}
            <Button
              onClick={handleGitHubLogin}
              className="w-full bg-white hover:bg-gray-200 text-black font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-3 group"
            >
              <Github className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Continuar con GitHub</span>
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/40 px-2 text-gray-400">Seguro y confiable</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Acceso seguro con OAuth</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Sincronización automática de repositorios</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Pagos seguros con PayPal</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          <p>
            Al continuar, aceptas nuestros{" "}
            <a href="#" className="text-blue-400 hover:underline">
              Términos de Servicio
            </a>{" "}
            y{" "}
            <a href="#" className="text-blue-400 hover:underline">
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
