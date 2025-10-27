'use client';

import { useCallback, useState } from 'react';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);

      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      return false;
    }
  }, []);

  return { copy, copied };
}
