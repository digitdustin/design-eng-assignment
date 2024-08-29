import { useState, useCallback, useEffect } from 'react';

export function useInstances() {
  const [instances, setInstances] = useState<UniqueInstance[]>([]);

  const fetchInstances = useCallback(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'fetch-instances',
        },
      },
      '*'
    );
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, instances } = event.data.pluginMessage;
      if (type === 'instances-fetched') {
        setInstances(instances);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return { instances, fetchInstances };
}
