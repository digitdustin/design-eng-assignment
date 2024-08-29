import { useCallback } from 'react';

export function usePluginCommunication() {
  const sendPluginMessage = useCallback((type: string, payload?: any) => {
    parent.postMessage({ pluginMessage: { type, ...payload } }, '*');
  }, []);

  return {
    sendPluginMessage,
  };
}
