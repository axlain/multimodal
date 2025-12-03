# Dockerfile frontend
FROM node:22

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de configuración de npm (package.json y package-lock.json)
COPY package*.json ./

# Instala todas las dependencias
RUN npm install

# Copia el resto del código fuente dentro del contenedor
COPY . .

# Expone el puerto 3000 para que puedas acceder a la app
EXPOSE 3000

# Ejecuta el servidor de desarrollo de Vite (en vez de npm run dev)
CMD ["npm", "run", "dev"]
