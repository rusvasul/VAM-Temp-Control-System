import { useEffect, useState, useRef } from "react"
import { TankCard } from "@/components/TankCard"
import { SystemStatus } from "@/components/SystemStatus"
import { getTanks, getSystemStatus, Tank as TankType, createTank, SystemStatus as SystemStatusType } from "@/api/tanks"
import { useToast } from "@/hooks/useToast"
import { TankDialog } from "@/components/TankDialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { TankScheduleGantt } from "@/components/TankScheduleGantt"
import { getCleaningSchedules, CleaningSchedule } from "@/api/cleaningSchedules"
import { getProductionSchedules, ProductionSchedule } from "@/api/productionSchedules"

export function Dashboard() {
  const [tanks, setTanks] = useState<TankType[]>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatusType>({
    chillerStatus: '',
    heaterStatus: '',
    systemMode: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTank, setSelectedTank] = useState<TankType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [cleaningSchedules, setCleaningSchedules] = useState<CleaningSchedule[]>([])
  const [productionSchedules, setProductionSchedules] = useState<ProductionSchedule[]>([])
  const { toast, dismiss } = useToast()
  
  // Use refs to track state
  const mountedRef = useRef(true)
  const lastSuccessfulFetch = useRef(Date.now())
  const currentToastId = useRef<string | null>(null)
  const retryTimeout = useRef<NodeJS.Timeout | null>(null)
  const refreshInterval = useRef<NodeJS.Timeout | null>(null)
  const fetchCount = useRef(0)

  // Debug logging function
  const logDebug = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[Dashboard ${timestamp}] ${message}`, data ? data : '');
  };

  const clearToast = () => {
    if (currentToastId.current) {
      logDebug(`Clearing toast: ${currentToastId.current}`);
      dismiss(currentToastId.current);
      currentToastId.current = null;
    }
  };

  const fetchData = async (retryCount = 0, isRefresh = false) => {
    if (!mountedRef.current) {
      logDebug('Component unmounted, skipping fetch');
      return;
    }

    const fetchId = ++fetchCount.current;
    logDebug(`Starting fetch #${fetchId}`, {
      retryCount,
      isRefresh,
      lastSuccessful: new Date(lastSuccessfulFetch.current).toISOString(),
      currentToast: currentToastId.current
    });

    try {
      const startTime = Date.now();
      const [tanksData, statusData, [cleaningData, productionData]] = await Promise.all([
        getTanks(),
        getSystemStatus(),
        Promise.all([
          getCleaningSchedules(),
          getProductionSchedules()
        ])
      ]);
      
      if (!mountedRef.current) {
        logDebug(`Fetch #${fetchId} completed but component unmounted`);
        return;
      }

      logDebug(`Fetch #${fetchId} successful`, {
        duration: Date.now() - startTime,
        tanksCount: tanksData.length,
        cleaningCount: cleaningData.length,
        productionCount: productionData.length
      });
      
      setTanks(tanksData);
      setSystemStatus(statusData);
      setCleaningSchedules(cleaningData);
      setProductionSchedules(productionData);
      
      lastSuccessfulFetch.current = Date.now();
      clearToast();
      setIsLoading(false);

      // Only set up refresh interval on initial successful fetch
      if (!isRefresh) {
        logDebug('Setting up refresh interval');
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
        refreshInterval.current = setInterval(() => {
          if (mountedRef.current) {
            fetchData(0, true);
          }
        }, 30000);
      }
    } catch (error: any) {
      if (!mountedRef.current) {
        logDebug(`Fetch #${fetchId} error after unmount`, { error });
        return;
      }

      logDebug(`Fetch #${fetchId} failed`, {
        error: error.message,
        retryCount,
        isRefresh
      });
      
      // Only show error toast for non-refresh attempts
      if (!isRefresh) {
        clearToast();
        const { id } = toast({
          title: "Connection Issue",
          description: "Having trouble connecting to the server. Retrying...",
          variant: "destructive",
          duration: 3000,
        });
        logDebug(`Created new toast: ${id}`);
        currentToastId.current = id;

        // Set up retry with exponential backoff
        if (retryCount < 3) {
          const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          logDebug(`Scheduling retry #${retryCount + 1} in ${retryDelay}ms`);
          
          if (retryTimeout.current) {
            clearTimeout(retryTimeout.current);
          }
          retryTimeout.current = setTimeout(() => {
            if (mountedRef.current) {
              fetchData(retryCount + 1);
            }
          }, retryDelay);
        }
      }
    }
  };

  useEffect(() => {
    logDebug('Dashboard mounted');
    mountedRef.current = true;
    fetchData();

    return () => {
      logDebug('Dashboard unmounting');
      mountedRef.current = false;
      clearToast();
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  const handleTankClick = (tank: TankType) => {
    setSelectedTank(tank)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedTank(null)
  }

  const handleTankUpdate = () => {
    fetchData()
  }

  const handleStatusUpdate = (newStatus: SystemStatusType) => {
    setSystemStatus(newStatus)
  }

  const handleAddTank = async () => {
    try {
      const newTankNumber = tanks.length + 1
      const newTank = await createTank({
        name: `fv${newTankNumber.toString().padStart(2, '0')}`,
        temperature: 68,
        status: 'Inactive',
        mode: 'Idle',
        valveStatus: 'Closed'
      })
      await fetchData()
      toast({
        title: "Success",
        description: "Tank added successfully",
      })
    } catch (error) {
      console.error('Error adding tank:', error)
      toast({
        title: "Error",
        description: "Failed to add tank. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="relative">
      <div className="container mx-auto p-4 space-y-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button onClick={handleAddTank}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Tank
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tanks.map((tank) => (
            <TankCard
              key={tank.id}
              {...tank}
              onClick={() => handleTankClick(tank)}
            />
          ))}
        </div>
        {selectedTank && (
          <TankDialog
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
            tank={selectedTank}
            onUpdate={handleTankUpdate}
            onDelete={handleTankUpdate}
          />
        )}
        <SystemStatus initialStatus={systemStatus} onStatusUpdate={handleStatusUpdate} />
        <TankScheduleGantt 
          tanks={tanks}
          cleaningSchedules={cleaningSchedules}
          productionSchedules={productionSchedules}
        />
      </div>
    </div>
  );
}