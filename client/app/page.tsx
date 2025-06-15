import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Code, Shield, Zap, Users, Star, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Warning Banner */}
      <div className="bg-amber-600/20 border-b border-amber-500/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-2 text-amber-200">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-medium">
              ⚠️ Proyecto Personal en Desarrollo - Actualmente sin integración PayPal Partner oficial
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AgoraPay</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Características
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Precios
            </a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">
              Acerca de
            </a>
          </nav>
          <div className="flex items-center space-x-4"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">🚀 Plataforma Beta Disponible</Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Marketplace de
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Repositorios
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Compra y vende repositorios de código de forma segura. Conecta con GitHub, gestiona tus proyectos y monetiza
            tu trabajo con pagos seguros vía PayPal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-3"
              >
                <Github className="w-5 h-5 mr-2" />
                Conectar con GitHub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Características Principales</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Todo lo que necesitas para comprar y vender repositorios de forma segura
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Github className="w-10 h-10 text-blue-400 mb-2" />
                <CardTitle className="text-white">Integración GitHub</CardTitle>
                <CardDescription className="text-gray-300">
                  Conecta directamente con tu cuenta de GitHub para gestionar repositorios
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Shield className="w-10 h-10 text-green-400 mb-2" />
                <CardTitle className="text-white">Pagos Seguros</CardTitle>
                <CardDescription className="text-gray-300">
                  Transacciones protegidas con PayPal y autorización de pagos
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Zap className="w-10 h-10 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Transferencia Automática</CardTitle>
                <CardDescription className="text-gray-300">
                  Los repositorios se transfieren automáticamente tras la compra
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Users className="w-10 h-10 text-purple-400 mb-2" />
                <CardTitle className="text-white">Comunidad</CardTitle>
                <CardDescription className="text-gray-300">
                  Conecta con desarrolladores y encuentra proyectos únicos
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Code className="w-10 h-10 text-blue-400 mb-2" />
                <CardTitle className="text-white">Vista Previa</CardTitle>
                <CardDescription className="text-gray-300">
                  Explora el código antes de comprar con nuestro visor integrado
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <Star className="w-10 h-10 text-orange-400 mb-2" />
                <CardTitle className="text-white">Calidad Garantizada</CardTitle>
                <CardDescription className="text-gray-300">
                  Sistema de valoraciones y comentarios de la comunidad
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">¿Cómo Funciona?</h2>
            <p className="text-gray-300 text-lg">Simple, rápido y seguro</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Conecta tu GitHub</h3>
              <p className="text-gray-300">Inicia sesión con tu cuenta de GitHub para acceder a tus repositorios</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Explora o Vende</h3>
              <p className="text-gray-300">Busca repositorios para comprar o sube los tuyos para vender</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Pago Seguro</h3>
              <p className="text-gray-300">
                Completa la transacción con PayPal y recibe el repositorio automáticamente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Precios Transparentes</h2>
            <p className="text-gray-300 text-lg">Sin costos ocultos, solo pagas por lo que usas</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Para Compradores</CardTitle>
                <CardDescription className="text-gray-300">Accede a repositorios únicos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Acceso completo al código</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Transferencia automática</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Soporte técnico</span>
                  </div>
                  <div className="pt-4">
                    <p className="text-2xl font-bold text-white">Precio variable</p>
                    <p className="text-gray-300">Según el repositorio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm relative overflow-hidden">
              <CardHeader>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 pointer-events-none" />
                <div className="relative z-10">
                  <Badge className="w-fit bg-blue-500/20 text-blue-300 border-blue-500/30 mb-2">Recomendado</Badge>
                  <CardTitle className="text-white text-2xl">Para Vendedores</CardTitle>
                  <CardDescription className="text-gray-300">Monetiza tu código</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Comisión del 5%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Pagos automáticos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Dashboard completo</span>
                  </div>
                  <div className="pt-4">
                    <p className="text-2xl font-bold text-white">Gratis</p>
                    <p className="text-gray-300">Solo pagas al vender</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">¿Listo para comenzar?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a nuestra comunidad de desarrolladores y comienza a monetizar tu código hoy mismo
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
              <Github className="w-5 h-5 mr-2" />
              Conectar Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AgoraPay</span>
            </div>
            <p className="text-gray-400">El marketplace líder para repositorios de código</p>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AgoraPay. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
