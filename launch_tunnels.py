import threading
from tunnels.backend_tunnel import tunnel_start as start_backend
from tunnels.client_tunnel import tunnel_start as start_client

def launch_tunnels():
    try:
        # Crear hilos para ejecutar ambos túneles en paralelo
        backend_thread = threading.Thread(target=start_backend)
        client_thread = threading.Thread(target=start_client)

        # Iniciar ambos hilos
        backend_thread.start()
        client_thread.start()

        print("Ambos túneles fueron iniciados. Presiona Ctrl+C para detener.")

        # Esperar a que ambos hilos terminen
        backend_thread.join()
        client_thread.join()
    except KeyboardInterrupt:
        print("\nTúneles detenidos por el usuario.")
    except Exception as e:
        print(f"Error al ejecutar los túneles: {e}")

if __name__ == "__main__":
    launch_tunnels()
