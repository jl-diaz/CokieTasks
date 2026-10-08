# Cokie Tasks — Gestor Estudiantil & Pausa Activa

Aplicación web desarrollada para cumplir con todos los requerimientos de la actividad de JavaScript, manipulación del DOM, eventos y validación de formularios, con diseño moderno, responsivo y la recreación fiel del minijuego **Cokie Astronauta** (Easter-Egg del proyecto original *Cokie College*).

---

## 📋 Cumplimiento de Requerimientos de la Actividad

| Requerimiento | Implementación en el Proyecto | Ubicación en el Código |
| :--- | :--- | :--- |
| **HTML y CSS para estructura y diseño** | HTML5 semántico (`<header>`, `<nav>`, `<main>`, `<section>`, etc.) estilizado con **Tailwind CSS** y **CSS personalizado** (`styles.css`), fuentes *Outfit* y *Plus Jakarta Sans*, paleta de marca y diseño 100% responsivo para móviles, tablets y desktop. | `index.html`<br>`css/styles.css` |
| **JavaScript no intrusivo** | Ningún atributo `onclick`, `onchange` o `onsubmit` en el HTML. Todo el comportamiento se conecta mediante `addEventListener` en módulos ES6 independientes. | `js/app.js`<br>`js/tasks.js`<br>`js/validator.js`<br>`js/game.js` |
| **Manipulación del DOM: Agregar** | Se crean dinámicamente nuevos elementos `<li>` en la lista de tareas con badges de categoría, fecha, checkbox y botones de acción, usando `document.createElement`, `prepend` y animaciones suaves. | `js/tasks.js` (`addTask`) |
| **Manipulación del DOM: Modificar** | 1. Marcado de completado modificando clases y estilos (`line-through`, opacidad).<br>2. Edición in-situ del texto de la tarea mediante inyección dinámica de un `<input>` de edición y botón de guardar.<br>3. Actualización dinámica del carnet del estudiante con los datos validados. | `js/tasks.js` (`toggleTaskComplete`, `startInlineEdit`)<br>`js/validator.js` |
| **Manipulación del DOM: Eliminar** | 1. Eliminación individual de nodos con animación de salida (`.task-leave`) y método `.remove()`.<br>2. Botón para eliminar en masa todas las tareas completadas.<br>3. Eliminación y reciclado dinámico de obstáculos en el juego. | `js/tasks.js` (`deleteTask`, `clearCompletedBtn`)<br>`js/game.js` |
| **Uso de múltiples eventos** | • `click`: Botones de agregar, editar, eliminar, limpiar, salto en el juego.<br>• `change`: Checkbox de estado, selector de categoría, filtro de tareas, selector de carrera.<br>• `keyup` / `input`: Validación en tiempo real, Enter para enviar tarea, medidor de fuerza de contraseña, buscador en vivo.<br>• `blur`: Validación al perder el foco.<br>• `submit`: Envío del formulario interceptado con `e.preventDefault()`.<br>• `keydown` / `touchstart`: Controles del juego para desktop y pantallas táctiles. | Toda la carpeta `js/` |
| **Validación de formulario (≥ 3 campos)** | Formulario de Registro Estudiantil con 4 campos:<br>1. **Nombre completo**: Mínimo 3 caracteres, solo letras y espacios.<br>2. **Correo universitario**: Formato estándar de email verificado con regex.<br>3. **Contraseña**: Mínimo 8 caracteres, combinación alfanumérica y medidor reactivo de seguridad.<br>4. **Carrera / Especialidad**: Selector con evento `change`. | `js/validator.js` |
| **Funcionalidad extra de libre elección** | **Minijuego Cokie Astronauta**: Recreación exacta del Easter-Egg de *Cokie College*, con el astronauta canino (`CokieAstronauta.png`), fondo estelar (`GalaxyBG.jpg`), tubos con barras energéticas sci-fi, físicas de gravedad/salto con DeltaTime a 60FPS. Cumple la instrucción de **mostrar únicamente la puntuación final sin almacenar récord**. | `js/game.js` |

---

## 🚀 Cómo Ejecutar la Aplicación

1. Navega a la carpeta del proyecto:
   ```bash
   cd d:\Portafolio\Proyectos\Cokie_Tasks
   ```
2. Puedes abrir directamente el archivo `index.html` en cualquier navegador web moderno (Chrome, Edge, Firefox, Safari), o servirlo mediante una extensión como Live Server o un servidor local:
   ```bash
   # Opción con Python:
   python -m http.server 3000
   ```
3. Accede a `http://localhost:3000` en tu navegador.

---

## 🎨 Aspectos de Diseño (`ui-ux-pro-max`)

- **Tipografía**: Jerarquía cuidada combinando `Outfit` (titulares y números de gran peso visual) y `Plus Jakarta Sans` (lectura cómoda y profesional).
- **Iconografía**: Iconos vectoriales SVG puros (Heroicons/Lucide); se evitó el uso de emojis como iconos estructurales.
- **Microinteracciones**: Transiciones de 150-250ms, feedback de pulsación, efectos de foco visibles y accesibles para teclado.
- **Paleta de Color**: Azul marino institucional (`#0B1956`), Amarillo soleado (`#F6BE2F`), Cian energético (`#38BDF8`), sobre fondos suaves neutros (`#F8FAFC`, `#FFFFFF`).
