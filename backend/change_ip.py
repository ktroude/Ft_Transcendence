import re
import socket
from pathlib import Path

env_file = ".env"
localhost_variable = "LOCALHOST"
redirect_uri_variable = "REDIRECT_URI"
database_url_variable = "DATABASE_URL"

# Récupération de l'adresse IP de la machine
ip_address = socket.gethostbyname(socket.gethostname())

# Vérification si le fichier .env existe
if not Path(env_file).is_file():
    print(f"Le fichier {env_file} n'existe pas.")
    exit(1)

# Lecture du fichier .env
with open(env_file, "r") as file:
    env_lines = file.readlines()

# Recherche et modification des variables LOCALHOST, REDIRECT_URI et DATABASE_URL
for i, line in enumerate(env_lines):
    if line.startswith(f"{localhost_variable}="):
        env_lines[i] = f"{localhost_variable}='{ip_address}'\n"

    elif line.startswith(f"{redirect_uri_variable}="):
        redirect_uri = re.sub(r'http://.*?/token', f'http://{ip_address}:3000/token', line)
        env_lines[i] = redirect_uri

    elif line.startswith(f"{database_url_variable}="):
        database_url = re.sub(r'postgresql://.*?@.*?:\d+/nest\?schema=public', f'postgresql://postgres:password@{ip_address}:5432/nest?schema=public', line)
        env_lines[i] = database_url

# Écriture des modifications dans le fichier .env
with open(env_file, "w") as file:
    file.writelines(env_lines)