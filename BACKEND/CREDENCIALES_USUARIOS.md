# Credenciales de Usuarios — Pinterest Clone

## Usuarios Creados (Supabase)

| # | Nombre | Correo | Contraseña |
|---|--------|--------|------------|
| 1 | Ana García | `ana.garcia@pinterest.ec` | `Ana2024!` |
| 2 | Carlos López | `carlos.lopez@pinterest.ec` | `Carlos2024!` |
| 3 | María Rodríguez | `maria.rodriguez@pinterest.ec` | `Maria2024!` |
| 4 | Pedro Martínez | `pedro.martinez@pinterest.ec` | `Pedro2024!` |

## Usuarios Existentes

| # | Nombre | Correo | Contraseña |
|---|--------|--------|------------|
| 5 | Administrador | `admin@pinterest.ec` | `admin202610` |
| 6 | Ariel | `arielmelo.lapgem@gmail.com` | (no disponible) |
| 7 | DEVELOPER | `developer@gmail.com` | (no disponible) |
| 8 | test_user_123 | `test123@test.com` | (no disponible) |
| 9 | Ariel Produccion | `apA1@gmail.com` | (no disponible) |

## Datos Sembrados

### Imágenes en S3
- **Bucket:** `pinterests3uide`
- **Región:** `us-east-1`
- **Total imágenes:** 36
- **Prefijo:** `pins/`

### Categorías (3 imágenes cada una)
- Naturaleza, Arte, Arquitectura, Moda, Comida, Tecnología
- Viajes, Mascotas, Deportes, Hogar, Fotografía, Salud

### Pins en Base de Datos
- **Total pins:** 60 (24 existentes + 36 nuevos)
- **Distribución:** 12 usuarios con pins asignados

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Iniciar sesión |
| POST | `/api/v1/auth/register` | Registrar usuario |
| GET | `/api/v1/pins` | Listar pins |
| GET | `/api/v1/pins/{id}` | Obtener pin por ID |

### Login (ejemplo con curl)
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -d '{"correo": "ana.garcia@pinterest.ec", "clave": "Ana2024!"}' \
  -c cookies.txt
```
