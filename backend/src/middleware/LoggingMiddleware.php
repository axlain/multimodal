<?php
namespace App\Middleware;

final class LoggingMiddleware
{
    public static function logRequest(): void
    {
        $line = sprintf(
            '[%s] %s %s (%s)%s',
            date('c'),
            $_SERVER['REQUEST_METHOD'] ?? '?',
            $_SERVER['REQUEST_URI'] ?? '?',
            $_SERVER['REMOTE_ADDR'] ?? '-',
            PHP_EOL
        );
        @file_put_contents(__DIR__ . '/../../logs/access.log', $line, FILE_APPEND);
    }
}
