/**
 * validator.js - Módulo de autenticación, validación y gestión del perfil estudiantil
 * 
 * Gestiona el ciclo completo de identidad del estudiante:
 * - Validación en tiempo real (nombre, correo institucional, contraseña y programa académico)
 * - Registro inicial (onboarding) con desbloqueo de funcionalidades
 * - Modo de edición de datos con sincronización reactiva en el DOM
 * - Cierre de sesión y restablecimiento del estado de acceso
 */

export function initValidator(onAuthChange) {
  const formCard = document.getElementById('student-form-card');
  const profileView = document.getElementById('student-profile-view');
  const form = document.getElementById('student-form');
  const formTitle = document.getElementById('form-card-title');
  const formSubtitle = document.getElementById('form-card-subtitle');
  const registerNotice = document.getElementById('register-required-notice');
  const submitBtn = document.getElementById('student-submit-btn');
  const cancelEditBtn = document.getElementById('btn-cancel-edit');
  const editProfileBtn = document.getElementById('btn-start-edit-profile');
  const profileLogoutBtn = document.getElementById('btn-profile-logout');

  // Campos de entrada
  const nameInput = document.getElementById('student-name');
  const emailInput = document.getElementById('student-email');
  const passwordInput = document.getElementById('student-password');
  const careerSelect = document.getElementById('student-career');
  
  // Elementos de retroalimentación
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  const passwordFieldLabel = document.getElementById('password-field-label');
  const passwordRequiredStar = document.getElementById('password-required-star');

  // Elementos de la Credencial Digital en el DOM
  const profileName = document.getElementById('profile-name-display');
  const profileEmail = document.getElementById('profile-email-display');
  const profileBadge = document.getElementById('profile-badge-display');
  const profileId = document.getElementById('profile-id-display');
  const successAlert = document.getElementById('form-success-alert');
  const successTitle = document.getElementById('success-alert-title');
  const successDesc = document.getElementById('success-alert-desc');

  if (!form || !nameInput || !emailInput || !passwordInput) return;

  // Estado del perfil
  let isEditingMode = false;
  let currentUser = null;

  // Recuperar sesión persistida si existe
  try {
    const saved = localStorage.getItem('cokie_student_session');
    if (saved) {
      currentUser = JSON.parse(saved);
    }
  } catch (e) {
    currentUser = null;
  }

  // Reglas de validación
  const validateName = () => {
    const val = nameInput.value.trim();
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,40}$/;
    
    if (val.length === 0) {
      showError(nameInput, nameError, 'El nombre es obligatorio.');
      return false;
    } else if (val.length < 3) {
      showError(nameInput, nameError, 'Debe contener al menos 3 caracteres.');
      return false;
    } else if (!regex.test(val)) {
      showError(nameInput, nameError, 'Ingresa únicamente letras y espacios.');
      return false;
    } else {
      showSuccess(nameInput, nameError);
      return true;
    }
  };

  const validateEmail = () => {
    const val = emailInput.value.trim();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (val.length === 0) {
      showError(emailInput, emailError, 'El correo electrónico es obligatorio.');
      return false;
    } else if (!regex.test(val)) {
      showError(emailInput, emailError, 'Ingresa una dirección de correo válida (ej. alumno@cokiecollege.edu).');
      return false;
    } else {
      showSuccess(emailInput, emailError);
      return true;
    }
  };

  const evaluatePasswordStrength = (val) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return score;
  };

  const validatePassword = () => {
    const val = passwordInput.value;
    
    // En modo edición, si no se desea cambiar la contraseña, se permite dejar en blanco
    if (isEditingMode && val.length === 0) {
      showSuccess(passwordInput, passwordError);
      if (strengthBar && strengthText) {
        strengthBar.style.width = '100%';
        strengthBar.className = 'h-1.5 rounded-full strength-meter-bar bg-emerald-500';
        strengthText.textContent = 'Manteniendo contraseña actual';
        strengthText.className = 'text-xs text-emerald-600 font-medium';
      }
      return true;
    }

    const score = evaluatePasswordStrength(val);

    if (strengthBar && strengthText) {
      if (val.length === 0) {
        strengthBar.style.width = '0%';
        strengthBar.className = 'h-1.5 rounded-full strength-meter-bar bg-slate-200';
        strengthText.textContent = 'Seguridad: Ingresa una contraseña';
        strengthText.className = 'text-xs text-slate-500 font-medium';
      } else if (score <= 1) {
        strengthBar.style.width = '33%';
        strengthBar.className = 'h-1.5 rounded-full strength-meter-bar bg-rose-500';
        strengthText.textContent = 'Seguridad: Débil (mínimo 8 caracteres y números)';
        strengthText.className = 'text-xs text-rose-600 font-medium';
      } else if (score === 2 || score === 3) {
        strengthBar.style.width = '66%';
        strengthBar.className = 'h-1.5 rounded-full strength-meter-bar bg-amber-500';
        strengthText.textContent = 'Seguridad: Media (buena combinación)';
        strengthText.className = 'text-xs text-amber-600 font-medium';
      } else {
        strengthBar.style.width = '100%';
        strengthBar.className = 'h-1.5 rounded-full strength-meter-bar bg-emerald-500';
        strengthText.textContent = 'Seguridad: Excelente (muy segura)';
        strengthText.className = 'text-xs text-emerald-600 font-medium';
      }
    }

    if (val.length === 0) {
      showError(passwordInput, passwordError, 'La contraseña es obligatoria.');
      return false;
    } else if (val.length < 8) {
      showError(passwordInput, passwordError, 'La contraseña debe contener al menos 8 caracteres.');
      return false;
    } else if (!/[0-9]/.test(val) || !/[a-zA-Z]/.test(val)) {
      showError(passwordInput, passwordError, 'Debe combinar letras y al menos un número.');
      return false;
    } else {
      showSuccess(passwordInput, passwordError);
      return true;
    }
  };

  const showError = (input, errorEl, message) => {
    input.classList.remove('input-valid', 'border-slate-300');
    input.classList.add('input-invalid');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  };

  const showSuccess = (input, errorEl) => {
    input.classList.remove('input-invalid', 'border-slate-300');
    input.classList.add('input-valid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  };

  // Muestra alerta de éxito temporal
  const triggerSuccessAlert = (title, message) => {
    if (successAlert) {
      if (successTitle) successTitle.textContent = title;
      if (successDesc) successDesc.textContent = message;
      successAlert.classList.remove('hidden');
      successAlert.classList.add('task-enter');
      setTimeout(() => {
        successAlert.classList.add('hidden');
      }, 4500);
    }
  };

  // Actualiza los nodos de la Credencial en el DOM
  const updateProfileDOM = (user) => {
    if (profileName) profileName.textContent = user.name;
    if (profileEmail) profileEmail.textContent = user.email;
    if (profileBadge) profileBadge.textContent = user.career;
    if (profileId) profileId.textContent = user.id || 'CK-2026-8492';
  };

  // Configura el formulario para el modo de edición
  const enterEditMode = () => {
    if (!currentUser) return;
    isEditingMode = true;

    // Rellenar con los datos actuales
    nameInput.value = currentUser.name;
    emailInput.value = currentUser.email;
    careerSelect.value = currentUser.career;
    passwordInput.value = '';

    // Ajustar encabezados del formulario
    if (formTitle) formTitle.textContent = 'Modificar Información de Perfil';
    if (formSubtitle) formSubtitle.textContent = 'Actualiza tus datos de contacto o programa académico universitario.';
    if (registerNotice) registerNotice.classList.add('hidden');
    if (submitBtn) {
      submitBtn.innerHTML = `
        <span>Guardar Cambios</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      `;
    }
    if (cancelEditBtn) cancelEditBtn.classList.remove('hidden');
    if (passwordFieldLabel) passwordFieldLabel.textContent = 'Nueva Contraseña (opcional)';
    if (passwordRequiredStar) passwordRequiredStar.classList.add('hidden');

    // Cambiar vista activa a formulario
    if (formCard) formCard.classList.remove('hidden');
    if (profileView) profileView.classList.add('hidden');

    nameInput.focus();
  };

  // Restaura la vista normal de la credencial
  const exitEditMode = () => {
    isEditingMode = false;

    if (formTitle) formTitle.textContent = 'Registro de Acceso al Campus';
    if (formSubtitle) formSubtitle.textContent = 'Ingresa tus datos institucionales para crear tu perfil de estudiante universitario.';
    if (registerNotice) registerNotice.classList.remove('hidden');
    if (submitBtn) {
      submitBtn.innerHTML = `
        <span>Registrar y Desbloquear Acceso</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      `;
    }
    if (cancelEditBtn) cancelEditBtn.classList.add('hidden');
    if (passwordFieldLabel) passwordFieldLabel.textContent = 'Contraseña de Acceso';
    if (passwordRequiredStar) passwordRequiredStar.classList.remove('hidden');

    // Limpiar estilos de validación del formulario
    [nameInput, emailInput, passwordInput].forEach(inp => {
      inp.classList.remove('input-valid', 'input-invalid');
    });

    if (currentUser) {
      if (formCard) formCard.classList.add('hidden');
      if (profileView) profileView.classList.remove('hidden');
    } else {
      if (formCard) formCard.classList.remove('hidden');
      if (profileView) profileView.classList.add('hidden');
    }
  };

  // Cierre de sesión y restablecimiento del sistema
  const logout = () => {
    currentUser = null;
    isEditingMode = false;
    localStorage.removeItem('cokie_student_session');

    form.reset();
    [nameInput, emailInput, passwordInput].forEach(inp => {
      inp.classList.remove('input-valid', 'input-invalid');
    });

    if (strengthBar) strengthBar.style.width = '0%';
    if (strengthText) strengthText.textContent = 'Seguridad: Ingresa una contraseña';

    exitEditMode();

    if (onAuthChange) {
      onAuthChange(false, null);
    }
  };

  // Event Listeners no intrusivos en campos
  nameInput.addEventListener('keyup', validateName);
  nameInput.addEventListener('blur', validateName);

  emailInput.addEventListener('keyup', validateEmail);
  emailInput.addEventListener('blur', validateEmail);

  passwordInput.addEventListener('keyup', validatePassword);
  passwordInput.addEventListener('blur', validatePassword);

  // Manejo de envío del formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (isNameValid && isEmailValid && isPasswordValid) {
      if (isEditingMode && currentUser) {
        // MODIFICACIÓN DE DATOS EXISTENTES
        currentUser.name = nameInput.value.trim();
        currentUser.email = emailInput.value.trim();
        currentUser.career = careerSelect.value;
        if (passwordInput.value.trim().length >= 8) {
          currentUser.password = passwordInput.value;
        }

        localStorage.setItem('cokie_student_session', JSON.stringify(currentUser));
        updateProfileDOM(currentUser);
        exitEditMode();

        triggerSuccessAlert(
          '¡Perfil Actualizado!',
          'Tus datos han sido modificados y sincronizados correctamente en el sistema.'
        );

        if (onAuthChange) {
          onAuthChange(true, currentUser, false); // false = no redirigir automáticamente a tareas
        }
      } else {
        // REGISTRO INICIAL (ONBOARDING)
        const generatedId = `CK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        currentUser = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          career: careerSelect.value,
          id: generatedId,
          registeredAt: new Date().toISOString()
        };

        localStorage.setItem('cokie_student_session', JSON.stringify(currentUser));
        updateProfileDOM(currentUser);
        exitEditMode();

        triggerSuccessAlert(
          '¡Bienvenido a Cokie Tasks!',
          'Registro completado con éxito. Se ha activado tu credencial y desbloqueado el panel de tareas.'
        );

        if (onAuthChange) {
          onAuthChange(true, currentUser, true); // true = redirigir a la vista de tareas
        }
      }
    } else {
      if (!isNameValid) nameInput.focus();
      else if (!isEmailValid) emailInput.focus();
      else if (!isPasswordValid) passwordInput.focus();
    }
  });

  // Botón para iniciar edición de perfil
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', enterEditMode);
  }

  // Botón para cancelar edición
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', exitEditMode);
  }

  // Botón de cerrar sesión en la credencial
  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', logout);
  }

  // Botón de cerrar sesión en el Header
  const headerLogoutBtn = document.getElementById('header-logout-btn');
  if (headerLogoutBtn) {
    headerLogoutBtn.addEventListener('click', logout);
  }

  // Estado inicial al cargar
  if (currentUser) {
    updateProfileDOM(currentUser);
    exitEditMode();
    if (onAuthChange) onAuthChange(true, currentUser, false);
  } else {
    exitEditMode();
    if (onAuthChange) onAuthChange(false, null, false);
  }

  return {
    getCurrentUser: () => currentUser,
    logout: logout,
    enterEditMode: enterEditMode
  };
}
