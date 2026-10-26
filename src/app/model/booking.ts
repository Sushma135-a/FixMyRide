export class Booking {
  id!: string;
  // Frontend fields
  customerName!: string;
  customerLastName!: string;
  customerEmail!: string;
  customerMobile!: string;
  vehicleMake!: string;
  vehicleModel!: string;
  vehicleRegistrationNumber!: string;
  serviceType!: string;
  serviceBookingDate!: Date | string;
  timeSlot!: string;
  status!: string;
  additionalInformation?: string;
  parts?: Part[];
  serviceCharge!: number;
  totalAmount!: number;
  paymentStatus!: string;
  createdAt?: Date;
  userId?: string;

  // Backend fields (from Java model): keep optional so we can display them
  carCompany?: string | null;
  carModel?: string | null;
  serviceDate?: Date | string | null;
  selectedServices?: string | null;
  otherProblem?: string | null;
  user?: any;
}

export class Part {
  name!: string;
  price!: number;
  quantity!: number;
  total!: number;
}

