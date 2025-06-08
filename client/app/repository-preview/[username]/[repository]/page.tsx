"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, File, Folder, FolderOpen, Code, FileText, ImageIcon, Settings, Database } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { use } from 'react'

type FileItem = {
  path: string
  type: "blob" | "tree"
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
const buildFileTree = (files: FileItem[]) => {
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

interface PageProps {
  params: {
    username: string
    repository: string
  }
}

export default function RepositoryPage({ params }: PageProps) {
  const { username, repository } = use(params)
  const [tree, setTree] = useState<FileItem[]>([])
  const [fileTree, setFileTree] = useState<any>({})
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [fileContent, setFileContent] = useState("")
  const [selectedFile, setSelectedFile] = useState("")
  const [loading, setLoading] = useState(false)

  // Cache para archivos - se mantiene solo durante la sesión
  const fileCache = useRef<Map<string, string>>(new Map())

  // Construir la API URL basada en los parámetros
  const API = `https://agoserver.a1devhub.tech`

  useEffect(() => {
    fetch(`${API}/tree?username=${username}&repository=${repository}`)
      .then((res) => res.json())
      .then((data) => {
        setTree(data.tree || [])
        setFileTree(buildFileTree(data.tree || []))
      })
      .catch((error) => {
        console.error("Error loading tree:", error)
      })
  }, [API])

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

    setLoading(true)

    try {
      const response = await fetch(`${API}/file?path=${encodeURIComponent(path)}&owner=${username}&repo=${repository}`)
      const data = await response.json()
      const content = data.content

      // Guardar en caché
      fileCache.current.set(path, content)
      setFileContent(content)
    } catch (error) {
      const errorMsg = "Error al cargar el archivo"
      fileCache.current.set(path, errorMsg)
      setFileContent(errorMsg)
    } finally {
      setLoading(false)
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
          className={`flex items-center py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
            selectedFile === node.path ? "bg-slate-700/70 border-l-2 border-cyan-400 shadow-lg shadow-cyan-400/10" : ""
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

  return (
    <div className="flex h-screen bg-slate-900 font-mono">
      {/* Panel izquierdo - Explorador de archivos */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col shadow-2xl"
      >
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center">
            <Folder className="w-5 h-5 mr-2 text-cyan-400" />
            {username}/{repository}
          </h2>
          <div className="text-xs text-slate-400 mt-1 flex items-center">
            <span>Archivos en caché: {fileCache.current.size}</span>
            {fileCache.current.size > 0 && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full ml-2" />}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
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
                {loading ? (
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
    </div>
  )
}
