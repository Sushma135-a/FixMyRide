export class TimeSlot {
  id!: string;
  startTime!: string;
  endTime!: string;
  date!: Date | string;
  availableSlots!: number;
  maxSlots!: number;
}

export const DEFAULT_TIME_SLOTS = [
  { startTime: '09:00', endTime: '11:00', maxSlots: 2 },
  { startTime: '11:00', endTime: '13:00', maxSlots: 2 },
  { startTime: '14:00', endTime: '16:00', maxSlots: 2 },
  { startTime: '16:00', endTime: '18:00', maxSlots: 2 }
];

