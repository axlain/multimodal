# Ejemplo base
FROM php:8.1-apache
# Si usas FPM sería: FROM php:8.1-fpm

# Instalar extensiones MySQL
RUN docker-php-ext-install mysqli pdo pdo_mysql \
 && docker-php-ext-enable mysqli pdo_mysql

# (opcional) habilitar mod_rewrite si usas Apache
RUN a2enmod rewrite

# COPY . /var/www/html   # (deja lo que ya tengas)
