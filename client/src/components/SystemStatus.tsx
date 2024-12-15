import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ThermometerIcon, Power, Droplet } from "lucide-react"
import { SystemStatus as SystemStatusType } from "@/api/tanks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateSystemStatus } from "@/api/tanks";
import { useToast } from "@/hooks/useToast";

interface SystemStatusProps {
  initialStatus: SystemStatusType;
  onStatusUpdate: (newStatus: SystemStatusType) => void;
}

export function SystemStatus({ initialStatus, onStatusUpdate }: SystemStatusProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const eventSourceRef = useRef<EventSource | null>(null);
  const toastIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const reconnectCountRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  const cleanupResources = () => {
    console.log('Cleaning up SystemStatus resources');
    mountedRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      console.log('Closing SSE connection');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (toastIdRef.current) {
      toast.dismiss?.(toastIdRef.current);
      toastIdRef.current = null;
    }

    reconnectCountRef.current = 0;
  };

  const setupSSEConnection = () => {
    if (!mountedRef.current) return;

    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        if (!toastIdRef.current) {
          const { id } = toast({
            title: "Authentication Error",
            description: "Please log in again",
            variant: "destructive",
            duration: 5000,
          });
          toastIdRef.current = id;
        }
        return;
      }

      console.log('Initializing SSE connection to:', `${apiUrl}/api/sse`);
      
      // Create EventSource with auth token in URL
      const url = new URL(`${apiUrl}/api/sse`);
      url.searchParams.append('token', token);
      eventSourceRef.current = new EventSource(url.toString(), {
        withCredentials: true
      });

      // Listen for the initial connection event
      eventSourceRef.current.addEventListener('connected', (event) => {
        console.log('SSE connection established:', event);
        if (toastIdRef.current) {
          toast.dismiss?.(toastIdRef.current);
          toastIdRef.current = null;
        }
        reconnectCountRef.current = 0;
      });

      eventSourceRef.current.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          console.log('Received SSE update:', event.data);
          if (event.data === 'connected') {
            console.log('Received connected message');
            return;
          }
          const updatedStatus = JSON.parse(event.data);
          setStatus(updatedStatus);
          onStatusUpdate(updatedStatus);
          // Reset reconnect count on successful message
          reconnectCountRef.current = 0;
          
          // Clear any error toasts on successful update
          if (toastIdRef.current) {
            toast.dismiss?.(toastIdRef.current);
            toastIdRef.current = null;
          }
        } catch (error) {
          console.error('Error processing SSE message:', error);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        if (!mountedRef.current) return;

        console.error('SSE connection error:', error);
        
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        // Check if the error is due to an expired token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            if (isExpired) {
              if (!toastIdRef.current) {
                const { id } = toast({
                  title: "Session Expired",
                  description: "Please log in again",
                  variant: "destructive",
                  duration: null,
                });
                toastIdRef.current = id;
              }
              return; // Don't attempt to reconnect if token is expired
            }
          } catch (e) {
            console.error('Error checking token expiration:', e);
          }
        }

        // Only show error toast and attempt reconnect if we haven't exceeded max attempts
        if (reconnectCountRef.current < MAX_RECONNECT_ATTEMPTS) {
          if (!toastIdRef.current) {
            const { id } = toast({
              title: "Connection Error",
              description: "Lost connection to server. Attempting to reconnect...",
              variant: "destructive",
              duration: 5000,
            });
            toastIdRef.current = id;
          }

          // Attempt to reconnect with exponential backoff
          if (mountedRef.current) {
            if (reconnectTimeoutRef.current) {
              clearTimeout(reconnectTimeoutRef.current);
            }
            const delay = Math.min(1000 * Math.pow(2, reconnectCountRef.current), 5000);
            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                reconnectCountRef.current++;
                console.log(`Attempting to reconnect SSE... (Attempt ${reconnectCountRef.current})`);
                setupSSEConnection();
              }
            }, delay);
          }
        } else if (!toastIdRef.current) {
          // Show final error message after max attempts
          const { id } = toast({
            title: "Connection Failed",
            description: "Unable to establish connection to server. Please refresh the page.",
            variant: "destructive",
            duration: null, // Keep the toast until dismissed
          });
          toastIdRef.current = id;
        }
      };

    } catch (error) {
      console.error('Error setting up SSE:', error);
      if (!toastIdRef.current) {
        const { id } = toast({
          title: "Connection Error",
          description: "Unable to establish server connection",
          variant: "destructive",
          duration: 5000,
        });
        toastIdRef.current = id;
      }
    }
  };

  useEffect(() => {
    console.log('SystemStatus component mounted');
    mountedRef.current = true;
    setupSSEConnection();

    return () => {
      console.log('SystemStatus component unmounting');
      cleanupResources();
    };
  }, []);

  const handleSystemModeChange = async (newMode: string) => {
    setIsUpdating(true);
    try {
      console.log('Updating system mode to:', newMode);
      const updatedStatus = await updateSystemStatus({ ...status, systemMode: newMode });
      setStatus(updatedStatus);
      onStatusUpdate(updatedStatus);
      toast({
        title: "Success",
        description: `System mode updated to ${newMode}`,
      });
    } catch (err) {
      console.error('Error updating system mode:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update system mode",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Power className="h-5 w-5" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Chiller Status</p>
            <p className="text-2xl font-bold">{status.chillerStatus}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Heater Status</p>
            <p className="text-2xl font-bold">{status.heaterStatus}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">System Mode</p>
            <Select
              value={status.systemMode}
              onValueChange={handleSystemModeChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cooling">Cooling</SelectItem>
                <SelectItem value="Heating">Heating</SelectItem>
                <SelectItem value="Idle">Idle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <ThermometerIcon className="mr-2 h-4 w-4 text-rose-500" />
                <span>System Load</span>
              </div>
              <span>78%</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Droplet className="mr-2 h-4 w-4 text-blue-500" />
                <span>Coolant Level</span>
              </div>
              <span>92%</span>
            </div>
            <Progress value={92} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}