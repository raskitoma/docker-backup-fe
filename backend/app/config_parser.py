import re
import json

def parse_config(path): 
    sections = {}
    parent = None  # Tracks the [[double_bracket]] sections
    current = None # Tracks the [single_bracket] or current active dict

    with open(path) as f:
        for line in f:
            line = line.strip()

            if not line or line.startswith("#"):
                continue

            # 1. Check for Parent Sections [[master_params]]
            m_parent = re.match(r"\[\[(.*)\]\]", line)
            if m_parent:
                parent = m_parent.group(1)
                sections[parent] = {}
                current = parent # Keys can still belong directly to parent
                continue

            # 2. Check for Sub-sections [webtop]
            m_sub = re.match(r"\[(.*)\]", line)
            if m_sub:
                sub = m_sub.group(1)
                if parent:
                    # Nest it inside the current parent
                    sections[parent][sub] = {}
                    current = sub 
                else:
                    # Fallback if there is no parent
                    sections[sub] = {}
                    current = sub
                continue

            # 3. Handle Key-Value Pairs
            if "=" in line and current:
                k, v = line.split("=", 1)
                key = k.strip()
                val = v.strip()
                
                if parent and current != parent:
                    # It's inside a sub-section
                    sections[parent][current][key] = val
                else:
                    # It's directly in a top-level section
                    sections[current][key] = val

    return sections
