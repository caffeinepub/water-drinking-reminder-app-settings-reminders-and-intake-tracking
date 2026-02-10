/**
 * Utility to normalize backend/agent errors into clear English messages
 * suitable for user-facing toasts/banners.
 */

export function normalizeBackendError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred. Please try again.';
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Authorization errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('only users can')) {
    return 'You need to be logged in to perform this action. Please log in and try again.';
  }

  if (lowerMessage.includes('only admins can')) {
    return 'You do not have permission to access this feature. Admin access required.';
  }

  // Profile/registration errors
  if (lowerMessage.includes('profile') && lowerMessage.includes('not found')) {
    return 'Please complete your profile setup before continuing.';
  }

  // Network/connection errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Actor/canister errors
  if (lowerMessage.includes('actor not available') || lowerMessage.includes('canister')) {
    return 'Service temporarily unavailable. Please try again in a moment.';
  }

  // Timeout errors
  if (lowerMessage.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Generic trap/rejection
  if (lowerMessage.includes('trap') || lowerMessage.includes('reject')) {
    // Try to extract meaningful message after "trap" or "reject"
    const trapMatch = errorMessage.match(/trap[:\s]+(.+?)(?:\n|$)/i);
    const rejectMatch = errorMessage.match(/reject[:\s]+(.+?)(?:\n|$)/i);
    const extractedMessage = trapMatch?.[1] || rejectMatch?.[1];
    
    if (extractedMessage && extractedMessage.length < 100) {
      return extractedMessage.trim();
    }
    
    return 'The action could not be completed. Please try again.';
  }

  // If error message is short and readable, return it
  if (errorMessage.length < 100 && !errorMessage.includes('Error:')) {
    return errorMessage;
  }

  // Default fallback
  return 'Something went wrong. Please try again.';
}
