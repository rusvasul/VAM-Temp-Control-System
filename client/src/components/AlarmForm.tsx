import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTanks } from '@/api/tanks';

interface Tank {
  id: string;
  name: string;
}

interface AlarmFormProps {
  onSubmit: (alarmData: any) => void;
}

export function AlarmForm({ onSubmit }: AlarmFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [threshold, setThreshold] = useState('');
  const [tankId, setTankId] = useState('');
  const [tanks, setTanks] = useState<Tank[]>([]);

  console.log('AlarmForm rendering, initial state:', { name, type, threshold, tankId, tanks });

  useEffect(() => {
    fetchTanks();
  }, []);

  const fetchTanks = async () => {
    try {
      const tanksData = await getTanks();
      console.log('Fetched tanks data:', tanksData);
      setTanks(tanksData);
    } catch (error) {
      console.error('Error fetching tanks:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting alarm data:', { name, type, threshold: parseFloat(threshold), tankId });
    onSubmit({ name, type, threshold: parseFloat(threshold), tankId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Alarm</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Alarm Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Alarm Type</Label>
            <Select onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select alarm type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High Temperature">High Temperature</SelectItem>
                <SelectItem value="Low Temperature">Low Temperature</SelectItem>
                <SelectItem value="System Error">System Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="threshold">Threshold (°F)</Label>
            <Input
              id="threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="tankId">Tank</Label>
            <Select 
              value={tankId}
              onValueChange={(value) => {
                console.log('Tank selected:', value);
                setTankId(value);
              }} 
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tank" />
              </SelectTrigger>
              <SelectContent>
                {tanks.map((tank) => (
                  <SelectItem key={tank.id} value={tank.id}>
                    {tank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Create Alarm</Button>
        </form>
      </CardContent>
    </Card>
  );
}