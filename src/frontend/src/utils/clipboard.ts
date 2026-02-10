/**
 * Robust clipboard utility with fallback for environments where
 * navigator.clipboard.writeText is unavailable or fails.
 */

export interface ClipboardResult {
  success: boolean;
  error?: string;
}

/**
 * Attempts to copy text to clipboard using modern API with DOM fallback.
 * @param text - The text to copy to clipboard
 * @returns Promise resolving to success status and optional error message
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  // Try modern Clipboard API first
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (error: any) {
      // Permission denied or other clipboard API error
      console.warn('Clipboard API failed, trying fallback:', error);
      // Fall through to fallback method
    }
  }

  // Fallback: Use temporary textarea with document.execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Make textarea invisible but accessible
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.opacity = '0';
    
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    // Try to copy using execCommand
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Copy command failed. Please manually select and copy the URL from your browser address bar.',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'Unable to copy automatically. Please manually select and copy the URL from your browser address bar.',
    };
  }
}

/**
 * Checks if the Web Share API is available
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}
