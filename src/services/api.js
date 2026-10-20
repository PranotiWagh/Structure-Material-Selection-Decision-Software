/**
 * API Service for communicating with Python FastAPI backend
 * Supporting role-segregated SQLite authentication and MCDA engine
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Real-time password complexity evaluation helper (Strict 5 rules)
 */
export function checkPasswordComplexity(password = '') {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/~`]/.test(password);

  const rules = [
    { id: 'minLength', label: 'At least 8 characters long', passed: minLength },
    { id: 'hasUppercase', label: 'At least one uppercase letter (A-Z)', passed: hasUppercase },
    { id: 'hasLowercase', label: 'At least one lowercase letter (a-z)', passed: hasLowercase },
    { id: 'hasDigit', label: 'At least one numeric digit (0-9)', passed: hasDigit },
    { id: 'hasSpecial', label: 'At least one special character (!@#$%^&*...)', passed: hasSpecial }
  ];

  const passedCount = rules.filter(r => r.passed).length;
  const isValid = minLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;

  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasDigit,
    hasSpecial,
    rules,
    passedCount,
    isValid,
    strengthPercent: (passedCount / 5) * 100
  };
}

// ----------------------------------------------------
// 1. ADMIN AUTHENTICATION
// ----------------------------------------------------
export async function registerAdmin(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || 'Admin registration failed.';
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function loginAdmin(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || 'Admin login failed.';
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// 2. EMPLOYEE AUTHENTICATION
// ----------------------------------------------------
export async function registerEmployee(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/employee/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || 'Employee registration failed.';
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function loginEmployee(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/employee/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || 'Employee login failed.';
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// 3. CUSTOMER AUTHENTICATION
// ----------------------------------------------------
export async function registerCustomer(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/customer/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || 'Customer registration failed.';
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function loginCustomer(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || 'Customer login failed.';
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// MATERIALS & MCDM ENDPOINTS
// ----------------------------------------------------
export async function fetchMaterials({ skip = 0, limit = 50, category = '', search = '' } = {}) {
  try {
    const params = new URLSearchParams({ skip, limit });
    if (category && category !== 'All') params.append('category', category);
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/api/materials?${params}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Backend API offline, falling back to local dataset:', err);
    return null;
  }
}

export async function runMcdmEvaluation(requirements, topK = 20) {
  try {
    const payload = {
      structure_type: requirements.structureType,
      structural_element: requirements.structuralElement,
      load_type: requirements.loadType,
      design_life: requirements.designLife,
      environmental_condition: requirements.environmentalCondition,
      budget_range: requirements.budgetRange,
      sustainability_preference: requirements.sustainabilityPreference,
      special_requirements: requirements.specialRequirements
    };

    const response = await fetch(`${API_BASE_URL}/api/evaluate?top_k=${topK}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Backend MCDM API offline, utilizing client-side TOPSIS solver:', err);
    return null;
  }
}

export async function saveMaterialToDb(materialData, isNew = false) {
  try {
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew
      ? `${API_BASE_URL}/api/materials`
      : `${API_BASE_URL}/api/materials/${materialData.id}`;

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materialData)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('Failed to persist material to backend:', err);
    throw err;
  }
}

export async function deleteMaterialFromDb(materialId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/materials/${materialId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('Failed to delete material from backend:', err);
    throw err;
  }
}

// ----------------------------------------------------
// PROJECT EVALUATIONS & DASHBOARD METRICS (SQLite)
// ----------------------------------------------------
export async function fetchDashboardMetrics() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/metrics/summary`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Dashboard metrics endpoint offline, returning fallback data:', err);
    return null;
  }
}

export async function fetchProjectEvaluations({ skip = 0, limit = 50, search = '' } = {}) {
  try {
    const params = new URLSearchParams({ skip, limit });
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/api/projects?${params}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Projects endpoint offline, using local state:', err);
    return null;
  }
}

export async function saveProjectEvaluation(projectData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || `HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.warn('Failed to persist project evaluation to SQLite:', err);
    return null;
  }
}

export async function deleteProjectEvaluation(projectId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Failed to delete project evaluation from SQLite:', err);
    return null;
  }
}

// ----------------------------------------------------
// 6. MCDM (AHP & TOPSIS) CLIENT METHODS
// ----------------------------------------------------
export async function fetchMcdmCriteria() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mcdm/criteria`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Failed to fetch MCDM criteria:', err);
    return [];
  }
}

export async function saveMcdmCriteria(criteriaData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mcdm/criteria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteriaData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || `HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Failed to save MCDM criteria:', err);
    throw err;
  }
}

export async function calculateAhpLive(criteriaCodes, matrix) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mcdm/ahp/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ criteria_codes: criteriaCodes, matrix })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || `HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('AHP calculation failed:', err);
    throw err;
  }
}

export async function fetchAhpMatrices() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mcdm/ahp-matrix`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Failed to fetch AHP matrices:', err);
    return [];
  }
}

export async function saveAhpMatrix(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mcdm/ahp-matrix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || `HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('Failed to save AHP matrix:', err);
    throw err;
  }
}

export async function evaluateMcdm(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mcdm/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || `HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error('MCDM evaluation failed:', err);
    throw err;
  }
}

export async function fetchMcdmLogs(limit = 20) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/mcdm/logs?limit=${limit}`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Failed to fetch MCDM logs:', err);
    return [];
  }
}

// ----------------------------------------------------
// DYNAMIC EMPLOYEE ROSTER (database/users.db)
// ----------------------------------------------------
export async function fetchRegisteredEmployees() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/employees`);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('Could not fetch registered employees from backend:', err);
    return [];
  }
}

export async function deleteRegisteredUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Failed to delete user:', err);
    throw err;
  }
}

