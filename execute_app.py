import subprocess
import os

# Comando para ejecutar el cliente con Bun
cliente_cmd = ["bun", "run", "dev"]
cliente_dir = "client"

# Comando para ejecutar el servidor con Uvicorn
server_cmd = ["uvicorn", "main:app", "--reload"]
server_dir = "server"

# Ejecuta el cliente
cliente_proc = subprocess.Popen(cliente_cmd, cwd=cliente_dir)

# Ejecuta el servidor
server_proc = subprocess.Popen(server_cmd, cwd=server_dir)

try:
    cliente_proc.wait()
    server_proc.wait()
except KeyboardInterrupt:
    print("\nDeteniendo procesos...")
    cliente_proc.terminate()
    server_proc.terminate()
