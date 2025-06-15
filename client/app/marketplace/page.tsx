"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Code, Search, Star, GitBranch, DollarSign, Eye, TrendingUp, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const BACKEND_URL = "https://agoserver.a1devhub.tech"

interface Repository {
  repository_id: number
  name: string
  url: string
  branch: string
  uploader_id: number
  price?: number
  owner?: {
    id: number
    username: string
    email: string
  }
}

export default function MarketplacePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [filteredRepos, setFilteredRepos] = useState<Repository[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [priceFilter, setPriceFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllRepositories()
  }, [])

  useEffect(() => {
    filterAndSortRepositories()
  }, [repositories, searchQuery, priceFilter, sortBy])

  const fetchAllRepositories = async () => {
    try {
      setLoading(true)
      // Esta función necesitaría un endpoint en el backend para obtener todos los repositorios públicos
      // Por ahora simularemos con datos de ejemplo

      // En un caso real, harías algo como:
      // const response = await fetch(`${BACKEND_URL}/marketplace/repositories`)

      // Simulación de datos
      const mockRepos: Repository[] = [
        {
          repository_id: 1,
          name: "react-dashboard",
          url: "https://github.com/user1/react-dashboard",
          branch: "main",
          uploader_id: 1,
          price: 29.99,
          owner: { id: 1, username: "user1", email: "user1@example.com" },
        },
        {
          repository_id: 2,
          name: "node-api-starter",
          url: "https://github.com/user2/node-api-starter",
          branch: "main",
          uploader_id: 2,
          price: 0,
          owner: { id: 2, username: "user2", email: "user2@example.com" },
        },
        // Más repositorios...
      ]

      setRepositories(mockRepos)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los repositorios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortRepositories = () => {
    let filtered = repositories

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.owner?.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filtrar por precio
    if (priceFilter === "free") {
      filtered = filtered.filter((repo) => !repo.price || repo.price === 0)
    } else if (priceFilter === "paid") {
      filtered = filtered.filter((repo) => repo.price && repo.price > 0)
    }

    // Ordenar
    if (sortBy === "price-low") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredRepos(filtered)
  }

  const viewRepository = (repo: Repository) => {
    if (repo.owner) {
      router.push(`/repository/${repo.owner.username}/${repo.name}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Cargando marketplace...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Code className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-white">Marketplace</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Marketplace de Repositorios</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Descubre y adquiere repositorios de código de alta calidad creados por la comunidad
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar repositorios o usuarios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Filtrar por precio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los precios</SelectItem>
                  <SelectItem value="free">Gratis</SelectItem>
                  <SelectItem value="paid">De pago</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="name">Nombre A-Z</SelectItem>
                  <SelectItem value="price-low">Precio: Menor a mayor</SelectItem>
                  <SelectItem value="price-high">Precio: Mayor a menor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{repositories.length}</div>
              <div className="text-gray-400">Repositorios Disponibles</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {repositories.filter((r) => !r.price || r.price === 0).length}
              </div>
              <div className="text-gray-400">Repositorios Gratis</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">4.8</div>
              <div className="text-gray-400">Calificación Promedio</div>
            </CardContent>
          </Card>
        </div>

        {/* Repository Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map((repo) => (
            <Card
              key={repo.repository_id}
              className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg group-hover:text-blue-400 transition-colors">
                      {repo.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={`https://github.com/${repo.owner?.username}.png`} />
                          <AvatarFallback className="text-xs">
                            {repo.owner?.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{repo.owner?.username}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {repo.price ? (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">${repo.price}</Badge>
                    ) : (
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Gratis</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <GitBranch className="w-4 h-4" />
                    <span>{repo.branch}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Actualizado recientemente</span>
                  </div>
                </div>

                <Button
                  onClick={() => viewRepository(repo)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Repositorio
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRepos.length === 0 && (
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">No se encontraron repositorios</h3>
              <p className="text-gray-400">Intenta ajustar tus filtros de búsqueda o explora diferentes categorías</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
