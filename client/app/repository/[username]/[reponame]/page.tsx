"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Code,
  File,
  Folder,
  FolderOpen,
  Github,
  Download,
  DollarSign,
  Eye,
  GitBranch,
  User,
  ChevronRight,
  FileText,
  ImageIcon,
  Settings,
  Database,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

const BACKEND_URL = "https://agoserver.a1devhub.tech"

interface FileNode {
  path: string
  type: "blob" | "tree"
  size?: number
  url?: string
}

interface RepoTree {
  tree: FileNode[]
  truncated: boolean
}

interface Repository {
  repository_id: number
  name: string
  url: string
  branch: string
  uploader_id: number
  price?: number
}

interface UserProfile {
  id: number
  username: string
  email: string
}

// Mapeo de extensiones a lenguajes
const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase()

  const languageMap: { [key: string]: string } = {
    // JavaScript/TypeScript
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    mjs: "javascript",

    // Python
    py: "python",
    pyw: "python",

    // Java/C/C++
    java: "java",
    c: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    h: "c",
    hpp: "cpp",

    // Web
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "scss",
    less: "css",

    // Data/Config
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    ini: "ini",

    // Database
    sql: "sql",

    // Shell/Scripts
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    fish: "bash",
    ps1: "powershell",

    // Documentation
    md: "markdown",
    markdown: "markdown",
    rst: "rest",

    // Other languages
    php: "php",
    go: "go",
    rs: "rust",
    rb: "ruby",
    swift: "swift",
    kt: "kotlin",
    scala: "scala",
    r: "r",
    dockerfile: "docker",
    gitignore: "text",
  }

  return languageMap[ext || ""] || "text"
}

// Función para obtener el icono apropiado según la extensión del archivo
const getFileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase()

  switch (ext) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "py":
    case "java":
    case "cpp":
    case "c":
      return <Code className="w-4 h-4 text-cyan-400" />
    case "json":
    case "xml":
    case "yaml":
    case "yml":
      return <Settings className="w-4 h-4 text-amber-400" />
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "ico":
      return <ImageIcon className="w-4 h-4 text-emerald-400" />
    case "sql":
    case "db":
      return <Database className="w-4 h-4 text-purple-400" />
    default:
      return <FileText className="w-4 h-4 text-slate-400" />
  }
}

// Función para construir el árbol de archivos
const buildFileTree = (files: FileNode[]) => {
  const tree: any = {}

  files.forEach((file) => {
    const parts = file.path.split("/").filter(Boolean)
    let current = tree

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          name: part,
          type: index === parts.length - 1 ? file.type : "tree",
          path: parts.slice(0, index + 1).join("/"),
          children: {},
          isExpanded: false,
          size: file.size,
        }
      }
      current = current[part].children
    })
  })

  return tree
}

// Tema personalizado basado en oneDark pero adaptado a nuestro diseño
const customDarkTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "transparent",
    margin: 0,
    padding: 0,
    fontSize: "14px",
    lineHeight: "1.6",
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: "transparent",
    fontSize: "14px",
    lineHeight: "1.6",
  },
}

