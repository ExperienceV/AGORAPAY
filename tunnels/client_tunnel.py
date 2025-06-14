import subprocess

def tunnel_start():
    try:
        comando = [
            'cloudflared', 'tunnel',
            '--config', '/home/experiencev/.cloudflared/agora-client.config.yml',
            'run', 'agoraClient',
        ]
        proceso = subprocess.Popen(comando)
        print("Túnel autenticado iniciado. Presiona Ctrl+C para detener.")
        proceso.wait()
    except KeyboardInterrupt:
        print("\nTúnel detenido.")
    except Exception as e:
        print(f"Error al iniciar el túnel: {e}")

if __name__ == "__main__":
    tunnel_start()



