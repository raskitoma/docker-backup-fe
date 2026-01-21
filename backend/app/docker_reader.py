import docker

def get_docker_client():
    try:
        return docker.DockerClient(base_url="unix:///var/run/docker.sock")
    except Exception as e:
        print("Docker connection failed:", e)
        return None

def get_running_containers():
    client = get_docker_client()

    if client is None:
        return []

    containers = client.containers.list()

    result = []

    for c in containers:
        result.append({
            "id": c.short_id,
            "name": c.name,
            "image": c.image.tags[0] if c.image.tags else "unknown",
            "status": c.status
        })

    return result
