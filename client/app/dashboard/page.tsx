"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Github,
  Code,
  Upload,
  Search,
  Trash2,
  ExternalLink,
  DollarSign,
  Package,
  TrendingUp,
  LogOut,
  Eye,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

const BACKEND_URL = "https://agoserver.a1devhub.tech"

interface User {
  id: number
  username: string
  email: string
}

interface Repository {
  repository_id: number
  name: string
  url: string
  branch: string
  uploader_id?: number
  price?: number
}

interface UserData {
  profile: User
  repositories: Repository[]
  transfer_repository: Repository[]
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [githubRepos, setGithubRepos] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/get_user_info`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
      } else {
        toast({
          title: "Error",
          description: "No se pudo cargar la información del usuario",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchGithubRepos = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/get_github_repositories`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setGithubRepos(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los repositorios de GitHub",
        variant: "destructive",
      })
    }
  }

  const uploadRepository = async (repo: any) => {
    try {
      const price = prompt("Ingresa el precio del repositorio (0 para gratis):")
      if (price === null) return

      const response = await fetch(`${BACKEND_URL}/upload_repository`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name_repository: repo.nombre,
          url_repository: repo.url,
          branch: repo.default_branch || "main",
          price: Number.parseFloat(price) || 0,
        }),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Repositorio subido correctamente",
        })
        fetchUserData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir el repositorio",
        variant: "destructive",
      })
    }
  }

  const deleteRepository = async (repoId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este repositorio?")) {
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/delete_repository/${repoId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Repositorio eliminado correctamente",
        })
        fetchUserData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el repositorio",
        variant: "destructive",
      })
    }
  }

  const searchUser = async () => {
    if (!searchQuery.trim()) return

    try {
      const isEmail = searchQuery.includes("@")
      const query = isEmail ? `email=${searchQuery}` : `username=${searchQuery}`

      const response = await fetch(`${BACKEND_URL}/get_user_info?${query}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("datos encontarods:")
        console.log(data)

        setSearchResults(data.user)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo buscar el usuario",
        variant: "destructive",
      })
    }
  }

  const buyRepository = async (repo: Repository, sellerId: number) => {
    // Redirigir a la página de previsualización
    router.push(`/repository/${searchResults.profile.username}/${repo.name}`)
  }

  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/github/logout`, {
        method: "POST",
        credentials: "include",
      })
      window.location.href = "/"
    } catch (error) {
      window.location.href = "/"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Error de Autenticación</h1>
            <p className="text-gray-400 mb-4">No se pudo cargar tu información</p>
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AgoraPay</span>
            <nav className="hidden md:flex items-center space-x-6 ml-8">
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`https://github.com/${userData.profile.username}.png`} />
              <AvatarFallback>{userData.profile.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-white font-medium">{userData.profile.username}</p>
              <p className="text-gray-400 text-sm">{userData.profile.email}</p>
            </div>
            <Button variant="ghost" onClick={logout} className="text-white hover:bg-white/10">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Repositorios Subidos</CardTitle>
              <Package className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{userData.repositories.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Repositorios Comprados</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{userData.transfer_repository.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$0</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Perfil GitHub</CardTitle>
              <Github className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <a
                href={`https://github.com/${userData.profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                @{userData.profile.username}
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="repositories" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="repositories" className="data-[state=active]:bg-white/10">
              Mis Repositorios
            </TabsTrigger>
            <TabsTrigger value="purchased" className="data-[state=active]:bg-white/10">
              Comprados
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-white/10">
              Subir Repositorio
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-white/10">
              Buscar
            </TabsTrigger>
            <TabsTrigger value="explore" className="data-[state=active]:bg-white/10">
              Explorar
            </TabsTrigger>
          </TabsList>

          {/* My Repositories */}
          <TabsContent value="repositories">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Mis Repositorios</CardTitle>
                <CardDescription className="text-gray-400">Repositorios que has subido a la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                {userData.repositories.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No has subido ningún repositorio aún</p>
                ) : (
                  <div className="space-y-4">
                    {userData.repositories.map((repo) => (
                      <div
                        key={repo.repository_id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{repo.name}</h3>
                          <p className="text-gray-400 text-sm">Rama: {repo.branch}</p>
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline text-sm flex items-center mt-1"
                          >
                            Ver en GitHub <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                        <div className="flex items-center space-x-2">
                          {repo.price && <Badge variant="secondary">${repo.price}</Badge>}
                          <Button variant="destructive" size="sm" onClick={() => deleteRepository(repo.repository_id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchased Repositories */}
          <TabsContent value="purchased">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Repositorios Comprados</CardTitle>
                <CardDescription className="text-gray-400">
                  Repositorios que has adquirido de otros usuarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userData.transfer_repository.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No has comprado ningún repositorio aún</p>
                ) : (
                  <div className="space-y-4">
                    {userData.transfer_repository.map((repo) => (
                      <div
                        key={repo.repository_id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{repo.name}</h3>
                          <p className="text-gray-400 text-sm">Rama: {repo.branch}</p>
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline text-sm flex items-center mt-1"
                          >
                            Ver en GitHub <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Adquirido</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Repository */}
          <TabsContent value="upload">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Subir Repositorio</CardTitle>
                <CardDescription className="text-gray-400">
                  Selecciona un repositorio de tu GitHub para subir a la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={fetchGithubRepos} className="mb-4">
                  <Github className="w-4 h-4 mr-2" />
                  Cargar Repositorios de GitHub
                </Button>

                {githubRepos.length > 0 && (
                  <div className="space-y-4">
                    {githubRepos.map((repo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{repo.nombre}</h3>
                          <p className="text-gray-400 text-sm">{repo.visibilidad}</p>
                          <p className="text-gray-400 text-sm">Rama: {repo.default_branch}</p>
                        </div>
                        <Button onClick={() => uploadRepository(repo)}>
                          <Upload className="w-4 h-4 mr-2" />
                          Subir
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search */}
          <TabsContent value="search">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Buscar Usuarios</CardTitle>
                <CardDescription className="text-gray-400">
                  Encuentra otros usuarios y explora sus repositorios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-6">
                  <Input
                    placeholder="Buscar por username o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                  <Button onClick={searchUser}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {searchResults && (
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar>
                          <AvatarImage src={`https://github.com/${searchResults.profile.username}.png`} />
                          <AvatarFallback>{searchResults.profile.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-white font-medium">{searchResults.profile.username}</h3>
                          <p className="text-gray-400 text-sm">{searchResults.profile.email}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-4">Repositorios Disponibles</h4>
                      {searchResults.repositories.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">Este usuario no tiene repositorios disponibles</p>
                      ) : (
                        <div className="space-y-4">
                          {searchResults.repositories.map((repo: Repository) => (
                            <div
                              key={repo.repository_id}
                              className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                            >
                              <div className="flex-1">
                                <h3 className="text-white font-medium">{repo.name}</h3>
                                <p className="text-gray-400 text-sm">Rama: {repo.branch}</p>
                                <a
                                  href={repo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline text-sm flex items-center mt-1"
                                >
                                  Ver en GitHub <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              </div>
                              <div className="flex items-center space-x-2">
                                {repo.price ? (
                                  <Badge variant="secondary">${repo.price}</Badge>
                                ) : (
                                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Gratis</Badge>
                                )}
                                <Button onClick={() => buyRepository(repo, searchResults.profile.id)} size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver Repositorio
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="explore">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Explorar Repositorios</CardTitle>
                <CardDescription className="text-gray-400">
                  Descubre repositorios populares de la comunidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Aquí se pueden mostrar repositorios destacados */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
                    <Code className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-400">Próximamente: Repositorios destacados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
