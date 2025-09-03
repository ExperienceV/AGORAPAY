"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Code, Shield, Zap, AlertTriangle, ArrowRight, Terminal, Eye, DollarSign, Users } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const [terminalText, setTerminalText] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  const terminalSteps = [
    "$ git clone https://github.com/dev/awesome-project.git",
    "Cloning into 'awesome-project'...",
    "remote: Enumerating objects: 156, done.",
    "remote: Total 156 (delta 0), reused 0 (delta 0)",
    "Receiving objects: 100% (156/156), 2.4 MiB | 1.2 MiB/s, done.",
    "$ cd awesome-project",
    "$ npm install",
    "✨ Installing dependencies...",
    "🚀 Project ready! Time to build something amazing.",
  ]

  useEffect(() => {
    if (currentStep < terminalSteps.length) {
      setIsTyping(true)
      const timeout = setTimeout(
        () => {
          setTerminalText((prev) => prev + terminalSteps[currentStep] + "\n")
          setCurrentStep((prev) => prev + 1)
          setIsTyping(false)
        },
        currentStep === 0 ? 1000 : 800,
      )
      return () => clearTimeout(timeout)
    }
  }, [currentStep])

  const stats = [
    { label: "Repositorios", value: "1,247", icon: Code },
    { label: "Desarrolladores", value: "892", icon: Users },
    { label: "Transacciones", value: "$12.4k", icon: DollarSign },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Geometric Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-10 w-32 h-32 border border-purple-500/20 rotate-45" />
        <div className="absolute top-40 right-20 w-24 h-24 border border-blue-500/20 rotate-12" />
        <div className="absolute bottom-40 left-13/4 w-16 h-16 bg-teal-500/10 rotate-45" />
        <div className="absolute bottom-20 right-1/3 w-20 h-20 border border-pink-500/20 -rotate-12" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 border border-yellow-500/10 rotate-45 transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Warning Banner */}
      <div className="relative z-10 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-b border-amber-700/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center space-x-2 text-amber-200">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-mono">[BETA] Proyecto Personal - Sin integración PayPal Partner oficial</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">AgoraPay</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-zinc-400 hover:text-white transition-colors font-mono text-sm">
              ./features
            </a>
            <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors font-mono text-sm">
              ./pricing
            </a>
            <a href="#demo" className="text-zinc-400 hover:text-white transition-colors font-mono text-sm">
              ./demo
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 font-mono">
                  v1.0.0-beta • Open Source Marketplace
                </Badge>

                <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                  <span className="block text-white">CODE</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                    MARKETPLACE
                  </span>
                  <span className="block text-zinc-400 text-2xl lg:text-3xl font-normal mt-4">
                    for developers, by developers
                  </span>
                </h1>

                <p className="text-xl text-zinc-300 leading-relaxed max-w-lg">
                  Compra repositorios únicos. Vende tu código. Todo integrado con GitHub y pagos seguros via PayPal.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="bg-white text-black hover:bg-zinc-200 text-lg px-8 py-4 font-semibold">
                    <Github className="w-5 h-5 mr-2" />
                    Connect GitHub
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-zinc-800">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-zinc-500 font-mono">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Terminal */}
            <div className="relative">
              <div className="bg-zinc-900 rounded-lg border border-zinc-700 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-800 rounded-t-lg border-b border-zinc-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-400 text-sm font-mono">agorapay-terminal</span>
                  </div>
                </div>
                <div className="p-6 font-mono text-sm min-h-[300px]">
                  <pre className="text-green-400 whitespace-pre-wrap">
                    {terminalText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </pre>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-mono animate-bounce">
                LIVE
              </div>
              <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-mono">
                SECURE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-20 px-6 bg-zinc-900/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-zinc-500 font-mono text-lg block mb-2">// Features</span>
              Built Different
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Github,
                title: "GitHub Native",
                description: "Direct integration with your GitHub repositories",
                accent: "border-l-blue-500",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "PayPal integration with escrow protection",
                accent: "border-l-green-500",
              },
              {
                icon: Zap,
                title: "Instant Transfer",
                description: "Automatic repository transfer on purchase",
                accent: "border-l-yellow-500",
              },
              {
                icon: Eye,
                title: "Code Preview",
                description: "Browse code before you buy with our viewer",
                accent: "border-l-purple-500",
              },
            ].map((feature, index) => (
              <Card
                key={feature.title}
                className={`bg-zinc-800/50 border-zinc-700 border-l-4 ${feature.accent} hover:bg-zinc-800 transition-all duration-300 group`}
              >
                <CardHeader>
                  <feature.icon className="w-8 h-8 text-zinc-400 group-hover:text-white transition-colors" />
                  <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-zinc-500 font-mono text-lg block mb-2">// Pricing</span>
              Simple & Transparent
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-zinc-900 border-zinc-700 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-400" />
                  Buyers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-white">FREE</div>
                <p className="text-zinc-400">Only pay for the repositories you buy</p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span> Full source code access
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span> Automatic transfer
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span> No hidden fees
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-700 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <Code className="w-6 h-6 mr-2 text-green-400" />
                  Sellers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold text-white">
                  5% <span className="text-lg text-zinc-400">commission</span>
                </div>
                <p className="text-zinc-400">Only when you make a sale</p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span> List repositories for free
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span> Automatic payouts
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span> Sales dashboard
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-r from-zinc-900 to-zinc-800">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="space-y-8">
            <h2 className="text-5xl font-bold">
              Ready to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                monetize
              </span>{" "}
              your code?
            </h2>
            <p className="text-xl text-zinc-300">Join hundreds of developers already earning from their repositories</p>
            <Link href="/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xl px-12 py-6 font-semibold"
              >
                <Github className="w-6 h-6 mr-3" />
                Start Selling Today
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800 py-12 px-6 bg-black">
        <div className="container mx-auto">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">AgoraPay</span>
            </div>
            <p className="text-zinc-500 text-center font-mono">
              &copy; 2025 AgoraPay • Built with ❤️ for the developer community
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
