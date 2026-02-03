from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config_parser import parse_config
from .docker_reader import get_running_containers
from .system_info import get_system_info
from .file_scanner import scan_backups
from .version_parser import parse_container_version
from .stauts_parser import parse_status_detailed, parse_status
from .database import SessionLocal, ContainerCache
import logging

# Configure logging to output to stdout
logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:  %(asctime)s - %(message)s",
    handlers=[logging.StreamHandler()]
)

logger = logging.getLogger("backup-api")

CONFIG_ROOT = "/configs"
CONFIG_PATH = f"{CONFIG_ROOT}/params/config.ini"
VERSION_PATH = f"{CONFIG_ROOT}/params/docker.version"
RESULTS_PATH = f"{CONFIG_ROOT}/params/results"

app = FastAPI(title="Backup Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/system")
def system_info():
    return get_system_info()

@app.get("/api/config")
def config_data():
    return parse_config(CONFIG_PATH)

@app.get("/api/versions/{container}")
def container_version(container):
    return parse_container_version(VERSION_PATH, container)

@app.get("/api/status")
def status_data():
    return parse_status(f"{RESULTS_PATH}/status.yml")

@app.get("/api/status_detailed")
def status_detailed():
    return parse_status_detailed(f"{RESULTS_PATH}/status_detailed.yml")

@app.get("/api/containers")
def containers():

    cfg = parse_config(CONFIG_PATH)
    docker_containers = get_running_containers()

    session = SessionLocal()

    docker_names = set()

    for c in docker_containers:
        docker_names.add(c["name"])

        obj = session.get(ContainerCache, c["name"])
        if not obj:
            obj = ContainerCache(name=c["name"], cleared=False, deleted=False)
            session.add(obj)
        else:
            obj.deleted = False

    for row in session.query(ContainerCache).all():
        if row.name not in docker_names:
            row.deleted = True

    session.commit()

    cached = session.query(ContainerCache).all()

    result = []

    for c in cached:
        result.append({
            "name": c.name,
            "cleared": c.cleared,
            "deleted": c.deleted,
            "in_config": c.name in cfg
        })

    session.close()
    return result

@app.get("/api/backups/{container}")
def backups(container):
    cfg = parse_config(CONFIG_PATH)
    base = cfg["master_params"]["destination_path"]
    return scan_backups(base, container)
