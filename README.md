# Cokie Tasks — Plataforma de Gestión y Productividad Estudiantil

Plataforma web de productividad y bienestar universitario desarrollada con arquitectura modular en JavaScript vainilla (ES6), maquetación responsiva con Tailwind CSS y un simulador arcade integrado para pausas activas.

---

## 🏛️ Flujo de Usuario y Control de Acceso (Onboarding Gate)

La aplicación implementa un flujo de acceso secuencial y persistente:

1. **Acceso Inicial / Registro Obligatorio:**  
   Al ingresar por primera vez o con sesión cerrada, la pantalla de inicio presenta la **Ficha de Registro Estudiantil**. Las pestañas de *Mis Tareas* y *Cokie Astronauta* permanecen bloqueadas (con indicador de candado y estado inactivo).
2. **Validación y Desbloqueo Automático:**  
   Al completar la validación de los campos obligatorios (nombre, correo universitario, contraseña alfanumérica y carrera), se activa la credencial del estudiante, se desbloquean todas las funcionalidades y el sistema redirige automáticamente al **Gestor de Tareas** con un saludo personalizado.
3. **Edición del Perfil Estudiantil:**  
   Desde la pestaña *Mi Perfil*, el usuario puede consultar su credencial digital y hacer clic en **Editar Información** para modificar su nombre, correo institucional, facultad o actualizar su contraseña, sincronizando los cambios en toda la interfaz (carnet, cabecera y saludo).
4. **Cierre de Sesión:**  
   Disponible tanto en la cabecera como en la credencial digital. Al cerrar sesión, se revoca el acceso a las tareas y al minijuego, regresando inmediatamente a la vista de **Registro Estudiantil**.

---

## 📁 Estructura del Código

```text
CokieTasks/
├── index.html            # Interfaz de usuario semántica y accesible (HTML5 / Tailwind CSS)
├── assets/               # Recursos gráficos optimizados (sprites, texturas, branding)
├── css/
│   └── styles.css        # Variables de diseño, tipografías y estilos del motor arcade
└── js/
    ├── app.js            # Orquestador central, control de acceso y navegación reactiva
    ├── tasks.js          # Módulo de gestión del ciclo de vida de tareas y sincronización de estado
    ├── validator.js      # Motor de autenticación, validación, edición de perfil y logout
    └── game.js           # Motor del minijuego con física integrada y renderizado a 60 FPS
```

---

## ✨ Módulos y Funcionalidades

### 1. Autenticación y Perfil (`validator.js`)
- **Validación en tiempo real:** Control de nombres alfabéticos, formato estricto de correo electrónico y medidor reactivo de entropía de contraseñas.
- **Modo Edición In-Situ:** Formulario dinámico bidireccional que permite alternar entre visualización de credencial y edición de datos.
- **Persistencia de sesión:** Almacenamiento seguro del estado de sesión local para preservar la experiencia del usuario entre recargas.

### 2. Tablero de Actividades Estudiantiles (`tasks.js`)
- **Gestión reactiva de elementos:** Inserción de nuevas tareas con categorización cromática, marca de tiempo y animaciones de entrada.
- **Edición en línea:** Modificación del texto de cualquier tarea mediante inyección de un input temporal.
- **Transiciones de estado:** Conmutación de tareas completadas/pendientes con ajuste dinámico de contadores de productividad.
- **Búsqueda y filtrado continuo:** Búsqueda en tiempo real por texto y filtrado por estado (`Todas`, `Pendientes`, `Completadas`).
- **Eliminación y limpieza:** Depuración individual y en lote de actividades con transiciones de salida.

### 3. Simulador Arcade Cokie Astronauta (`game.js`)
- **Motor físico normalizado:** Implementación de ciclo de juego a 60 FPS con DeltaTime para garantizar consistencia en pantallas de cualquier tasa de refresco.
- **Física y detección de colisiones:** Modelo de gravedad e impulso vertical con detección de colisiones AABB con márgenes de tolerancia.
- **Control adaptativo:** Soporte completo para teclado (<kbd>Espacio</kbd> / <kbd>↑</kbd>), puntero y eventos táctiles en dispositivos móviles.
- **Marcador de sesión:** Despliegue de puntuación en tiempo real y pantalla de fin de partida (mostrando puntaje final).

---

## 🚀 Despliegue y Ejecución Local

Para ejecutar el proyecto de forma local:

```bash
cd D:\Portafolio\Proyectos\CokieTasks
python -m http.server 3000
```

Luego abre en tu navegador:
```text
http://localhost:3000
```