export default function RepositoryPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const username = params.username as string
  const reponame = params.reponame as string

  const [repoTree, setRepoTree] = useState<RepoTree | null>(null)
  const [fileTree, setFileTree] = useState<any>({})
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [fileContent, setFileContent] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<string>("")
  const [repository, setRepository] = useState<Repository | null>(null)
  const [owner, setOwner] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [fileLoading, setFileLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [purchasing, setPurchasing] = useState(false)

  // Cache para archivos - se mantiene solo durante la sesión
  const fileCache = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    fetchRepositoryData()
    fetchCurrentUser()
  }, [username, reponame])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/get_user_info`, {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  const fetchRepositoryData = async () => {
    try {
      setLoading(true)

      // Fetch user info to get repository details
      const userResponse = await fetch(`${BACKEND_URL}/get_user_info?username=${username}`, {
        credentials: "include",
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setOwner(userData.user.profile)

        // Find the specific repository
        const repo = userData.user.repositories.find((r: Repository) => r.name === reponame)
        if (repo) {
          setRepository(repo)

          // Fetch repository tree
          await fetchRepoTree(repo.branch || "main")
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del repositorio",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRepoTree = async (branch = "main") => {
    try {
      const response = await fetch(`${BACKEND_URL}/tree?repository=${reponame}&username=${username}&branch=${branch}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setRepoTree(data)
        setFileTree(buildFileTree(data.tree || []))

        // Auto-select README if exists
        const readmeFile = data.tree?.find(
          (file: FileNode) =>
            file.type === "blob" &&
            (file.path.toLowerCase().includes("readme") || file.path.toLowerCase().includes("index")),
        )

        if (readmeFile) {
          openFile(readmeFile.path)
        }
      }
    } catch (error) {
      console.error("Error fetching repository tree:", error)
    }
  }

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const openFile = async (path: string) => {
    if (selectedFile === path) return

    setSelectedFile(path)

    // Verificar si el archivo está en caché
    if (fileCache.current.has(path)) {
      setFileContent(fileCache.current.get(path) || "")
      return
    }

    setFileLoading(true)

    try {
      const response = await fetch(
        `${BACKEND_URL}/file?path=${encodeURIComponent(path)}&owner=${username}&repo=${reponame}`,
        {
          credentials: "include",
        },
      )

      if (response.ok) {
        const data = await response.json()
        const content = data.content || "// No se pudo cargar el contenido del archivo"

        // Guardar en caché
        fileCache.current.set(path, content)
        setFileContent(content)
      }
    } catch (error) {
      const errorMsg = "// Error al cargar el archivo"
      fileCache.current.set(path, errorMsg)
      setFileContent(errorMsg)
    } finally {
      setFileLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!repository || !owner) return

    try {
      setPurchasing(true)
      const price = repository.price || 0

      if (price === 0) {
        // Para repositorios gratuitos, hacer la petición directamente
        const response = await fetch(
          `${BACKEND_URL}/create-order/${repository.name}?seller_id=${owner.id}&repo_url=${encodeURIComponent(repository.url)}&repo_price=${price}`,
          {
            method: "GET",
            credentials: "include",
          },
        )

        const data = await response.json()
        console.log(data)
        if (response.ok) {
          // Verificar si la respuesta es JSON (repositorio gratuito)
          if (typeof data === "object" && data.message) {
            toast({
              title: "¡Éxito!",
              description: data.message || "Repositorio obtenido correctamente",
            })

            // Redirigir al dashboard después de un breve delay
            setTimeout(() => {
              router.push("/dashboard")
            }, 2000)
          } else {
            // Si no es JSON, probablemente sea una redirección a PayPal
            window.location.href = `${BACKEND_URL}/create-order/${repository.name}?seller_id=${owner.id}&repo_url=${encodeURIComponent(repository.url)}&repo_price=${price}`
          }
        } else {
          throw new Error("Error en la respuesta del servidor")
        }
      } else {
        // Para repositorios de pago, redirigir directamente a PayPal
        window.location.href = `${BACKEND_URL}/create-order/${repository.name}?seller_id=${owner.id}&repo_url=${encodeURIComponent(repository.url)}&repo_price=${price}`
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar la compra",
        variant: "destructive",
      })
    } finally {
      setPurchasing(false)
    }
  }

  const renderTreeNode = (node: any, level = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const hasChildren = Object.keys(node.children).length > 0
    const isCached = fileCache.current.has(node.path)

    return (
      <motion.div
        key={node.path}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: level * 0.05 }}
      >
        <div
          className={`flex items-center py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/5 ${
            selectedFile === node.path ? "bg-white/10 border-l-2 border-cyan-400 shadow-lg shadow-cyan-400/10" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (node.type === "tree") {
              toggleFolder(node.path)
            } else {
              openFile(node.path)
            }
          }}
        >
          {node.type === "tree" && hasChildren && (
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }} className="mr-1">
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </motion.div>
          )}

          {node.type === "tree" && !hasChildren && <div className="w-5 mr-1" />}

          <div className="mr-2">
            {node.type === "tree" ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-cyan-400" />
              ) : (
                <Folder className="w-4 h-4 text-slate-300" />
              )
            ) : (
              getFileIcon(node.name)
            )}
          </div>

          <span className={`text-sm flex-1 ${node.type === "tree" ? "font-medium text-slate-200" : "text-slate-300"}`}>
            {node.name}
          </span>

          {/* Indicador de tamaño para archivos */}
          {node.type === "blob" && node.size && (
            <span className="text-xs text-gray-500 ml-auto">{(node.size / 1024).toFixed(1)}KB</span>
          )}

          {/* Indicador de caché para archivos */}
          {node.type === "blob" && isCached && (
            <div className="w-2 h-2 bg-emerald-400 rounded-full ml-2 opacity-60" title="Archivo en caché" />
          )}
        </div>

        <AnimatePresence>
          {node.type === "tree" && isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {Object.values(node.children).map((child: any) => renderTreeNode(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  const renderFileContent = () => {
    const language = getLanguageFromExtension(selectedFile)
    const content = fileContent || "// Contenido vacío"

    if (language === "text" || !content.trim()) {
      return (
        <div className="relative h-full">
          <pre className="p-6 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-mono bg-slate-900 h-full selection:bg-cyan-400/20 overflow-auto">
            {content}
          </pre>
          {/* Efecto blur en la parte inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none">
            <div className="absolute inset-0 backdrop-blur-sm"></div>
          </div>
        </div>
      )
    }

    return (
      <div className="relative h-full overflow-hidden">
        <div className="h-full overflow-auto">
          <SyntaxHighlighter
            language={language}
            style={customDarkTheme}
            customStyle={{
              background: "transparent",
              padding: "24px",
              margin: 0,
              fontSize: "14px",
              lineHeight: "1.6",
              minHeight: "100%",
            }}
            wrapLongLines={true}
            showLineNumbers={true}
            lineNumberStyle={{
              color: "#6b7280",
              paddingRight: "16px",
              minWidth: "40px",
              textAlign: "right",
              userSelect: "none",
            }}
          >
            {content}
          </SyntaxHighlighter>
        </div>

        {/* Efecto blur gradual en la parte inferior */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        >
          {/* Gradiente de fondo */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 via-slate-900/70 via-slate-900/40 to-transparent"></div>

          {/* Efecto blur */}
          <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-t from-slate-900/20 to-transparent"></div>

          {/* Efecto blur más intenso en la parte más baja */}
          <div className="absolute bottom-0 left-0 right-0 h-20 backdrop-blur-[4px] bg-gradient-to-t from-slate-900/40 to-transparent"></div>

          {/* Indicador visual sutil */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="flex items-center space-x-1 text-slate-500 text-xs"
            >
              <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
              <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
              <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-3 text-white"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full"
          />
          <span className="text-lg">Cargando repositorio...</span>
        </motion.div>
      </div>
    )
  }

  if (!repository || !owner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-black/40 backdrop-blur-xl border-white/10">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Repositorio no encontrado</h1>
            <Link href="/dashboard">
              <Button>Volver al Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOwner = currentUser?.profile?.id === owner.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-white/10 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Code className="w-6 h-6 text-cyan-400" />
              <span className="text-xl font-bold text-white">
                {username}/{reponame}
              </span>
            </div>
          </div>

          {!isOwner && (
            <Button
              onClick={handlePurchase}
              disabled={purchasing}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {purchasing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Procesando...
                </>
              ) : repository.price ? (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Comprar ${repository.price}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Obtener Gratis
                </>
              )}
            </Button>
          )}
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-6">
        {/* Repository Info */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white text-2xl flex items-center space-x-2">
                    <Github className="w-6 h-6" />
                    <span>{repository.name}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{owner.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GitBranch className="w-4 h-4" />
                        <span>{repository.branch}</span>
                      </div>
                      <a
                        href={repository.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline flex items-center space-x-1"
                      >
                        <Github className="w-4 h-4" />
                        <span>Ver en GitHub</span>
                      </a>
                    </div>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {repository.price ? (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">${repository.price}</Badge>
                  ) : (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Gratis</Badge>
                  )}
                  <Badge variant="secondary">
                    <Eye className="w-3 h-3 mr-1" />
                    Vista Previa
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Main Content - File Explorer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex h-[calc(100vh-280px)] bg-slate-800 rounded-lg overflow-hidden shadow-2xl"
        >
          {/* Panel izquierdo - Explorador de archivos */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col"
          >
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
              <h2 className="text-lg font-semibold text-slate-100 flex items-center">
                <Folder className="w-5 h-5 mr-2 text-cyan-400" />
                Archivos
              </h2>
              <div className="text-xs text-slate-400 mt-1 flex items-center">
                <span>Archivos en caché: {fileCache.current.size}</span>
                {fileCache.current.size > 0 && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full ml-2" />}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {Object.values(fileTree).map((node: any) => renderTreeNode(node))}
              </motion.div>
            </div>
          </motion.div>

          {/* Panel derecho - Visor de archivos */}
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 flex flex-col bg-slate-900"
          >
            {selectedFile ? (
              <>
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="p-4 border-b border-slate-700 bg-slate-800/30 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getFileIcon(selectedFile)}
                      <h2 className="text-lg font-semibold ml-2 text-slate-100">{selectedFile}</h2>
                      {fileCache.current.has(selectedFile) && (
                        <span className="ml-3 px-2 py-1 text-xs bg-emerald-400/20 text-emerald-300 rounded-full border border-emerald-400/30">
                          Cached
                        </span>
                      )}
                      <span className="ml-3 px-2 py-1 text-xs bg-cyan-400/20 text-cyan-300 rounded-full border border-cyan-400/30">
                        {getLanguageFromExtension(selectedFile)}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <div className="flex-1 overflow-hidden bg-slate-900">
                  <AnimatePresence mode="wait">
                    {fileLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center h-full"
                      >
                        <div className="flex items-center space-x-3 text-slate-400">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full"
                          />
                          <span className="text-lg">Cargando archivo...</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        {renderFileContent()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
              >
                <div className="text-center text-slate-400">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  >
                    <File className="w-20 h-20 mx-auto mb-6 text-slate-600" />
                  </motion.div>
                  <p className="text-xl font-medium text-slate-300">Selecciona un archivo</p>
                  <p className="text-sm mt-2 text-slate-500">
                    Haz clic en cualquier archivo del explorador para previsualizarlo
                  </p>
                  <div className="mt-4 text-xs text-slate-600">
                    Los archivos se guardan en caché durante esta sesión
                    <br />
                    <span className="text-cyan-400">Syntax highlighting con efecto blur</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Purchase Section */}
        {!isOwner && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mt-6 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-slate-100 font-semibold text-lg mb-2">
                      {repository.price ? "Comprar Repositorio" : "Obtener Repositorio"}
                    </h3>
                    <p className="text-slate-300">
                      {repository.price
                        ? `Obtén acceso completo a este repositorio por $${repository.price}`
                        : "Este repositorio es gratuito. Obténlo ahora mismo."}
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-slate-400">
                      <span>✓ Transferencia automática a tu GitHub</span>
                      <span>✓ Acceso completo al código</span>
                      <span>✓ Historial de commits incluido</span>
                    </div>
                  </div>
                  <Button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {purchasing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Procesando...
                      </>
                    ) : repository.price ? (
                      <>
                        <DollarSign className="w-5 h-5 mr-2" />
                        Comprar ${repository.price}
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Obtener Gratis
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
