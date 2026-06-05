export type MachineCategory =
  | "Excavator"
  | "Concrete Pump"
  | "Fiori"
  | "JCB"
  | "Crane";

export type CraneType =
  | "Hydra"
  | "Mobile Crane"
  | "Rough Terrain Crane"
  | "Tower Crane";

export type AvailabilityStatus = "yes" | "no";

export interface Machine {
  id?: string;
  _id?: string;
  category: MachineCategory;
  craneType?: string | null;
  company: string;
  model: string;
  image: string;
  location: string;
  pricePerMonth: number;
  modelYear?: number;
  hoursUsed?: number;
  availability: AvailabilityStatus;
  availableFrom?: string | null;
  ownerName: string;
  ownerContact: string;
  description?: string;
  editCount?: number;
  contactVerified?: boolean;
}