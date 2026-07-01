export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'Pending' | 'Approved' | 'Suspended';
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseUserRole {
  id: string;
  userId: string;
  role: 'Vehicle Owner' | 'Vehicle Manager' | 'Driver' | 'Garage Owner' | 'Garage Staff' | 'Spare Part Shop' | 'Petrol Station Partner' | 'EV Charging Station Partner' | 'Freelance Mechanic' | 'Admin';
  isPrimary: boolean;
  activatedAt: string;
}

export interface DatabaseBusiness {
  id: string;
  ownerId: string;
  name: string;
  licenseNumber?: string;
  location: string;
  status: 'Pending' | 'Approved' | 'Suspended';
  createdAt: string;
}

export interface DatabaseBusinessModule {
  id: string;
  businessId: string;
  moduleName: 'garage' | 'spare_part_shop' | 'petrol_station' | 'ev_charging_station' | 'marketplace_seller';
  isActive: boolean;
  activatedAt: string;
}

export interface DatabaseStaffAccount {
  id: string;
  businessId: string;
  userId: string;
  permissionGroup: 'Receptionist' | 'Mechanic' | 'Cashier' | 'Garage Manager' | 'Super Admin';
  isActive: boolean;
  assignedAt: string;
}

export interface DatabaseVehicle {
  id: string;
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  vin?: string;
  fuelType: 'Gasoline' | 'Diesel' | 'Hybrid' | 'EV';
  mileage: number;
  createdAt: string;
}

export interface DatabaseVehiclePermission {
  id: string;
  vehicleId: string;
  grantedToUserId: string;
  permissionLevel: 'Read' | 'Write' | 'Delete';
  grantedAt: string;
}

export interface DatabaseServiceRecord {
  id: string;
  vehicleId: string;
  providerBusinessId?: string;
  serviceType: string;
  odometer: number;
  costUsd: number;
  costKhr: number;
  notes?: string;
  status: 'Draft' | 'Completed' | 'Cancelled';
  loggedAt: string;
}

export interface DatabaseApprovalRequest {
  id: string;
  requesterId: string;
  approverId: string;
  targetId: string; // e.g. vehicleId or serviceRecordId
  requestType: 'VehicleAccess' | 'ServiceApproval' | 'RoleUpgrade';
  status: 'Pending' | 'Approved' | 'Declined';
  details?: string;
  createdAt: string;
}

export interface DatabaseNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'System' | 'Maintenance' | 'Bidding' | 'Social';
  isRead: boolean;
  createdAt: string;
}
