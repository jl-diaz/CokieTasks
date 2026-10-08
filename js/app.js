/**
 * app.js - Orquestador principal de la aplicación Cokie Tasks
 * Inicialización no intrusiva tras la carga del DOM
 */

import { initValidator } from './validator.js';
import { initTasks } from './tasks.js';
import { initGame } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
  console.info('Cokie Tasks inicializado correctamente.');

  // Inicialización de submódulos
  initValidator();
  initTasks();
  initGame();

  // Control no intrusivo de pestañas / vistas principales
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const sections = {
    'tab-tasks': document.getElementById('section-tasks'),
    'tab-student': document.getElementById('section-student'),
    'tab-game': document.getElementById('section-game')
  };

  const switchTab = (targetTabId) => {
    tabButtons.forEach(btn => {
      const isTarget = btn.getAttribute('data-target') === targetTabId;
      if (isTarget) {
        btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
        btn.classList.remove('bg-white', 'text-slate-600', 'hover:bg-slate-100');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'text-slate-600', 'hover:bg-slate-100');
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

    // Ajustar dimensiones del juego si se activa la pestaña del juego
    if (targetTabId === 'tab-game') {
      window.dispatchEvent(new Event('resize'));
    }
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = btn.getAttribute('data-target');
      if (target) {
        switchTab(target);
      }
    });
  });

  // Botón de acceso directo en el header para abrir el juego
  const quickGameBtn = document.getElementById('quick-launch-game-btn');
  if (quickGameBtn) {
    quickGameBtn.addEventListener('click', () => {
      switchTab('tab-game');
    });
  }

  // Botón en la sección de tareas para tomar una pausa activa
  const breakGameBtn = document.getElementById('take-break-btn');
  if (breakGameBtn) {
    breakGameBtn.addEventListener('click', () => {
      switchTab('tab-game');
    });
  }
});
