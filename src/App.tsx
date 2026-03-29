import { useState } from 'react';
import Header from './components/Header';
import FloorView from './components/FloorView';
import Sidebar from './components/Sidebar';
import MachineDetail from './components/MachineDetail';
import type { Machine } from './data/factory';

export interface LayerState {
  belt: boolean;
  power: boolean;
  storage: boolean;
  mk2: boolean;
}

export default function App() {
  const [currentFloor, setCurrentFloor] = useState('1');
  const [layers, setLayers] = useState<LayerState>({
    belt: true,
    power: true,
    storage: true,
    mk2: true,
  });
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  const toggleLayer = (key: keyof LayerState) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Header
        currentFloor={currentFloor}
        layers={layers}
        onFloorChange={setCurrentFloor}
        onLayerToggle={toggleLayer}
      />
      <main>
        <FloorView
          floor={currentFloor}
          layers={layers}
          onMachineClick={setSelectedMachine}
        />
        <Sidebar floor={currentFloor} layers={layers} />
      </main>
      <MachineDetail
        machine={selectedMachine}
        onClose={() => setSelectedMachine(null)}
      />
    </>
  );
}
