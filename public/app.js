// Application State
const STATE_KEYS = {
  SETTINGS: 'capstone_profile_settings',
  THEME: 'capstone_profile_theme'
};

const DEFAULTS = {
  username: 'johndoe',
  email: 'john.doe@example.com',
  age: '25'
};

// Cached settings state to detect "unsaved changes"
let savedSettings = { ...DEFAULTS };

// DOM Elements - Form
const form = document.getElementById('settings-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const ageInput = document.getElementById('age');

// DOM Elements - Errors
const usernameError = document.getElementById('username-error');
const emailError = document.getElementById('email-error');
const ageError = document.getElementById('age-error');

// DOM Elements - Action Buttons
const resetBtn = document.getElementById('reset-btn');
const submitBtn = document.getElementById('submit-btn');

// DOM Elements - Preview Card
const previewUsername = document.getElementById('preview-username-heading');
const previewEmail = document.getElementById('preview-email-heading');
const previewAge = document.getElementById('preview-age-heading');
const previewStatus = document.getElementById('preview-status-badge');
const syncText = document.getElementById('sync-text');

// DOM Elements - Header & Utilities
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIconLight = document.getElementById('theme-icon-light');
const themeIconDark = document.getElementById('theme-icon-dark');
const toastContainer = document.getElementById('toast-container');

// Flag to track if validation should trigger on every keystroke (turns true after first submit/blur)
let touchedFields = {
  username: false,
  email: false,
  age: false
};

/* ==========================================================================
   1. Theme Management
   ========================================================================== */

function initTheme() {
  const savedTheme = localStorage.getItem(STATE_KEYS.THEME) || 'light';
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STATE_KEYS.THEME, theme);

  if (theme === 'dark') {
    themeIconLight.classList.add('hidden');
    themeIconDark.classList.remove('hidden');
  } else {
    themeIconDark.classList.add('hidden');
    themeIconLight.classList.remove('hidden');
  }
}

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
});


/* ==========================================================================
   2. Validation Engines
   ========================================================================== */

/**
 * Checks input validation and updates UI accordingly.
 */
function validateField(input, errorElement, validationFn, errorMessage, fieldName) {
  const value = input.value.trim();
  const wrapper = input.closest('.input-wrapper');
  
  // Don't show error states on untouched fields unless they are non-empty (the user started typing)
  if (!touchedFields[fieldName] && value === '') {
    clearFieldVisualState(wrapper, errorElement);
    return true;
  }

  const isValid = validationFn(value);

  if (!isValid) {
    wrapper.classList.remove('is-valid');
    wrapper.classList.add('is-invalid');
    errorElement.textContent = errorMessage;
    errorElement.classList.add('active');
    return false;
  } else {
    wrapper.classList.remove('is-invalid');
    wrapper.classList.add('is-valid');
    errorElement.textContent = '';
    errorElement.classList.remove('active');
    return true;
  }
}

function clearFieldVisualState(wrapper, errorElement) {
  wrapper.classList.remove('is-valid', 'is-invalid');
  errorElement.textContent = '';
  errorElement.classList.remove('active');
}

// Form-wide validator returns overall validity status
function validateForm() {
  const uValid = validateField(
    usernameInput, 
    usernameError, 
    isUsernameValid, 
    'Username must be 3-15 characters and contain only letters, numbers, or underscores.',
    'username'
  );
  
  const eValid = validateField(
    emailInput, 
    emailError, 
    isEmailValid, 
    'Please enter a valid email address.',
    'email'
  );
  
  const aValid = validateField(
    ageInput, 
    ageError, 
    isAgeValid, 
    'Age must be a whole number between 1 and 120.',
    'age'
  );

  return uValid && eValid && aValid;
}


/* ==========================================================================
   3. Real-time Synchronization & State Detection
   ========================================================================== */

/**
 * Reads form data, updates the Live Preview card, and checks for unsaved changes.
 */
function syncLivePreview() {
  const currentUsername = usernameInput.value.trim();
  const currentEmail = emailInput.value.trim();
  const currentAge = ageInput.value.trim();

  // Update Preview Text (use defaults or placeholders if empty)
  previewUsername.textContent = currentUsername ? `@${currentUsername}` : '@username';
  previewEmail.textContent = currentEmail ? currentEmail : 'email@example.com';
  previewAge.textContent = currentAge ? currentAge : '--';

  // Check if form data is different from saved state
  const hasChanges = 
    currentUsername !== savedSettings.username ||
    currentEmail !== savedSettings.email ||
    currentAge !== savedSettings.age;

  updateSyncStatusIndicator(hasChanges);
}

