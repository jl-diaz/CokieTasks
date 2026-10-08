/**
 * app.js - Orquestador principal de la plataforma Cokie Tasks
 * 
 * Gestiona el control de acceso inicial (Registro previo obligatorio),
 * el estado de autenticación de la sesión, el bloqueo/desbloqueo dinámico de pestañas,
 * la personalización de la interfaz y la navegación fluida entre vistas.
 */

import { initValidator } from './validator.js';
import { initTasks } from './tasks.js';
import { initGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicialización de submódulos de tareas y juego
  initTasks();
  initGame();

  // Controles de navegación y encabezado
  const tabAuthBtn = document.getElementById('tab-auth-btn');
  const tabTasksBtn = document.getElementById('tab-tasks-btn');
  const tabGameBtn = document.getElementById('tab-game-btn');
  const tabButtons = document.querySelectorAll('.nav-tab-btn');

  const guestHeaderBadge = document.getElementById('guest-header-badge');
  const authHeaderBar = document.getElementById('auth-header-bar');
  const headerUserName = document.getElementById('header-user-name');
  const tasksGreetingName = document.getElementById('tasks-greeting-name');
  const tasksGreetingSub = document.getElementById('tasks-greeting-sub');

  // Mapeo de secciones
  const sections = {
    'tab-student': document.getElementById('section-student'),
    'tab-tasks': document.getElementById('section-tasks'),
    'tab-game': document.getElementById('section-game')
  };

  let isUserAuthenticated = false;

  // Función de conmutación de pestañas
  const switchTab = (targetTabId) => {
    // Si el usuario no está registrado y quiere ir a tareas o juego, restringir navegación
    if (!isUserAuthenticated && (targetTabId === 'tab-tasks' || targetTabId === 'tab-game')) {
      targetTabId = 'tab-student';
    }

    tabButtons.forEach(btn => {
      const isTarget = btn.getAttribute('data-target') === targetTabId;
      if (isTarget) {
        btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-white', 'text-slate-600', 'hover:bg-slate-100');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
        if (btn.classList.contains('cursor-not-allowed')) {
          btn.classList.add('bg-white', 'text-slate-400');
        } else {
          btn.classList.add('bg-white', 'text-slate-600', 'hover:bg-slate-100');
        }
        btn.setAttribute('aria-selected', 'false');
      }
    });

    Object.entries(sections).forEach(([id, sectionEl]) => {
      if (!sectionEl) return;
      if (id === targetTabId) {
        sectionEl.classList.remove('hidden');
        sectionEl.classList.add('task-enter');
      } else {
        sectionEl.classList.add('hidden');
      }
    });

    // Recalcular dimensiones del juego si se activa su pestaña
    if (targetTabId === 'tab-game') {
      window.dispatchEvent(new Event('resize'));
    }
  };

  // Callback de cambio de estado de autenticación (emitido por validator.js)
  const handleAuthChange = (isLoggedIn, user, shouldRedirectToTasks = false) => {
    isUserAuthenticated = isLoggedIn;

    if (isLoggedIn && user) {
      // 1. USUARIO AUTENTICADO: Desbloquear acceso completo
      if (guestHeaderBadge) guestHeaderBadge.classList.add('hidden');
      if (authHeaderBar) authHeaderBar.classList.remove('hidden');
      if (headerUserName) headerUserName.textContent = user.name.split(' ')[0] || user.name;

      // Personalizar saludo en la vista de tareas
      if (tasksGreetingName) {
        tasksGreetingName.textContent = `¡Hola, ${user.name.split(' ')[0]}! 👋`;
      }
      if (tasksGreetingSub) {
        tasksGreetingSub.textContent = `Programa: ${user.career} — Aquí tienes tus actividades y notas al día.`;
      }

      // Actualizar botón de la primera pestaña a "Mi Perfil"
      if (tabAuthBtn) {
        tabAuthBtn.textContent = 'Mi Perfil';
      }

      // Desbloquear pestañas de tareas y juego
      [tabTasksBtn, tabGameBtn].forEach(btn => {
        if (!btn) return;
        btn.classList.remove('opacity-60', 'cursor-not-allowed', 'text-slate-400');
        btn.classList.add('text-slate-600', 'hover:bg-slate-100', 'cursor-pointer');
        btn.removeAttribute('disabled');

        const lockIcon = btn.querySelector('.tab-lock-icon');
        if (lockIcon) lockIcon.classList.add('hidden');
      });

      // Si fue tras un registro exitoso, redirigir automáticamente a "Mis Tareas"
      if (shouldRedirectToTasks) {
        switchTab('tab-tasks');
      }
    } else {
      // 2. MODO INVITADO / SESIÓN CERRADA: Bloquear acceso a tareas y arcade
      if (guestHeaderBadge) guestHeaderBadge.classList.remove('hidden');
      if (authHeaderBar) authHeaderBar.classList.add('hidden');

      if (tabAuthBtn) {
        tabAuthBtn.textContent = 'Registro Estudiantil';
      }

      // Bloquear pestañas
      [tabTasksBtn, tabGameBtn].forEach(btn => {
        if (!btn) return;
        btn.classList.add('opacity-60', 'cursor-not-allowed', 'text-slate-400');
        btn.classList.remove('text-slate-600', 'hover:bg-slate-100', 'cursor-pointer');
        btn.setAttribute('disabled', 'true');

        const lockIcon = btn.querySelector('.tab-lock-icon');
        if (lockIcon) lockIcon.classList.remove('hidden');
      });

      // Forzar navegación al formulario de registro inicial
      switchTab('tab-student');
    }
  };

  // Inicializar validator.js y conectar su callback de autenticación
  initValidator(handleAuthChange);

  // Escuchadores de eventos para navegación por pestañas
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      if (target) {
        switchTab(target);
      }
    });
  });

  // Botón directo a Tareas desde la Credencial
  const profileToTasksBtn = document.getElementById('btn-profile-to-tasks');
  if (profileToTasksBtn) {
    profileToTasksBtn.addEventListener('click', () => {
      switchTab('tab-tasks');
    });
  }

  // Botón de Pausa Activa desde el banner de Tareas
  const tasksBannerGameBtn = document.getElementById('tasks-banner-game-btn');
  if (tasksBannerGameBtn) {
    tasksBannerGameBtn.addEventListener('click', () => {
      switchTab('tab-game');
    });
  }

  // Botón rápido en el Header
  const quickGameBtn = document.getElementById('quick-launch-game-btn');
  if (quickGameBtn) {
    quickGameBtn.addEventListener('click', () => {
      switchTab('tab-game');
    });
  }

  // Botón de pausa desde el estado vacío de tareas
  const takeBreakBtn = document.getElementById('take-break-btn');
  if (takeBreakBtn) {
    takeBreakBtn.addEventListener('click', () => {
      switchTab('tab-game');
    });
  }
});
