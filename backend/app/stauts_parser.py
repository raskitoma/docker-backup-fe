import os
import json

def parse_status(path):
    """
    Reads the whole status.yml file. 
    Returns a list of entries or [] on error/empty.
    """
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return []

    status_list = []
    current_container = None
    current_entry = {}

    try:
        with open(path, 'r') as f:
            for line in f:
                line = line.rstrip()
                if not line or line.startswith("#"):
                    continue

                # 1. New Container block
                if not line.startswith(" "):
                    current_container = line.split(":")[0].strip()
                    continue

                # 2. New List Item
                if "-" in line:
                    if current_entry:
                        status_list.append(current_entry)
                    current_entry = {"container": current_container}
                    line = line.split("-", 1)[1]

                # 3. Attributes
                if ":" in line:
                    key, value = line.split(":", 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    if key:
                        current_entry[key] = value

            if current_entry:
                status_list.append(current_entry)

    except Exception:
        return []

    return status_list

def parse_status_detailed(path):
    """
    Parses status_detailed.yml into a flat list.
    Returns a list of entries or [] on error/empty.
    """
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return []

    detailed_list = []
    current_container = None
    current_entry = {}

    try:
        with open(path, 'r') as f:
            for line in f:
                line = line.rstrip()
                if not line or line.startswith("#"):
                    continue

                if not line.startswith(" "):
                    current_container = line.split(":")[0].strip()
                    continue

                if "-" in line:
                    if current_entry:
                        detailed_list.append(current_entry)
                    current_entry = {"container": current_container}
                    line = line.split("-", 1)[1]

                if ":" in line:
                    parts = line.split(":", 1)
                    key = parts[0].strip()
                    value = parts[1].strip().strip('"').strip("'")
                    if key:
                        current_entry[key] = value

            if current_entry:
                detailed_list.append(current_entry)

    except Exception:
        return []

    return detailed_list
