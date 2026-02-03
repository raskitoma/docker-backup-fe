import os
import logging # Import logging directly

# Get the uvicorn logger
logger = logging.getLogger("uvicorn.error")
# Force it to INFO level so our messages aren't filtered out
logger.setLevel(logging.INFO)

def parse_container_version(versions_path, container):
    """
    Parses a .version file for a specific container.
    Example path: /home/master/docker_backup/docker.version/oibus.version
    """
    # Construct the full path
    file_name = f"{container}.version"
    full_path = os.path.join(versions_path, file_name)
    
    logger.info(f"Parsing version file at: {full_path}")


    version_data = {}

    try:
        with open(full_path, 'r') as f:
            for line in f:
                line = line.strip()
                
                # Skip empty lines or comments
                if not line or line.startswith("#"):
                    continue
                
                # Split by the first '=' found
                if "=" in line:
                    key, value = line.split("=", 1)
                    # Clean up keys and values (remove quotes if present)
                    version_data[key.strip()] = value.strip().strip('"').strip("'")
                    
        return version_data

    except FileNotFoundError:
        return {"error": f"Version file not found for container: {container}"}
    except Exception as e:
        return {"error": str(e)}
