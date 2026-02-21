/**
 * Re-exports Prisma enums from the generated client.
 * Loads from project root at runtime so it works when running from dist/
 */
import * as path from 'path';

const generatedPath = path.join(process.cwd(), 'generated', 'prisma');
const prisma = require(generatedPath);

export const UserRole = prisma.UserRole;
export type UserRole = (typeof prisma.UserRole)[keyof typeof prisma.UserRole];

export const VehicleStatus = prisma.VehicleStatus;
export type VehicleStatus = (typeof prisma.VehicleStatus)[keyof typeof prisma.VehicleStatus];

export const DriverStatus = prisma.DriverStatus;
export type DriverStatus = (typeof prisma.DriverStatus)[keyof typeof prisma.DriverStatus];

export const TripStatus = prisma.TripStatus;
export type TripStatus = (typeof prisma.TripStatus)[keyof typeof prisma.TripStatus];
