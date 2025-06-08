"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Search,
  ExternalLink,
  Download,
  Github,
  LogOut,
  CreditCard,
  MoreVertical,
  Eye,
  Share,
  ArrowLeft,
  Home,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { use } from "react"

interface UserProfile {
  username: string
  email: string
  id: string
}

interface Repo {
  repository_id: string
  name: string
  url: string
}

interface UserData {
  profile: UserProfile
  repositories: Repo[]
  transfer_repository: Repo[]
}

interface PageProps {
  params: {
    username: string
  }
}

export default function UserProfilePage({ params }: PageProps) {
  const { username } = use(params)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [searchValue, setSearchValue] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Utility function for API calls with cookies
  async function fetchWithCookies(url: string, options: RequestInit = {}) {
    return fetch(`https://agoserver.a1devhub.tech${url}`, {
      ...options,
      credentials: "include",
    })
  }

  useEffect(() => {
    if (username) {
      loadUserProfile(decodeURIComponent(username))
    }
  }, [username])

  const loadUserProfile = async (searchUsername: string) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetchWithCookies(`/get_user_info?username=${encodeURIComponent(searchUsername)}`)

      if (res.ok) {
        const data = await res.json()
        setUserData(data.user)
      } else {
        setError("Usuario no encontrado")
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      setError("Error al cargar el perfil del usuario")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (!searchValue.trim()) return
    router.push(`/dashboard/${encodeURIComponent(searchValue.trim())}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const shareProfile = async () => {
    if (!userData?.profile.username) return

    const profileUrl = `https://agoraports.a1devhub.tech/dashboard/${userData.profile.username}`

    try {
      await navigator.clipboard.writeText(profileUrl)
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace del perfil se ha copiado al portapapeles",
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      })
    }
  }

  const redirectToPayment = (repo: Repo) => {
    if (!userData?.profile.username || !userData?.profile.id) return

    window.location.href = `/create-order/${encodeURIComponent(repo.name)}?seller=${encodeURIComponent(userData.profile.username)}&seller_id=${userData.profile.id}&repo_url=${encodeURIComponent(repo.url)}`
  }

  const goToMyProfile = () => {
    router.push("/dashboard")
  }

  const logout = () => {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Cargando perfil...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">AgoraDevs</h1>

              {/* Search Bar */}
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Buscar usuario..."
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
                  >
                    Buscar
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={goToMyProfile}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Mi Perfil
                </Button>
                <Button onClick={logout} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto p-6 flex items-center justify-center min-h-[80vh]">
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50 w-full max-w-md">
            <CardContent className="text-center py-8">
              <User className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Usuario no encontrado</h2>
              <p className="text-gray-400 mb-4">{error}</p>
              <Button onClick={goToMyProfile} className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a mi perfil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">AgoraDevs</h1>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Buscar usuario..."
                  className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                />
                <Button
                  onClick={handleSearch}
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
                >
                  Buscar
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={goToMyProfile}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Mi Perfil
              </Button>
              <Button onClick={logout} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* User Profile Header */}
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">{userData?.profile.username}</CardTitle>
                  <p className="text-gray-400">{userData?.profile.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="secondary">{userData?.repositories.length || 0} repositorios</Badge>
                    <Badge variant="secondary">{userData?.transfer_repository.length || 0} transferidos</Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={shareProfile}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Share className="w-4 h-4 mr-2" />
                Compartir Perfil
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Repositories */}
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Github className="w-5 h-5 mr-2" />
                Repositorios de {userData?.profile.username}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userData?.repositories.length === 0 ? (
                  <p className="text-gray-400">Sin repositorios disponibles.</p>
                ) : (
                  userData?.repositories.map((repo) => (
                    <div
                      key={repo.repository_id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h5 className="text-white font-medium">{repo.name}</h5>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {repo.url}
                        </a>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem
                            onClick={() => {
                              const path = `/repository-preview/${encodeURIComponent(userData.profile.username)}/${encodeURIComponent(repo.name)}`
                              const absoluteUrl = `${window.location.origin}${path}`
                              window.open(absoluteUrl, "_blank", "noopener,noreferrer")
                            }}
                            className="text-gray-300 hover:bg-gray-700 cursor-pointer"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Previsualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => redirectToPayment(repo)}
                            className="text-gray-300 hover:bg-gray-700 cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Comprar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Transferred Repositories */}
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Download className="w-5 h-5 mr-2" />
                Repositorios Transferidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userData?.transfer_repository.length === 0 ? (
                  <p className="text-gray-400">Sin transferencias.</p>
                ) : (
                  userData?.transfer_repository.map((repo) => (
                    <div key={repo.repository_id} className="p-3 bg-gray-800/50 rounded-lg">
                      <h5 className="text-white font-medium">{repo.name}</h5>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {repo.url}
                      </a>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
