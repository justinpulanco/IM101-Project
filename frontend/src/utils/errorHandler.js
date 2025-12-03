// Centralized error handling utility

export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  let message = customMessage || 'Something went wrong. Please try again.';
  
  // Network errors
  if (!navigator.onLine) {
    message = '📡 No internet connection. Please check your network.';
  }
  // Timeout errors
  else if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    message = '⏱️ Request timed out. Please try again.';
  }
  // Server errors
  else if (error.response) {
    const status = error.response.status;
    
    if (status === 400) {
      message = '❌ Invalid request. Please check your input.';
    } else if (status === 401) {
      message = '🔒 Unauthorized. Please log in again.';
    } else if (status === 403) {
      message = '🚫 Access denied. You don\'t have permission.';
    } else if (status === 404) {
      message = '🔍 Not found. The requested resource doesn\'t exist.';
    } else if (status === 500) {
      message = '🔥 Server error. Please try again later.';
    } else if (status === 503) {
      message = '🛠️ Service unavailable. Server is down for maintenance.';
    }
  }
  // Connection errors
  else if (error.message?.includes('Failed to fetch') || error.message?.includes('Network request failed')) {
    message = '🌐 Cannot connect to server. Please check if the backend is running.';
  }
  
  return message;
};

export const showErrorToast = (error, customMessage = null) => {
  const message = handleApiError(error, customMessage);
  
  // Create toast notification
  const toast = document.createElement('div');
  toast.className = 'error-toast';
  toast.innerHTML = `
    <div class="error-toast-content">
      <span class="error-toast-icon">⚠️</span>
      <span class="error-toast-message">${message}</span>
      <button class="error-toast-close" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
  
  return message;
};

export const withRetry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry ${i + 1}/${retries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
