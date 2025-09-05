# Etapa 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar todas las dependencias (dev + prod)
RUN npm install

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine

WORKDIR /app

# Copiar solo dependencies de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiar archivos compilados
COPY --from=build /app/dist ./dist

# Exponer puerto
EXPOSE 4000

CMD ["node", "dist/index.js"]
