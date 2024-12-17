import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useSSE = (onMessage: (data: any) => void) => {
  const { token } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 5000;

  useEffect(() => {
    const connect = () => {
      console.log('[SSE] Attempting to connect...');
      
      if (eventSourceRef.current) {
        console.log('[SSE] Closing existing connection');
        eventSourceRef.current.close();
      }

      try {
        const url = new URL('/api/sse', window.location.origin);
        url.searchParams.append('token', token || '');
        
        console.log('[SSE] Creating new EventSource connection');
        const eventSource = new EventSource(url.toString());
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('[SSE] Connection opened');
          reconnectAttempts.current = 0;
        };

        eventSource.onmessage = (event) => {
          console.log('[SSE] Message received:', event.data);
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (error) {
            console.error('[SSE] Error parsing message:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('[SSE] Connection error:', error);
          eventSource.close();
          
          if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
            console.log(`[SSE] Attempting reconnect in ${RECONNECT_DELAY}ms (Attempt ${reconnectAttempts.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              connect();
            }, RECONNECT_DELAY);
          } else {
            console.error('[SSE] Max reconnection attempts reached');
          }
        };

        // Handle specific events
        eventSource.addEventListener('connected', (event) => {
          console.log('[SSE] Connected event received:', event);
        });

        eventSource.addEventListener('heartbeat', (event) => {
          console.log('[SSE] Heartbeat received:', event);
        });

      } catch (error) {
        console.error('[SSE] Error creating EventSource:', error);
      }
    };

    if (token) {
      console.log('[SSE] Token available, initiating connection');
      connect();
    } else {
      console.log('[SSE] No token available, skipping connection');
    }

    return () => {
      console.log('[SSE] Cleaning up SSE connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [token, onMessage]);
}; 