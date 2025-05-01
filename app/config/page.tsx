'use client';

import { useState } from 'react';

export default function ConfigurationPage() {
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const systems = ['CMS', 'Hostel Management', 'Sports Management'];

  const toggleSystem = (system: string) => {
    setSelectedSystems((prev) =>
      prev.includes(system) ? prev.filter((s) => s !== system) : [...prev, system]
    );
  };

  return (
    <div>
      <h1>Select Systems</h1>
      {systems.map((system) => (
        <div key={system}>
          <label>
            <input
              type="checkbox"
              checked={selectedSystems.includes(system)}
              onChange={() => toggleSystem(system)}
            />
            {system}
          </label>
        </div>
      ))}
      <button
        onClick={() => {
          console.log('Selected Systems:', selectedSystems);
        }}
      >
        Next
      </button>
    </div>
  );
}
