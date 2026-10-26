export class Service {
  id!: string;
  name!: string;
  description?: string;
  basePrice!: number;
  duration!: number; // in hours
}

export const SERVICE_OPTIONS = [
  { name: 'Oil Change', basePrice: 800, duration: 1 },
  { name: 'Brake Service', basePrice: 1400, duration: 2 },
  { name: 'Engine Tune-up', basePrice: 2000, duration: 3 },
  { name: 'Transmission Service', basePrice: 2500, duration: 2 },
  { name: 'Tire Rotation', basePrice: 500, duration: 1 },
  { name: 'Battery Check', basePrice: 300, duration: 1 },
  { name: 'AC Service', basePrice: 1200, duration: 2 },
  { name: 'General Inspection', basePrice: 600, duration: 1 },
  { name: 'Other', basePrice: 1000, duration: 2 }
];

