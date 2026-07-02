# ==========================================
# Étape 1 : Construction de l'application
# ==========================================
FROM node:22-slim AS builder
WORKDIR /app

# Copie des fichiers de configuration des dépendances
COPY package*.json ./
RUN npm install

# Copie du reste du code source et compilation
COPY . .
RUN npm run build

# ==========================================
# Étape 2 : Serveur de production Nginx
# ==========================================
FROM nginx:alpine

# Copie des fichiers compilés du builder vers le dossier public de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuration personnalisée de Nginx pour gérer le routage Single Page Application (SPA)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://tasklist-backend:3000/api/; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]