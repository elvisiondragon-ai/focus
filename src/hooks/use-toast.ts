import { useState, useEffect } from 'react';

type ToastVariant = 'default' | 'destructive';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    setToasts((prev) => [...prev, options]);
    
    // Basic auto-dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== options));
    }, options.duration || 3000);

    // Simple visual feedback if no Toaster component is mounted
    if (options.variant === 'destructive') {
      console.error(`Toast: ${options.title} - ${options.description}`);
    } else {
      console.log(`Toast: ${options.title} - ${options.description}`);
    }
  };

  return { toast, toasts };
}
