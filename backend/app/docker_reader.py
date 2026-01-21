import docker

def get_docker_client():
    try:
        # low-level API client using unix socket
        return docker.APIClient(base_url="unix:///var/run/docker.sock")
    except Exception as e:
        print("Docker connection failed:", e)
        return None

def get_running_containers():
    client = get_docker_client()
    if client is None:
        return []

    containers = client.containers()  # note: low-level returns dicts
    result = []
    for c in containers:
        result.append({
            "id": c["Id"][:12],
            "name": c["Names"][0].replace("/", ""),
            "image": c["Image"],
            "status": c["State"]
        })
    return result
