"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { User, Search, Upload, Trash2, ExternalLink, Download, Github, LogOut, Share } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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

interface GitHubRepo {
  nombre: string
  url: string
  visibilidad: string
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [searchValue, setSearchValue] = useState("")
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Utility function for API calls with cookies
  async function fetchWithCookies(url: string, options: RequestInit = {}) {
    return fetch(`https://agoserver.a1devhub.tech${url}`, {
      ...options,
      credentials: "include",
    })
  }

  useEffect(() => {
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const res = await fetchWithCookies("/get_user_info")
      if (res.ok) {
        const data = await res.json()
        setUserData(data.user)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Error loading user:", error)
      router.push("/")
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

  const loadGitHubRepos = async () => {
    try {
      const res = await fetchWithCookies("/get_github_repositories")
      if (res.ok) {
        const repos = await res.json()
        setGithubRepos(repos)
      }
    } catch (error) {
      console.error("Error loading GitHub repos:", error)
    }
  }

  const uploadRepository = async (name: string, url: string) => {
    try {
      await fetchWithCookies("/upload_repository", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_repository: name,
          url_repository: url,
        }),
      })
      toast({
        title: "¡Éxito!",
        description: "Repositorio subido exitosamente",
      })
      loadCurrentUser()
      setGithubRepos([])
    } catch (error) {
      console.error("Error uploading repository:", error)
      toast({
        title: "Error",
        description: "Error al subir el repositorio",
        variant: "destructive",
      })
    }
  }

  const deleteRepository = async (repoId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este repositorio?")) {
      return
    }

    try {
      const response = await fetchWithCookies(`/delete_repository/${repoId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        toast({
          title: "¡Éxito!",
          description: "Repositorio eliminado correctamente",
        })
        loadCurrentUser()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: `Error al eliminar el repositorio: ${data.detail}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al eliminar el repositorio",
        variant: "destructive",
      })
      console.error("Error:", error)
    }
  }

  const redirectToPayment = (repo: Repo, user: UserProfile) => {
    window.location.href = `/create-order?seller=${encodeURIComponent(user.username)}&repo_name=${encodeURIComponent(repo.name)}`
  }

  const logout = () => {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white">Cargando...</div>
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

            <Button onClick={logout} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
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
          {/* My Repositories */}
          <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Github className="w-5 h-5 mr-2" />
                Mis Repositorios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userData?.repositories.length === 0 ? (
                  <p className="text-gray-400">Sin repositorios.</p>
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
                      <Button
                        onClick={() => deleteRepository(repo.repository_id)}
                        size="sm"
                        variant="destructive"
                        className="ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transferred Repositories */}
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

        {/* Upload Repository */}
        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Upload className="w-5 h-5 mr-2" />
              Subir Repositorio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={loadGitHubRepos} className="bg-gray-700 hover:bg-gray-600">
              <Github className="w-4 h-4 mr-2" />
              Cargar Repositorios de GitHub
            </Button>

            {githubRepos.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Repositorios de GitHub</h4>
                <div className="grid gap-2">
                  {githubRepos.map((repo, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div>
                        <span className="text-white font-medium">{repo.nombre}</span>
                        <Badge variant="secondary" className="ml-2">
                          {repo.visibilidad}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => uploadRepository(repo.nombre, repo.url)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Subir
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
