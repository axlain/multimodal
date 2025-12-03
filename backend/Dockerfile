# Ejemplo base
FROM php:8.1-apache
# Si usas FPM sería: FROM php:8.1-fpm

# Instalar extensiones MySQL
RUN apt-get update && apt-get install -y \
    zip unzip libzip-dev \
 && docker-php-ext-install zip mysqli pdo pdo_mysql \
 && docker-php-ext-enable zip mysqli pdo_mysql

# (opcional) habilitar mod_rewrite si usas Apache
RUN a2enmod rewrite

# COPY . /var/www/html   # (deja lo que ya tengas)

# 🔹 Instalar utilidades necesarias para Composer
RUN apt-get update && apt-get install -y \
    git unzip curl zip \
    && rm -rf /var/lib/apt/lists/*

# 🔹 Instalar Composer de manera permanente (desde imagen oficial)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Establecer el directorio de trabajo
WORKDIR /var/www/html

# Copiar el contenido del backend al contenedor
COPY . /var/www/html

# 🔹 Ajustar permisos para Apache
RUN chown -R www-data:www-data /var/www/html \
 && chmod -R 755 /var/www/html

