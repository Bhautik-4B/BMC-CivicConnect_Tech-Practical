import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Zone, Ward } from '../models/Ward.js';
import { Department } from '../models/Department.js';
import { Category } from '../models/Category.js';
import { Complaint } from '../models/Complaint.js';
import { AuditLog } from '../models/AuditLog.js';
import { UserRoles, ComplaintStatuses, Priorities } from '@bmc/shared';

export async function seedDatabase() {
  console.log('🌱 Starting BMC CivicConnect database seeding...');
  await mongoose.connect(env.MONGODB_URI);

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Zone.deleteMany({}),
    Ward.deleteMany({}),
    Department.deleteMany({}),
    Category.deleteMany({}),
    Complaint.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  console.log('🧹 Cleared existing database records.');

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // 1. Seed Zones
  const centralZone = await Zone.create({ name: 'Central Zone', code: 'ZONE_CENTRAL' });
  const eastZone = await Zone.create({ name: 'East Zone', code: 'ZONE_EAST' });
  const westZone = await Zone.create({ name: 'West Zone', code: 'ZONE_WEST' });

  // 2. Seed Wards with realistic GeoJSON Polygons (Bhavnagar/Urban coordinates)
  const wards = await Ward.create([
    {
      zoneId: centralZone._id,
      wardNumber: 1,
      name: 'Ward 1 - Ghogha Circle',
      boundaryPolygon: {
        type: 'Polygon',
        coordinates: [
          [
            [72.13, 21.75],
            [72.16, 21.75],
            [72.16, 21.78],
            [72.13, 21.78],
            [72.13, 21.75]
          ]
        ]
      },
      officeAddress: 'Ward 1 Civic Center, Ghogha Road'
    },
    {
      zoneId: centralZone._id,
      wardNumber: 3,
      name: 'Ward 3 - Rupani Area',
      boundaryPolygon: {
        type: 'Polygon',
        coordinates: [
          [
            [72.11, 21.74],
            [72.14, 21.74],
            [72.14, 21.77],
            [72.11, 21.77],
            [72.11, 21.74]
          ]
        ]
      },
      officeAddress: 'Ward 3 Office, Rupani'
    },
    {
      zoneId: westZone._id,
      wardNumber: 5,
      name: 'Ward 5 - Kaliabid Ward',
      boundaryPolygon: {
        type: 'Polygon',
        coordinates: [
          [
            [72.10, 21.73],
            [72.14, 21.73],
            [72.14, 21.76],
            [72.10, 21.76],
            [72.10, 21.73]
          ]
        ]
      },
      officeAddress: 'Ward 5 Office, Main Road, Kaliabid'
    }
  ]);

  // 3. Seed Departments
  const deptRoad = await Department.create({
    name: 'Road & Infrastructure',
    code: 'DEPT_ROAD',
    description: 'Handles potholes, resurfacing, pavers, and footpath repairs',
    defaultSlaHours: { EMERGENCY: 4, HIGH: 24, NORMAL: 72 }
  });

  const deptSanitation = await Department.create({
    name: 'Solid Waste & Sanitation',
    code: 'DEPT_SANITATION',
    description: 'Handles garbage collection, waste dumping, and sweeping',
    defaultSlaHours: { EMERGENCY: 4, HIGH: 12, NORMAL: 48 }
  });

  const deptWater = await Department.create({
    name: 'Water Supply Department',
    code: 'DEPT_WATER',
    description: 'Handles pipeline leaks, water contamination, and supply shortages',
    defaultSlaHours: { EMERGENCY: 2, HIGH: 12, NORMAL: 24 }
  });

  const deptElectrical = await Department.create({
    name: 'Electrical & Street Lighting',
    code: 'DEPT_ELECTRICAL',
    description: 'Maintains streetlights, high masts, and electrical poles',
    defaultSlaHours: { EMERGENCY: 4, HIGH: 24, NORMAL: 48 }
  });

  const deptDrainage = await Department.create({
    name: 'Drainage & Sewerage',
    code: 'DEPT_DRAINAGE',
    description: 'Manages underground drains, clogged gutters, and manholes',
    defaultSlaHours: { EMERGENCY: 4, HIGH: 18, NORMAL: 48 }
  });

  // 4. Seed Categories
  const categories = await Category.create([
    {
      name: 'Road & Pothole',
      icon: 'Construction',
      defaultDepartmentId: deptRoad._id,
      defaultPriority: Priorities.HIGH,
      subcategories: ['Pothole Repair', 'Road Resurfacing', 'Damaged Footpath', 'Cave-in']
    },
    {
      name: 'Garbage & Cleanliness',
      icon: 'Trash2',
      defaultDepartmentId: deptSanitation._id,
      defaultPriority: Priorities.NORMAL,
      subcategories: ['Garbage Dump Overflow', 'Missed Door-to-Door Collection', 'Dead Animal Removal']
    },
    {
      name: 'Water Supply Issue',
      icon: 'Droplets',
      defaultDepartmentId: deptWater._id,
      defaultPriority: Priorities.HIGH,
      subcategories: ['Pipeline Leakage', 'No Water Supply', 'Contaminated Water']
    },
    {
      name: 'Street Light Fault',
      icon: 'Lightbulb',
      defaultDepartmentId: deptElectrical._id,
      defaultPriority: Priorities.NORMAL,
      subcategories: ['Streetlight Not Glowing', 'Flickering Light', 'Open Wire / Pole Damage']
    },
    {
      name: 'Drainage & Gutter',
      icon: 'Waves',
      defaultDepartmentId: deptDrainage._id,
      defaultPriority: Priorities.HIGH,
      subcategories: ['Drainage Choke-up', 'Broken Manhole Cover', 'Gutter Overflow']
    }
  ]);

  // 5. Seed Users (Super Admin, Officers, Field Workers, Citizens)
  const admin = await User.create({
    name: 'BMC Central Admin',
    mobile: '9999999999',
    email: 'admin@bmc.gov.in',
    password: hashedPassword,
    role: UserRoles.BMC_ADMIN,
    employeeId: 'ADMIN-001'
  });

  const roadOfficer = await User.create({
    name: 'Rahul Sharma (Road Officer)',
    mobile: '9888888881',
    email: 'rahul.road@bmc.gov.in',
    password: hashedPassword,
    role: UserRoles.DEPT_OFFICER,
    departmentId: deptRoad._id,
    employeeId: 'ROAD-OFF-01'
  });

  const fieldStaffAmit = await User.create({
    name: 'Amit Patel',
    mobile: '9777777771',
    email: 'amit.field@bmc.gov.in',
    password: hashedPassword,
    role: UserRoles.FIELD_STAFF,
    departmentId: deptRoad._id,
    wardId: wards[2]._id,
    employeeId: 'STAFF-ROAD-101'
  });

  const fieldStaffRaj = await User.create({
    name: 'Raj Shah',
    mobile: '9777777772',
    email: 'raj.field@bmc.gov.in',
    password: hashedPassword,
    role: UserRoles.FIELD_STAFF,
    departmentId: deptSanitation._id,
    wardId: wards[0]._id,
    employeeId: 'STAFF-SANI-102'
  });

  const citizen = await User.create({
    name: 'Bhautik Sorathiya',
    mobile: '9876543210',
    email: 'bhautik.citizen@gmail.com',
    role: UserRoles.CITIZEN,
    otpCode: '123456'
  });

  // 6. Seed Sample Complaints (Demo Tickets)
  const demoComplaint = await Complaint.create({
    ticketId: 'BMC-2026-001245',
    citizenId: citizen._id,
    categoryId: categories[0]._id,
    subcategory: 'Pothole Repair',
    title: 'Large dangerous pothole near Main Road junction',
    description: 'There is a severe 2-foot pothole causing heavy traffic slowdown and accidents.',
    location: {
      type: 'Point',
      coordinates: [72.138, 21.753],
      address: 'Near Main Crossroad, Ward 5, Bhavnagar',
      landmark: 'Opposite State Bank'
    },
    zoneId: westZone._id,
    wardId: wards[2]._id,
    status: ComplaintStatuses.IN_PROGRESS,
    priority: Priorities.HIGH,
    assignedDepartmentId: deptRoad._id,
    assignedSupervisorId: roadOfficer._id,
    assignedFieldStaffId: fieldStaffAmit._id,
    slaTargetHours: 24,
    slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18h remaining
    slaBreached: false,
    workStartedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ],
    resolutionEvidence: {
      beforePhotoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
      afterPhotoUrl: 'https://images.unsplash.com/photo-1584463699039-446a81bb1a09?w=600',
      resolutionNote: 'Pothole backfilled with bitumen mix and asphalt compactor completed.',
      submittedBy: fieldStaffAmit._id,
      submittedAt: new Date()
    }
  });

  await AuditLog.create({
    complaintId: demoComplaint._id,
    actorId: citizen._id,
    actorRole: UserRoles.CITIZEN,
    actorName: citizen.name,
    action: 'COMPLAINT_CREATED',
    toState: ComplaintStatuses.SUBMITTED,
    comment: 'Ticket BMC-2026-001245 submitted via Citizen Portal'
  });

  await AuditLog.create({
    complaintId: demoComplaint._id,
    actorId: admin._id,
    actorRole: UserRoles.BMC_ADMIN,
    actorName: admin.name,
    action: 'ASSIGNED_TO_DEPARTMENT',
    fromState: ComplaintStatuses.SUBMITTED,
    toState: ComplaintStatuses.ASSIGNED,
    comment: 'Assigned to Road & Infrastructure Department'
  });

  await AuditLog.create({
    complaintId: demoComplaint._id,
    actorId: fieldStaffAmit._id,
    actorRole: UserRoles.FIELD_STAFF,
    actorName: fieldStaffAmit.name,
    action: 'WORK_STARTED',
    fromState: ComplaintStatuses.ASSIGNED,
    toState: ComplaintStatuses.IN_PROGRESS,
    comment: 'Amit Patel arrived at spot and started repair work'
  });

  console.log('✅ Seed completed successfully!');
  console.log('📋 Demo Credentials:');
  console.log('  • BMC Super Admin: Mobile/Email "admin@bmc.gov.in" or "9999999999" (Password: Admin@123)');
  console.log('  • Road Dept Officer: Mobile "9888888881" (Password: Admin@123)');
  console.log('  • Field Staff (Amit): Mobile "9777777771" (Password: Admin@123)');
  console.log('  • Citizen (Bhautik): Mobile "9876543210" (OTP: 123456)');

  await mongoose.disconnect();
}

// Run directly if called as a script
if (process.argv[1]?.endsWith('seedData.ts') || process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}
