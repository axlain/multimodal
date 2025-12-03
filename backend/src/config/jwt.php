<?php
return [
  'secret'   => getenv('JWT_SECRET') ?: 'hvIN5ilYgAg8/LcuZqcvpUfijryEZbxrwdZ9KTrGCt5O5EE1pYwz1/ZnglhsapDPsxUoh1i4Ry4AwR+B7jYSaA==',
  'issuer'   => getenv('JWT_ISS') ?: 'sitev-backend',
  'audience' => getenv('JWT_AUD') ?: 'sitev-client',
  'ttl'      => (int)(getenv('JWT_TTL') ?: 3600),
  'leeway'   => 60,
];
