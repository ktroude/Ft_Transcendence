import re
import socket
from pathlib import Path

env_file = "./src/API/env.js"
localhost_variable = "export const LOCALHOST"

# Récupération de l'adresse IP de la machine
ip_address = socket.gethostbyname(socket.gethostname())

# Vérification si le fichier .env existe
if not Path(env_file).is_file():
    print(f"Le fichier {env_file} n'existe pas.")
    exit(1)

# Lecture du fichier .env
with open(env_file, "r") as file:
    env_lines = file.readlines()

# Recherche et modification des variables LOCALHOST
for i, line in enumerate(env_lines):
    if line.startswith(f"{localhost_variable}="):
        env_lines[i] = f"{localhost_variable}='{ip_address}'\n"

# Écriture des modifications dans le fichier .env
with open(env_file, "w") as file:
    file.writelines(env_lines)