/**
 * validator.js - Validación no intrusiva de formulario
 * Cumple con los requisitos de:
 * - Mínimo 3 campos (Nombre, Correo, Contraseña + Rol con evento change)
 * - Eventos: keyup, input, blur, change, submit
 * - Manipulación dinámica del DOM para mostrar estados y errores
 */

export function initValidator() {
  const form = document.getElementById('student-form');
  const nameInput = document.getElementById('student-name');
  const emailInput = document.getElementById('student-email');
  const passwordInput = document.getElementById('student-password');
  const careerSelect = document.getElementById('student-career');
  
  // Elementos de error y feedback en el DOM
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  
  // Card de perfil dinámico
  const profileCard = document.getElementById('student-profile-preview');
  const profileName = document.getElementById('profile-name-display');
  const profileEmail = document.getElementById('profile-email-display');
  const profileBadge = document.getElementById('profile-badge-display');
  const formSuccessAlert = document.getElementById('form-success-alert');

  if (!form || !nameInput || !emailInput || !passwordInput) return;

  // 1. Reglas de Validación
  const validateName = () => {
    const val = nameInput.value.trim();
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,40}$/;
    
    if (val.length === 0) {
      showError(nameInput, nameError, 'El nombre es obligatorio.');
      return false;
    } else if (val.length < 3) {
      showError(nameInput, nameError, 'Debe tener al menos 3 caracteres.');
      return false;
    } else if (!regex.test(val)) {
      showError(nameInput, nameError, 'Solo se permiten letras y espacios.');
      return false;
    } else {
      showSuccess(nameInput, nameError);
      return true;
    }
  };

  const validateEmail = () => {
    const val = emailInput.value.trim();
    // Expresión regular estándar y estricta para correos
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (val.length === 0) {
      showError(emailInput, emailError, 'El correo electrónico es obligatorio.');
      return false;
    } else if (!regex.test(val)) {
      showError(emailInput, emailError, 'Ingresa un formato de correo válido (ej. alumno@cokie.edu).');
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
    const score = evaluatePasswordStrength(val);

    // Actualizar indicador visual de fuerza dinámicamente en el DOM
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
      showError(passwordInput, passwordError, 'La contraseña debe tener mínimo 8 caracteres.');
      return false;
    } else if (!/[0-9]/.test(val) || !/[a-zA-Z]/.test(val)) {
      showError(passwordInput, passwordError, 'Debe combinar letras y al menos un número.');
      return false;
    } else {
      showSuccess(passwordInput, passwordError);
      return true;
    }
  };

  // Helpers auxiliares de DOM para estados visuales
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

  // 2. Asignación NO INTRUSIVA de Eventos (Event Listeners)

  // Evento keyup / input para feedback en tiempo real
  nameInput.addEventListener('keyup', validateName);
  nameInput.addEventListener('blur', validateName);

  emailInput.addEventListener('keyup', validateEmail);
  emailInput.addEventListener('blur', validateEmail);

  passwordInput.addEventListener('keyup', validatePassword);
  passwordInput.addEventListener('blur', validatePassword);

  // Evento change en el selector de carrera/área
  if (careerSelect) {
    careerSelect.addEventListener('change', (e) => {
      if (profileBadge) {
        profileBadge.textContent = e.target.value || 'Estudiante General';
      }
    });
  }

  // Evento submit en el formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Evitar recarga de página

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (isNameValid && isEmailValid && isPasswordValid) {
      // Manipulación del DOM: Actualizar carnet de estudiante
      if (profileName) profileName.textContent = nameInput.value.trim();
      if (profileEmail) profileEmail.textContent = emailInput.value.trim();
      if (profileBadge && careerSelect) {
        profileBadge.textContent = careerSelect.value || 'Estudiante General';
      }
      if (profileCard) {
        profileCard.classList.remove('hidden');
      }

      // Alerta de éxito con animación
      if (formSuccessAlert) {
        formSuccessAlert.classList.remove('hidden');
        formSuccessAlert.classList.add('task-enter');
        setTimeout(() => {
          formSuccessAlert.classList.add('hidden');
        }, 5000);
      }

      // Limpiar campos visualmente
      form.reset();
      [nameInput, emailInput, passwordInput].forEach(inp => {
        inp.classList.remove('input-valid', 'input-invalid');
      });
      if (strengthBar) strengthBar.style.width = '0%';
      if (strengthText) strengthText.textContent = 'Seguridad: Ingresa una contraseña';

      // Notificar al usuario en consola
      console.info('Formulario validado y procesado exitosamente.');
    } else {
      // Foco en el primer campo inválido
      if (!isNameValid) nameInput.focus();
      else if (!isEmailValid) emailInput.focus();
      else if (!isPasswordValid) passwordInput.focus();
    }
  });
}
