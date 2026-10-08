/**
 * tasks.js - Manipulación avanzada del DOM para gestión de tareas
 * Cumple con los requisitos de:
 * - AGREGAR elementos dinámicamente al DOM (createElement, appendChild, animación)
 * - MODIFICAR elementos dinámicamente en el DOM (toggle de estado, edición in-situ)
 * - ELIMINAR elementos dinámicamente del DOM (remove con animación)
 * - Eventos no intrusivos: click, change, keyup, input
 */

export function initTasks() {
  const taskInput = document.getElementById('new-task-input');
  const taskCategory = document.getElementById('task-category');
  const taskPriority = document.getElementById('task-priority');
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskList = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-tasks-state');
  
  // Contadores dinámicos del DOM
  const totalCountEl = document.getElementById('tasks-total-count');
  const pendingCountEl = document.getElementById('tasks-pending-count');
  const completedCountEl = document.getElementById('tasks-completed-count');
  
  // Filtros y búsqueda
  const searchInput = document.getElementById('task-search-input');
  const filterSelect = document.getElementById('task-filter-select');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  if (!taskList || !taskInput || !addTaskBtn) return;

  // Actualizar estadísticas en el DOM
  const updateCounters = () => {
    const allTasks = taskList.querySelectorAll('.task-item');
    const completedTasks = taskList.querySelectorAll('.task-item.is-completed');
    const total = allTasks.length;
    const completed = completedTasks.length;
    const pending = total - completed;

    if (totalCountEl) totalCountEl.textContent = total;
    if (pendingCountEl) pendingCountEl.textContent = pending;
    if (completedCountEl) completedCountEl.textContent = completed;

    // Mostrar/ocultar estado vacío dinámicamente
    if (emptyState) {
      if (total === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  };

  // Helper para crear badges con estilos según categoría
  const getCategoryBadge = (category) => {
    const styles = {
      'Estudio': 'bg-blue-50 text-blue-700 border-blue-200',
      'Proyecto': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Examen': 'bg-rose-50 text-rose-700 border-rose-200',
      'Personal': 'bg-amber-50 text-amber-700 border-amber-200'
    };
    const badgeClass = styles[category] || 'bg-slate-50 text-slate-700 border-slate-200';
    return `<span class="px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badgeClass}">${category}</span>`;
  };

  // 1. AGREGAR ELEMENTO AL DOM
  const addTask = () => {
    const text = taskInput.value.trim();
    if (!text) {
      taskInput.classList.add('input-invalid');
      taskInput.focus();
      return;
    }
    taskInput.classList.remove('input-invalid');

    const category = taskCategory ? taskCategory.value : 'Estudio';
    const priority = taskPriority ? taskPriority.value : 'Normal';
    const taskId = `task-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Creación dinámica del elemento <li>
    const li = document.createElement('li');
    li.className = 'task-item task-enter bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm smooth-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3';
    li.setAttribute('data-id', taskId);
    li.setAttribute('data-category', category);
    li.setAttribute('data-priority', priority);

    li.innerHTML = `
      <div class="flex items-center gap-3 w-full sm:w-auto flex-1">
        <!-- Evento CHANGE en el checkbox -->
        <input type="checkbox" class="task-checkbox h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" aria-label="Marcar como completada">
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            ${getCategoryBadge(category)}
            <span class="text-xs text-slate-400 font-medium">${timestamp}</span>
          </div>
          <!-- Contenido textual modificable dinámicamente -->
          <p class="task-title text-slate-800 font-medium text-sm sm:text-base break-words">${escapeHTML(text)}</p>
        </div>
      </div>

      <!-- Acciones de modificación y eliminación -->
      <div class="flex items-center gap-2 self-end sm:self-center">
        <!-- Botón EDITAR (Modificar DOM) -->
        <button type="button" class="btn-edit-task p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Modificar tarea" aria-label="Modificar tarea">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>

        <!-- Botón ELIMINAR (Eliminar DOM) -->
        <button type="button" class="btn-delete-task p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Eliminar tarea" aria-label="Eliminar tarea">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    `;

    // Insertar dinámicamente en el DOM (al inicio de la lista)
    taskList.prepend(li);
    taskInput.value = '';
    taskInput.focus();

    updateCounters();
  };

  // 2. MODIFICAR ELEMENTOS EN EL DOM
  const toggleTaskComplete = (checkbox) => {
    const taskItem = checkbox.closest('.task-item');
    if (!taskItem) return;

    const titleEl = taskItem.querySelector('.task-title');

    if (checkbox.checked) {
      taskItem.classList.add('is-completed', 'bg-slate-50/70', 'opacity-75');
      taskItem.classList.remove('bg-white');
      if (titleEl) {
        titleEl.classList.add('line-through', 'text-slate-400');
        titleEl.classList.remove('text-slate-800');
      }
    } else {
      taskItem.classList.remove('is-completed', 'bg-slate-50/70', 'opacity-75');
      taskItem.classList.add('bg-white');
      if (titleEl) {
        titleEl.classList.remove('line-through', 'text-slate-400');
        titleEl.classList.add('text-slate-800');
      }
    }

    updateCounters();
  };

  const startInlineEdit = (editBtn) => {
    const taskItem = editBtn.closest('.task-item');
    if (!taskItem) return;

    const titleEl = taskItem.querySelector('.task-title');
    if (!titleEl || taskItem.querySelector('.inline-edit-input')) return;

    const currentText = titleEl.textContent;

    // Crear dinámicamente un input de edición in-situ
    const editContainer = document.createElement('div');
    editContainer.className = 'flex items-center gap-2 mt-1 w-full inline-edit-container';
    editContainer.innerHTML = `
      <input type="text" class="inline-edit-input text-sm px-2.5 py-1 border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full" value="${escapeHTML(currentText)}">
      <button type="button" class="btn-save-inline px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">Guardar</button>
      <button type="button" class="btn-cancel-inline px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer">Cancelar</button>
    `;

    titleEl.classList.add('hidden');
    titleEl.after(editContainer);

    const input = editContainer.querySelector('.inline-edit-input');
    input.focus();
    input.select();

    // Guardar cambios
    const saveEdit = () => {
      const newText = input.value.trim();
      if (newText) {
        titleEl.textContent = newText;
      }
      editContainer.remove();
      titleEl.classList.remove('hidden');
    };

    // Cancelar cambios
    const cancelEdit = () => {
      editContainer.remove();
      titleEl.classList.remove('hidden');
    };

    editContainer.querySelector('.btn-save-inline').addEventListener('click', saveEdit);
    editContainer.querySelector('.btn-cancel-inline').addEventListener('click', cancelEdit);

    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') saveEdit();
      if (e.key === 'Escape') cancelEdit();
    });
  };

  // 3. ELIMINAR ELEMENTOS DEL DOM
  const deleteTask = (deleteBtn) => {
    const taskItem = deleteBtn.closest('.task-item');
    if (!taskItem) return;

    // Animación de salida antes de remover el nodo del DOM
    taskItem.classList.remove('task-enter');
    taskItem.classList.add('task-leave');

    setTimeout(() => {
      taskItem.remove(); // Eliminación física del DOM
      updateCounters();
    }, 240);
  };

  // 4. DELEGACIÓN DE EVENTOS NO INTRUSIVA (click, change)
  taskList.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.btn-delete-task');
    if (deleteBtn) {
      deleteTask(deleteBtn);
      return;
    }

    const editBtn = e.target.closest('.btn-edit-task');
    if (editBtn) {
      startInlineEdit(editBtn);
      return;
    }
  });

  taskList.addEventListener('change', (e) => {
    if (e.target.classList.contains('task-checkbox')) {
      toggleTaskComplete(e.target);
    }
  });

  // Evento CLICK en botón Añadir Tarea
  addTaskBtn.addEventListener('click', addTask);

  // Evento KEYUP en el campo de entrada (Enter para agregar)
  taskInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  // Evento CLICK para eliminar todas las tareas completadas
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', () => {
      const completedTasks = taskList.querySelectorAll('.task-item.is-completed');
      completedTasks.forEach((item) => {
        item.classList.add('task-leave');
        setTimeout(() => {
          item.remove();
          updateCounters();
        }, 200);
      });
    });
  }

  // 5. FILTRADO DINÁMICO (Eventos change y keyup/input)
  const filterTasks = () => {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filter = filterSelect ? filterSelect.value : 'all';
    const items = taskList.querySelectorAll('.task-item');

    items.forEach((item) => {
      const title = item.querySelector('.task-title')?.textContent.toLowerCase() || '';
      const isCompleted = item.classList.contains('is-completed');
      
      const matchesSearch = title.includes(query);
      let matchesFilter = true;

      if (filter === 'pending') matchesFilter = !isCompleted;
      if (filter === 'completed') matchesFilter = isCompleted;

      if (matchesSearch && matchesFilter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  };

  if (searchInput) {
    searchInput.addEventListener('keyup', filterTasks);
    searchInput.addEventListener('input', filterTasks);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', filterTasks);
  }

  // Helper para prevenir inyecciones XSS
  function escapeHTML(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
  }

  // Iniciar contadores iniciales
  updateCounters();
}
