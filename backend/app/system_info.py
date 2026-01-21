import psutil
import socket
import shutil

HOST_PROC = "/host/proc"
HOST_ROOT = "/host/root"

def get_system_info():

    # Hostname (from host filesystem)
    try:
        with open("/host/root/etc/hostname") as f:
            hostname = f.read().strip()
    except:
        hostname = socket.gethostname()

    # CPU
    cpu_percent = psutil.cpu_percent(interval=0.5)
    cores = psutil.cpu_count()

    # RAM
    mem = psutil.virtual_memory()
    ram_gb = mem.total // (1024**3)

    # Disk (host root)
    disk = shutil.disk_usage(HOST_ROOT)
    free_disk_gb = disk.free // (1024**3)

    # Host IP (best method inside container)
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    except:
        ip = "unknown"
    finally:
        s.close()

    return {
        "hostname": hostname,
        "ip": ip,
        "cpu_percent": cpu_percent,
        "cores": cores,
        "ram_gb": ram_gb,
        "free_disk_gb": free_disk_gb
    }