function updateSyncStatusIndicator(hasChanges) {
  if (hasChanges) {
    // Unsaved Changes status
    previewStatus.className = 'profile-badge badge-status unsaved';
    previewStatus.innerHTML = '<span class="badge-dot"></span> Unsaved Changes';
    
    syncText.textContent = 'Unsaved changes in form';
    const syncIcon = syncText.previousElementSibling;
    syncIcon.className = 'sync-icon unsaved';
  } else {
    // Saved/Synchronized status
    previewStatus.className = 'profile-badge badge-status';
    previewStatus.innerHTML = '<span class="badge-dot"></span> Saved';
    
    syncText.textContent = 'Synchronized with LocalStorage';
    const syncIcon = syncText.previousElementSibling;
    syncIcon.className = 'sync-icon';
  }
}


/* ==========================================================================
   4. Save, Load, and Reset Logic
   ========================================================================== */

function loadSettings() {
  try {
    const rawData = localStorage.getItem(STATE_KEYS.SETTINGS);
    if (rawData) {
      savedSettings = JSON.parse(rawData);
    } else {
      savedSettings = { ...DEFAULTS };
    }
  } catch (err) {
    console.error('Error reading localStorage settings:', err);
    savedSettings = { ...DEFAULTS };
  }

  // Populate form fields
  usernameInput.value = savedSettings.username;
  emailInput.value = savedSettings.email;
  ageInput.value = savedSettings.age;

  // Clear visual validation states
  clearFieldVisualState(usernameInput.closest('.input-wrapper'), usernameError);
  clearFieldVisualState(emailInput.closest('.input-wrapper'), emailError);
  clearFieldVisualState(ageInput.closest('.input-wrapper'), ageError);

  // Mark fields as untouched on load
  touchedFields = { username: false, email: false, age: false };

  // Sync Live Preview UI
  syncLivePreview();
}

function saveSettings() {
  const updated = {
    username: usernameInput.value.trim(),
    email: emailInput.value.trim(),
    age: ageInput.value.trim()
  };

  try {
    localStorage.setItem(STATE_KEYS.SETTINGS, JSON.stringify(updated));
    savedSettings = updated;
    
    // Refresh visual indicators
    syncLivePreview();
    
    // Clear validation borders (since they are now pristine & saved)
    clearFieldVisualState(usernameInput.closest('.input-wrapper'), usernameError);
    clearFieldVisualState(emailInput.closest('.input-wrapper'), emailError);
    clearFieldVisualState(ageInput.closest('.input-wrapper'), ageError);
    
    // Mark fields as untouched
    touchedFields = { username: false, email: false, age: false };
    
    showToast('Settings saved successfully!', 'success');
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    showToast('Could not save settings. Please check your storage settings.', 'error');
  }
}

function resetForm() {
  loadSettings();
  showToast('Form reset to saved settings.', 'info');
}


/* ==========================================================================
   5. Elegant Toast Notification Engine
   ========================================================================== */

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Decide Icon based on Type
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    // Default / Info
    iconSvg = `<svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-message">${message}</div>
    <button class="toast-close" aria-label="Dismiss toast">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;

  // Add dismiss capability on button click
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  // Append Toast
  toastContainer.appendChild(toast);

  // Automatically remove toast from DOM after its fade animation completes (5 seconds)
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 5000);
}


/* ==========================================================================
   6. Event Listeners
   ========================================================================== */

// Event listener for live updates & validating after being blurred
usernameInput.addEventListener('input', () => {
  syncLivePreview();
  if (touchedFields.username) {
    validateField(usernameInput, usernameError, isUsernameValid, 'Username must be 3-15 characters and contain only letters, numbers, or underscores.', 'username');
  }
});

usernameInput.addEventListener('blur', () => {
  touchedFields.username = true;
  validateField(usernameInput, usernameError, isUsernameValid, 'Username must be 3-15 characters and contain only letters, numbers, or underscores.', 'username');
});

emailInput.addEventListener('input', () => {
  syncLivePreview();
  if (touchedFields.email) {
    validateField(emailInput, emailError, isEmailValid, 'Please enter a valid email address.', 'email');
  }
});

emailInput.addEventListener('blur', () => {
  touchedFields.email = true;
  validateField(emailInput, emailError, isEmailValid, 'Please enter a valid email address.', 'email');
});

ageInput.addEventListener('input', () => {
  syncLivePreview();
  if (touchedFields.age) {
    validateField(ageInput, ageError, isAgeValid, 'Age must be a whole number between 1 and 120.', 'age');
  }
});

ageInput.addEventListener('blur', () => {
  touchedFields.age = true;
  validateField(ageInput, ageError, isAgeValid, 'Age must be a whole number between 1 and 120.', 'age');
});

// Reset Form Handler
resetBtn.addEventListener('click', resetForm);

// Submit Form Handler
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Mark all fields as touched to trigger visual validation
  touchedFields = { username: true, email: true, age: true };

  const isFormValid = validateForm();

  if (!isFormValid) {
    showToast('Please resolve the errors in the form before saving.', 'error');
    
    // Focus the first invalid input
    const firstInvalid = form.querySelector('.is-invalid input');
    if (firstInvalid) {
      firstInvalid.focus();
    }
  } else {
    saveSettings();
  }
});

/* ==========================================================================
   7. App Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadSettings();
});
