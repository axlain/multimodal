<?php

$secret = getenv('JWT_SECRET');

// ❗ Si no hay secret, NO arrancar el backend
if (!$secret) {
    throw new RuntimeException(
        "ERROR: Falta JWT_SECRET en las variables de entorno. El backend no puede arrancar sin un secret seguro."
    );
}

return [
    'secret'   => $secret,
    'issuer'   => getenv('JWT_ISS') ?: 'sitev-backend',
    'audience' => getenv('JWT_AUD') ?: 'sitev-client',
    'ttl'      => (int)(getenv('JWT_TTL') ?: 3600),
    'leeway'   => 60,
];
