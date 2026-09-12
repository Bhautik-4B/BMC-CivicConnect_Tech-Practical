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
  console.log('🌱 Starting BMC CivicConnect database seeding with rich Bhavnagar civic records...');
  await mongoose.connect(env.MONGODB_URI);

  // Clear existing collections
  await User.deleteMany({});
  await Zone.deleteMany({});
  await Ward.deleteMany({});
  await Department.deleteMany({});
  await Category.deleteMany({});
  await Complaint.deleteMany({});
  await AuditLog.deleteMany({});

  console.log('🧹 Cleared existing database records.');

  const defaultPassword = await bcrypt.hash('Admin@123', 10);

  // 1. Seed Zones
  const centralZone = await Zone.create({ name: 'Central Zone', code: 'ZONE_CENTRAL' });
  const eastZone = await Zone.create({ name: 'East Zone', code: 'ZONE_EAST' });
  const westZone = await Zone.create({ name: 'West Zone', code: 'ZONE_WEST' });
  const southZone = await Zone.create({ name: 'South Zone', code: 'ZONE_SOUTH' });
  const northZone = await Zone.create({ name: 'North Zone', code: 'ZONE_NORTH' });

  // 2. Seed Wards with realistic Bhavnagar GeoJSON Polygons
  const wards = await Ward.create([
    {
      zoneId: centralZone._id,
      wardNumber: 1,
      name: 'Ward 1 - Ghogha Circle & Ruvapari',
      boundaryPolygon: {
        type: 'Polygon',
        coordinates: [
          [
            [72.150, 21.760],
            [72.170, 21.760],
            [72.170, 21.780],
            [72.150, 21.780],
            [72.150, 21.760]
          ]
        ]
      },
      officeAddress: 'Ward 1 Civic Center, Ghogha Road, Bhavnagar'
    },
    {
      zoneId: centralZone._id,
      wardNumber: 2,
      name: 'Ward 2 - Barton Library & Haluria',
      boundaryPolygon: {
        type: 'Polygon',
        coordinates: [
          [
            [72.138, 21.768],
            [72.155, 21.768],
            [72.155, 21.785],
            [72.138, 21.785],
            [72.138, 21.768]
          ]
        ]
      },
      officeAddress: 'Ward 2 Office, Near Barton Library, Haluria Chowk, Bhavnagar'
    },
    {
      zoneId: centralZone._id,
      wardNumber: 3,
      name: 'Ward 3 - Rupani & Meghani Circle',
      boundaryPolygon: {
        type: 'Polygon',
        coordinates: [
          [
            [72.130, 21.750],
            [72.150, 21.750],
            [72.150, 21.765],
            [72.130, 21.765],
            [72.130, 21.750]
          ]
        ]
      },
      officeAddress: 'Ward 3 Office, Rupani Circle Main Road, Bhavnagar'
    },
    {
      zoneId: southZone._id,
      wardNumber: 4,
      name: 'Ward 4 - Takhteshwar & Sidsar Road',
      boundaryPolygon: {
        type: 'Polygon',
        coordinates: [
          [
            [72.125, 21.725],
            [72.150, 21.725],
            [72.150, 21.748],
            [72.125, 21.748],
            [72.125, 21.725]
          ]
        ]
      },
      officeAddress: 'Ward 4 Office, Near Takhteshwar Temple Hill, Bhavnagar'
    },
    {
      zoneId: westZone._id,
      wardNumber: 5,
      name: 'Ward 5 - Kaliabid & Hill Drive',
      boundaryPolygon: {
        type: 'Polygon',
        coordinates: [
          [
            [72.110, 21.740],
            [72.135, 21.740],
            [72.135, 21.765],
            [72.110, 21.765],
            [72.110, 21.740]
          ]
        ]
      },
      officeAddress: 'Ward 5 Office, Main Road, Kaliabid, Bhavnagar'
    },
    {
      zoneId: eastZone._id,
      wardNumber: 6,
      name: 'Ward 6 - Subhashnagar & Top3 Circle',
      boundaryPolygon: {
        type: 'Polygon',
        coordinates: [
          [
            [72.165, 21.745],
            [72.185, 21.745],
            [72.185, 21.770],
            [72.165, 21.770],
            [72.165, 21.745]
          ]
        ]
      },
      officeAddress: 'Ward 6 Civic Center, Near Top3 Circle, Subhashnagar, Bhavnagar'
    },
    {
      zoneId: northZone._id,
      wardNumber: 7,
      name: 'Ward 7 - Chitra & GIDC Industrial',
      boundaryPolygon: {
        type: 'Polygon',
        coordinates: [
          [
            [72.100, 21.775],
            [72.135, 21.775],
            [72.135, 21.800],
            [72.100, 21.800],
            [72.100, 21.775]
          ]
        ]
      },
      officeAddress: 'Ward 7 Civic Center, GIDC Main Road, Chitra, Bhavnagar'
    },
    {
      zoneId: centralZone._id,
      wardNumber: 8,
      name: 'Ward 8 - Nilambaug & Victoria Park',
      boundaryPolygon: {
        type: 'Polygon',
        coordinates: [
          [
            [72.135, 21.760],
            [72.155, 21.760],
            [72.155, 21.775],
            [72.135, 21.775],
            [72.135, 21.760]
          ]
        ]
      },
      officeAddress: 'Ward 8 Office, Court Road, Nilambaug, Bhavnagar'
    }
  ]);

  // 3. Seed Departments
  const deptRoad = await Department.create({
    name: 'Road & Infrastructure',
    code: 'DEPT_ROAD',
    description: 'Handles potholes, resurfacing, pavers, and footpath repairs across Bhavnagar',
    defaultSlaHours: { EMERGENCY: 4, HIGH: 24, NORMAL: 72 }
  });

  const deptSanitation = await Department.create({
    name: 'Solid Waste & Sanitation',
    code: 'DEPT_SANITATION',
    description: 'Handles garbage collection, waste dumping, street sweeping, and animal carcasses',
    defaultSlaHours: { EMERGENCY: 4, HIGH: 12, NORMAL: 48 }
  });

  const deptWater = await Department.create({
    name: 'Water Supply Department',
    code: 'DEPT_WATER',
    description: 'Handles pipeline leaks, water contamination, pipeline pressure, and valve maintenance',
    defaultSlaHours: { EMERGENCY: 2, HIGH: 12, NORMAL: 24 }
  });

  const deptElectrical = await Department.create({
    name: 'Electrical & Street Lighting',
    code: 'DEPT_ELECTRICAL',
    description: 'Maintains streetlights, high masts, feeder pillars, and electrical poles',
    defaultSlaHours: { EMERGENCY: 4, HIGH: 24, NORMAL: 48 }
  });

  const deptDrainage = await Department.create({
    name: 'Drainage & Sewerage',
    code: 'DEPT_DRAINAGE',
    description: 'Manages underground drains, clogged gutters, manhole covers, and stormwater lines',
    defaultSlaHours: { EMERGENCY: 4, HIGH: 18, NORMAL: 48 }
  });

  // 4. Seed Categories
  const categories = await Category.create([
    {
      name: 'Road & Pothole',
      icon: 'Construction',
      defaultDepartmentId: deptRoad._id,
      defaultPriority: Priorities.HIGH,
      subcategories: ['Pothole Repair', 'Road Resurfacing', 'Damaged Footpath', 'Paver Block Sinking', 'Road Cave-in']
    },
    {
      name: 'Garbage & Cleanliness',
      icon: 'Trash2',
      defaultDepartmentId: deptSanitation._id,
      defaultPriority: Priorities.NORMAL,
      subcategories: ['Garbage Dump Overflow', 'Missed Door-to-Door Collection', 'Dead Animal Removal', 'Illegal Debris Dumping', 'Public Toilet Cleaning']
    },
    {
      name: 'Water Supply Issue',
      icon: 'Droplets',
      defaultDepartmentId: deptWater._id,
      defaultPriority: Priorities.HIGH,
      subcategories: ['Pipeline Leakage', 'No Water Supply', 'Low Pressure', 'Contaminated/Dirty Water', 'Damaged Water Valve']
    },
    {
      name: 'Street Light Fault',
      icon: 'Lightbulb',
      defaultDepartmentId: deptElectrical._id,
      defaultPriority: Priorities.NORMAL,
      subcategories: ['Streetlight Not Glowing', 'Flickering Light', 'Open Wire / Damaged Pole', 'High Mast Light Defect']
    },
    {
      name: 'Drainage & Gutter',
      icon: 'Waves',
      defaultDepartmentId: deptDrainage._id,
      defaultPriority: Priorities.HIGH,
      subcategories: ['Drainage Choke-up', 'Broken Manhole Cover', 'Gutter Overflow', 'Stormwater Drain Siltation']
    }
  ]);

  // 5. Seed Users (Super Admin, Officers, Field Workers, Citizens)
  const admin = await User.create({
    name: 'BMC Central Admin',
    mobile: '9999999999',
    email: 'admin@bmc.gov.in',
    password: defaultPassword,
    role: UserRoles.BMC_ADMIN,
    employeeId: 'ADMIN-001'
  });

  const roadOfficer = await User.create({
    name: 'Rahul Sharma (Road Officer)',
    mobile: '9888888881',
    email: 'rahul.road@bmc.gov.in',
    password: defaultPassword,
    role: UserRoles.DEPT_OFFICER,
    departmentId: deptRoad._id,
    employeeId: 'ROAD-OFF-01'
  });

  const sanitationOfficer = await User.create({
    name: 'Pooja Varma (Sanitation Officer)',
    mobile: '9888888882',
    email: 'pooja.sani@bmc.gov.in',
    password: defaultPassword,
    role: UserRoles.DEPT_OFFICER,
    departmentId: deptSanitation._id,
    employeeId: 'SANI-OFF-02'
  });

  const waterOfficer = await User.create({
    name: 'Vikram Desai (Water Supply Officer)',
    mobile: '9888888883',
    email: 'vikram.water@bmc.gov.in',
    password: defaultPassword,
    role: UserRoles.DEPT_OFFICER,
    departmentId: deptWater._id,
    employeeId: 'WATER-OFF-03'
  });

  const electricalOfficer = await User.create({
    name: 'Suresh Mehta (Electrical Officer)',
    mobile: '9888888884',
    email: 'suresh.elec@bmc.gov.in',
    password: defaultPassword,
    role: UserRoles.DEPT_OFFICER,
    departmentId: deptElectrical._id,
    employeeId: 'ELEC-OFF-04'
  });

  const drainageOfficer = await User.create({
    name: 'Kiran Joshi (Drainage Officer)',
    mobile: '9888888885',
    email: 'kiran.drain@bmc.gov.in',
    password: defaultPassword,
    role: UserRoles.DEPT_OFFICER,
    departmentId: deptDrainage._id,
    employeeId: 'DRAIN-OFF-05'
  });

  // Field Staff
  const staffAmit = await User.create({
    name: 'Amit Patel',
    mobile: '9777777771',
    email: 'amit.field@bmc.gov.in',
    password: defaultPassword,
    role: UserRoles.FIELD_STAFF,
    departmentId: deptRoad._id,
    wardId: wards[4]._id, // Ward 5 Kaliabid
    employeeId: 'STAFF-ROAD-101'
  });

  const staffRaj = await User.create({
    name: 'Raj Shah',
    mobile: '9777777772',
    email: 'raj.field@bmc.gov.in',
    password: defaultPassword,
    role: UserRoles.FIELD_STAFF,
    departmentId: deptSanitation._id,
    wardId: wards[0]._id, // Ward 1 Ghogha
    employeeId: 'STAFF-SANI-102'
  });

  const staffSanjay = await User.create({
    name: 'Sanjay Rathod',
    mobile: '9777777773',
    email: 'sanjay.field@bmc.gov.in',
    password: defaultPassword,
    role: UserRoles.FIELD_STAFF,
    departmentId: deptWater._id,
    wardId: wards[7]._id, // Ward 8 Nilambaug
    employeeId: 'STAFF-WATER-103'
  });

  const staffManoj = await User.create({
    name: 'Manoj Trivedi',
    mobile: '9777777774',
    email: 'manoj.field@bmc.gov.in',
    password: defaultPassword,
    role: UserRoles.FIELD_STAFF,
    departmentId: deptElectrical._id,
    wardId: wards[1]._id, // Ward 2 Barton
    employeeId: 'STAFF-ELEC-104'
  });

  const staffRamesh = await User.create({
    name: 'Ramesh Parmar',
    mobile: '9777777775',
    email: 'ramesh.field@bmc.gov.in',
    password: defaultPassword,
    role: UserRoles.FIELD_STAFF,
    departmentId: deptDrainage._id,
    wardId: wards[5]._id, // Ward 6 Subhashnagar
    employeeId: 'STAFF-DRAIN-105'
  });

  const staffJignesh = await User.create({
    name: 'Jignesh Dave',
    mobile: '9777777776',
    email: 'jignesh.field@bmc.gov.in',
    password: defaultPassword,
    role: UserRoles.FIELD_STAFF,
    departmentId: deptSanitation._id,
    wardId: wards[2]._id, // Ward 3 Rupani
    employeeId: 'STAFF-SANI-106'
  });

  // Citizens
  const citizenBhautik = await User.create({
    name: 'Bhautik Sorathiya',
    mobile: '9876543210',
    email: 'bhautik.citizen@gmail.com',
    role: UserRoles.CITIZEN,
    otpCode: '123456',
    wardId: wards[7]._id // Ward 8 Nilambaug
  });

  const citizenPriya = await User.create({
    name: 'Priya Patel',
    mobile: '9825012345',
    email: 'priya.patel@gmail.com',
    role: UserRoles.CITIZEN,
    otpCode: '123456',
    wardId: wards[2]._id // Ward 3 Rupani
  });

  const citizenRajesh = await User.create({
    name: 'Rajesh Mehta',
    mobile: '9824056789',
    email: 'rajesh.mehta@gmail.com',
    role: UserRoles.CITIZEN,
    otpCode: '123456',
    wardId: wards[4]._id // Ward 5 Kaliabid
  });

  const citizenAnjali = await User.create({
    name: 'Anjali Dave',
    mobile: '9909011223',
    email: 'anjali.dave@gmail.com',
    role: UserRoles.CITIZEN,
    otpCode: '123456',
    wardId: wards[0]._id // Ward 1 Ghogha Circle
  });

  // 6. Seed Realistic Complaints
  console.log('📝 Seeding realistic Bhavnagar civic tickets across all wards and statuses...');

  // Ticket 1: Road & Pothole (In Progress)
  const ticket1 = await Complaint.create({
    ticketId: 'BMC-2026-00101',
    citizenId: citizenBhautik._id,
    categoryId: categories[0]._id, // Road
    subcategory: 'Pothole Repair',
    title: 'Deep hazardous pothole on Nilambaug Circle main junction',
    description: 'A 2.5-foot deep pothole has formed right in the middle of Nilambaug Circle turning lane, causing severe two-wheeler skidding and traffic jam.',
    location: {
      type: 'Point',
      coordinates: [72.1432, 21.7645],
      address: 'Nilambaug Circle, Near Palace Gate, Bhavnagar',
      landmark: 'Opposite Heritage Gate'
    },
    zoneId: centralZone._id,
    wardId: wards[7]._id, // Ward 8 Nilambaug
    status: ComplaintStatuses.IN_PROGRESS,
    priority: Priorities.HIGH,
    assignedDepartmentId: deptRoad._id,
    assignedSupervisorId: roadOfficer._id,
    assignedFieldStaffId: staffAmit._id,
    slaTargetHours: 24,
    slaDeadline: new Date(Date.now() + 14 * 60 * 60 * 1000),
    slaBreached: false,
    workStartedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
      }
    ]
  });

  await AuditLog.create([
    {
      complaintId: ticket1._id,
      actorId: citizenBhautik._id,
      actorRole: UserRoles.CITIZEN,
      actorName: citizenBhautik.name,
      action: 'COMPLAINT_CREATED',
      toState: ComplaintStatuses.SUBMITTED,
      comment: 'Ticket BMC-2026-00101 submitted via Citizen Portal'
    },
    {
      complaintId: ticket1._id,
      actorId: admin._id,
      actorRole: UserRoles.BMC_ADMIN,
      actorName: admin.name,
      action: 'ASSIGNED_TO_DEPARTMENT',
      fromState: ComplaintStatuses.SUBMITTED,
      toState: ComplaintStatuses.ASSIGNED,
      comment: 'Assigned to Road & Infrastructure Department for immediate action'
    },
    {
      complaintId: ticket1._id,
      actorId: roadOfficer._id,
      actorRole: UserRoles.DEPT_OFFICER,
      actorName: roadOfficer.name,
      action: 'DISPATCHED_TO_STAFF',
      fromState: ComplaintStatuses.ASSIGNED,
      toState: ComplaintStatuses.ASSIGNED,
      comment: 'Dispatched to technician Amit Patel'
    },
    {
      complaintId: ticket1._id,
      actorId: staffAmit._id,
      actorRole: UserRoles.FIELD_STAFF,
      actorName: staffAmit.name,
      action: 'WORK_STARTED',
      fromState: ComplaintStatuses.ASSIGNED,
      toState: ComplaintStatuses.IN_PROGRESS,
      comment: 'Arrived at site with asphalt roller and cold mix bitumen'
    }
  ]);

  // Ticket 2: Water Supply (Assigned - Emergency)
  const ticket2 = await Complaint.create({
    ticketId: 'BMC-2026-00102',
    citizenId: citizenPriya._id,
    categoryId: categories[2]._id, // Water
    subcategory: 'Pipeline Leakage',
    title: 'Main drinking water pipeline burst causing heavy flooding',
    description: 'High pressure 8-inch main supply pipe burst near Barton Library corner. Millions of liters of potable water flooding the street.',
    location: {
      type: 'Point',
      coordinates: [72.1465, 21.7732],
      address: 'Haluria Chowk, Barton Library Corner, Bhavnagar',
      landmark: 'Near City Central Post Office'
    },
    zoneId: centralZone._id,
    wardId: wards[1]._id, // Ward 2 Barton
    status: ComplaintStatuses.ASSIGNED,
    priority: Priorities.EMERGENCY,
    assignedDepartmentId: deptWater._id,
    assignedSupervisorId: waterOfficer._id,
    assignedFieldStaffId: staffSanjay._id,
    slaTargetHours: 2,
    slaDeadline: new Date(Date.now() + 1.5 * 60 * 60 * 1000),
    slaBreached: false,
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ]
  });

  await AuditLog.create([
    {
      complaintId: ticket2._id,
      actorId: citizenPriya._id,
      actorRole: UserRoles.CITIZEN,
      actorName: citizenPriya.name,
      action: 'COMPLAINT_CREATED',
      toState: ComplaintStatuses.SUBMITTED,
      comment: 'Emergency pipeline burst reported'
    },
    {
      complaintId: ticket2._id,
      actorId: admin._id,
      actorRole: UserRoles.BMC_ADMIN,
      actorName: admin.name,
      action: 'ASSIGNED_TO_DEPARTMENT',
      fromState: ComplaintStatuses.SUBMITTED,
      toState: ComplaintStatuses.ASSIGNED,
      comment: 'Auto-triaged as Emergency (2h SLA)'
    },
    {
      complaintId: ticket2._id,
      actorId: waterOfficer._id,
      actorRole: UserRoles.DEPT_OFFICER,
      actorName: waterOfficer.name,
      action: 'DISPATCHED_TO_STAFF',
      fromState: ComplaintStatuses.ASSIGNED,
      toState: ComplaintStatuses.ASSIGNED,
      comment: 'Emergency dispatch to Sanjay Rathod with pipe repair clamp kit'
    }
  ]);

  // Ticket 3: Sanitation (Awaiting Verification - Resolved with Photos)
  const ticket3 = await Complaint.create({
    ticketId: 'BMC-2026-00103',
    citizenId: citizenAnjali._id,
    categoryId: categories[1]._id, // Sanitation
    subcategory: 'Garbage Dump Overflow',
    title: 'Community garbage container overflowing onto pedestrian sidewalk',
    description: 'Large blue community bin at Ghogha Circle has not been emptied for 3 days. Severe foul smell and stray animals scattering refuse.',
    location: {
      type: 'Point',
      coordinates: [72.1582, 21.7668],
      address: 'Ghogha Circle Main Road, Near vegetable market, Bhavnagar',
      landmark: 'Next to Municipal Community Hall'
    },
    zoneId: centralZone._id,
    wardId: wards[0]._id, // Ward 1 Ghogha
    status: ComplaintStatuses.AWAITING_VERIFICATION,
    priority: Priorities.HIGH,
    assignedDepartmentId: deptSanitation._id,
    assignedSupervisorId: sanitationOfficer._id,
    assignedFieldStaffId: staffRaj._id,
    slaTargetHours: 12,
    slaDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
    slaBreached: false,
    workStartedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    workCompletedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 10 * 60 * 60 * 1000)
      }
    ],
    resolutionEvidence: {
      beforePhotoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600',
      afterPhotoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600',
      resolutionNote: 'Garbage fully lifted by BMC hydraulic dumper truck GJ04-9812. Sidewalk washed and bleached with disinfectant powder.',
      submittedBy: staffRaj._id,
      submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    }
  });

  await AuditLog.create([
    {
      complaintId: ticket3._id,
      actorId: citizenAnjali._id,
      actorRole: UserRoles.CITIZEN,
      actorName: citizenAnjali.name,
      action: 'COMPLAINT_CREATED',
      toState: ComplaintStatuses.SUBMITTED,
      comment: 'Garbage overflow complaint lodged'
    },
    {
      complaintId: ticket3._id,
      actorId: admin._id,
      actorRole: UserRoles.BMC_ADMIN,
      actorName: admin.name,
      action: 'ASSIGNED_TO_DEPARTMENT',
      fromState: ComplaintStatuses.SUBMITTED,
      toState: ComplaintStatuses.ASSIGNED,
      comment: 'Forwarded to Solid Waste Department'
    },
    {
      complaintId: ticket3._id,
      actorId: staffRaj._id,
      actorRole: UserRoles.FIELD_STAFF,
      actorName: staffRaj.name,
      action: 'WORK_STARTED',
      fromState: ComplaintStatuses.ASSIGNED,
      toState: ComplaintStatuses.IN_PROGRESS,
      comment: 'Dumper vehicle deployed to location'
    },
    {
      complaintId: ticket3._id,
      actorId: staffRaj._id,
      actorRole: UserRoles.FIELD_STAFF,
      actorName: staffRaj.name,
      action: 'RESOLUTION_SUBMITTED',
      fromState: ComplaintStatuses.IN_PROGRESS,
      toState: ComplaintStatuses.AWAITING_VERIFICATION,
      comment: 'Cleared site and uploaded before/after evidence photos'
    }
  ]);

  // Ticket 4: Electrical (Closed - Citizen Verified)
  const ticket4 = await Complaint.create({
    ticketId: 'BMC-2026-00104',
    citizenId: citizenBhautik._id,
    categoryId: categories[3]._id, // Electrical
    subcategory: 'Streetlight Not Glowing',
    title: 'Series of 6 streetlight fixtures dark near Takhteshwar Temple',
    description: 'Entire street leading to Takhteshwar temple has been in total darkness for 4 nights.',
    location: {
      type: 'Point',
      coordinates: [72.1368, 21.7395],
      address: 'Takhteshwar Temple Approach Road, Bhavnagar',
      landmark: 'Near Temple Step Gate'
    },
    zoneId: southZone._id,
    wardId: wards[3]._id, // Ward 4 Takhteshwar
    status: ComplaintStatuses.CLOSED,
    priority: Priorities.NORMAL,
    assignedDepartmentId: deptElectrical._id,
    assignedSupervisorId: electricalOfficer._id,
    assignedFieldStaffId: staffManoj._id,
    slaTargetHours: 48,
    slaDeadline: new Date(Date.now() - 12 * 60 * 60 * 1000),
    slaBreached: false,
    workStartedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    workCompletedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    closedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 40 * 60 * 60 * 1000)
      }
    ],
    resolutionEvidence: {
      beforePhotoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
      afterPhotoUrl: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=600',
      resolutionNote: 'Replaced 6 burnt 70W LED driver modules and repaired phase neutral junction relay at pole #TK-14.',
      submittedBy: staffManoj._id,
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  });

  await AuditLog.create([
    {
      complaintId: ticket4._id,
      actorId: citizenBhautik._id,
      actorRole: UserRoles.CITIZEN,
      actorName: citizenBhautik.name,
      action: 'COMPLAINT_CREATED',
      toState: ComplaintStatuses.SUBMITTED,
      comment: 'Ticket logged'
    },
    {
      complaintId: ticket4._id,
      actorId: electricalOfficer._id,
      actorRole: UserRoles.DEPT_OFFICER,
      actorName: electricalOfficer.name,
      action: 'DISPATCHED_TO_STAFF',
      fromState: ComplaintStatuses.SUBMITTED,
      toState: ComplaintStatuses.ASSIGNED,
      comment: 'Assigned to Manoj Trivedi'
    },
    {
      complaintId: ticket4._id,
      actorId: staffManoj._id,
      actorRole: UserRoles.FIELD_STAFF,
      actorName: staffManoj.name,
      action: 'RESOLUTION_SUBMITTED',
      fromState: ComplaintStatuses.IN_PROGRESS,
      toState: ComplaintStatuses.AWAITING_VERIFICATION,
      comment: 'All 6 lights tested and working'
    },
    {
      complaintId: ticket4._id,
      actorId: citizenBhautik._id,
      actorRole: UserRoles.CITIZEN,
      actorName: citizenBhautik.name,
      action: 'CITIZEN_VERIFIED_CLOSED',
      fromState: ComplaintStatuses.AWAITING_VERIFICATION,
      toState: ComplaintStatuses.CLOSED,
      comment: 'Citizen confirmed: All streetlights restored brightly. Excellent quick work.'
    }
  ]);

  // Ticket 5: Drainage (Submitted - Untriaged)
  const ticket5 = await Complaint.create({
    ticketId: 'BMC-2026-00105',
    citizenId: citizenRajesh._id,
    categoryId: categories[4]._id, // Drainage
    subcategory: 'Gutter Overflow',
    title: 'Sewage water backflow onto public road near Chitra GIDC Phase 2',
    description: 'Underground sewer line blocked, forcing foul dark sewage water onto the street right outside factory gates.',
    location: {
      type: 'Point',
      coordinates: [72.1185, 21.7865],
      address: 'Plot 42, Road No 3, Chitra GIDC Industrial Area, Bhavnagar',
      landmark: 'Near Gujarat Gas Depot'
    },
    zoneId: northZone._id,
    wardId: wards[6]._id, // Ward 7 Chitra
    status: ComplaintStatuses.SUBMITTED,
    priority: Priorities.HIGH,
    assignedDepartmentId: deptDrainage._id,
    slaTargetHours: 18,
    slaDeadline: new Date(Date.now() + 16 * 60 * 60 * 1000),
    slaBreached: false,
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ]
  });

  await AuditLog.create({
    complaintId: ticket5._id,
    actorId: citizenRajesh._id,
    actorRole: UserRoles.CITIZEN,
    actorName: citizenRajesh.name,
    action: 'COMPLAINT_CREATED',
    toState: ComplaintStatuses.SUBMITTED,
    comment: 'Complaint logged, awaiting departmental triage'
  });

  // Ticket 6: Electrical Hazard (In Progress - Emergency)
  const ticket6 = await Complaint.create({
    ticketId: 'BMC-2026-00106',
    citizenId: citizenRajesh._id,
    categoryId: categories[3]._id, // Electrical
    subcategory: 'Open Wire / Damaged Pole',
    title: 'Open exposed high-voltage feeder box at Kaliabid Primary School',
    description: 'Electric pillar box lock broken and live 415V busbars exposed right beside primary school playground path.',
    location: {
      type: 'Point',
      coordinates: [72.1245, 21.7482],
      address: 'Kaliabid Main School Road, Bhavnagar',
      landmark: 'Opposite Government Primary School'
    },
    zoneId: westZone._id,
    wardId: wards[4]._id, // Ward 5 Kaliabid
    status: ComplaintStatuses.IN_PROGRESS,
    priority: Priorities.EMERGENCY,
    assignedDepartmentId: deptElectrical._id,
    assignedSupervisorId: electricalOfficer._id,
    assignedFieldStaffId: staffManoj._id,
    slaTargetHours: 4,
    slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
    slaBreached: false,
    workStartedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ]
  });

  await AuditLog.create([
    {
      complaintId: ticket6._id,
      actorId: citizenRajesh._id,
      actorRole: UserRoles.CITIZEN,
      actorName: citizenRajesh.name,
      action: 'COMPLAINT_CREATED',
      toState: ComplaintStatuses.SUBMITTED,
      comment: 'High voltage electrical emergency'
    },
    {
      complaintId: ticket6._id,
      actorId: electricalOfficer._id,
      actorRole: UserRoles.DEPT_OFFICER,
      actorName: electricalOfficer.name,
      action: 'DISPATCHED_TO_STAFF',
      fromState: ComplaintStatuses.SUBMITTED,
      toState: ComplaintStatuses.ASSIGNED,
      comment: 'Emergency squad dispatched immediately'
    },
    {
      complaintId: ticket6._id,
      actorId: staffManoj._id,
      actorRole: UserRoles.FIELD_STAFF,
      actorName: staffManoj.name,
      action: 'WORK_STARTED',
      fromState: ComplaintStatuses.ASSIGNED,
      toState: ComplaintStatuses.IN_PROGRESS,
      comment: 'Cordoned off school perimeter with danger tape and replacing lock mechanism'
    }
  ]);

  // Ticket 7: Sanitation Debris (Assigned)
  const ticket7 = await Complaint.create({
    ticketId: 'BMC-2026-00107',
    citizenId: citizenAnjali._id,
    categoryId: categories[1]._id, // Sanitation
    subcategory: 'Illegal Debris Dumping',
    title: 'Debris and concrete waste illegally dumped along Ghogha Road footpath',
    description: 'Renovation construction debris dumped on public walking path, forcing elderly citizens to walk in heavy moving vehicle traffic.',
    location: {
      type: 'Point',
      coordinates: [72.1620, 21.7690],
      address: 'Ghogha Road, Near Ruvapari Mandir, Bhavnagar',
      landmark: 'Near Ruvapari Gate'
    },
    zoneId: centralZone._id,
    wardId: wards[0]._id, // Ward 1 Ghogha
    status: ComplaintStatuses.ASSIGNED,
    priority: Priorities.NORMAL,
    assignedDepartmentId: deptSanitation._id,
    assignedSupervisorId: sanitationOfficer._id,
    assignedFieldStaffId: staffRaj._id,
    slaTargetHours: 48,
    slaDeadline: new Date(Date.now() + 36 * 60 * 60 * 1000),
    slaBreached: false,
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
      }
    ]
  });

  await AuditLog.create({
    complaintId: ticket7._id,
    actorId: citizenAnjali._id,
    actorRole: UserRoles.CITIZEN,
    actorName: citizenAnjali.name,
    action: 'COMPLAINT_CREATED',
    toState: ComplaintStatuses.SUBMITTED,
    comment: 'Debris complaint lodged'
  });

  // Ticket 8: Drainage Choke-up (Awaiting Verification)
  const ticket8 = await Complaint.create({
    ticketId: 'BMC-2026-00108',
    citizenId: citizenBhautik._id,
    categoryId: categories[4]._id, // Drainage
    subcategory: 'Drainage Choke-up',
    title: 'Stormwater gutter choked with plastic silt opposite Subhashnagar Garden',
    description: 'Stormwater inlet pipe completely choked with polythene bags and mud silt.',
    location: {
      type: 'Point',
      coordinates: [72.1725, 21.7580],
      address: 'Subhashnagar Main Road, Near Public Garden, Bhavnagar',
      landmark: 'Opposite Subhashnagar Municipal Garden'
    },
    zoneId: eastZone._id,
    wardId: wards[5]._id, // Ward 6 Subhashnagar
    status: ComplaintStatuses.AWAITING_VERIFICATION,
    priority: Priorities.HIGH,
    assignedDepartmentId: deptDrainage._id,
    assignedSupervisorId: drainageOfficer._id,
    assignedFieldStaffId: staffRamesh._id,
    slaTargetHours: 18,
    slaDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
    slaBreached: false,
    workStartedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    workCompletedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ],
    resolutionEvidence: {
      beforePhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600',
      afterPhotoUrl: 'https://images.unsplash.com/photo-1584463699039-446a81bb1a09?w=600',
      resolutionNote: 'De-silted 40 meters of stormwater line using high-pressure jetting machine #BMC-JET-02.',
      submittedBy: staffRamesh._id,
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  });

  await AuditLog.create([
    {
      complaintId: ticket8._id,
      actorId: citizenBhautik._id,
      actorRole: UserRoles.CITIZEN,
      actorName: citizenBhautik.name,
      action: 'COMPLAINT_CREATED',
      toState: ComplaintStatuses.SUBMITTED,
      comment: 'Ticket BMC-2026-00108 submitted'
    },
    {
      complaintId: ticket8._id,
      actorId: drainageOfficer._id,
      actorRole: UserRoles.DEPT_OFFICER,
      actorName: drainageOfficer.name,
      action: 'DISPATCHED_TO_STAFF',
      fromState: ComplaintStatuses.SUBMITTED,
      toState: ComplaintStatuses.ASSIGNED,
      comment: 'Assigned to Ramesh Parmar'
    },
    {
      complaintId: ticket8._id,
      actorId: staffRamesh._id,
      actorRole: UserRoles.FIELD_STAFF,
      actorName: staffRamesh.name,
      action: 'RESOLUTION_SUBMITTED',
      fromState: ComplaintStatuses.IN_PROGRESS,
      toState: ComplaintStatuses.AWAITING_VERIFICATION,
      comment: 'High pressure jetting completed'
    }
  ]);

  // Ticket 9: Water Supply (Submitted - Normal)
  const ticket9 = await Complaint.create({
    ticketId: 'BMC-2026-00109',
    citizenId: citizenPriya._id,
    categoryId: categories[2]._id, // Water
    subcategory: 'Low Pressure',
    title: 'Low drinking water pressure in entire Shantiniketan Society',
    description: 'During morning 6 AM - 7 AM water supply timing, tap pressure is extremely weak. 2nd floor residents getting zero water.',
    location: {
      type: 'Point',
      coordinates: [72.1410, 21.7560],
      address: 'Shantiniketan Society, Rupani Circle, Bhavnagar',
      landmark: 'Near Shantiniketan School'
    },
    zoneId: centralZone._id,
    wardId: wards[2]._id, // Ward 3 Rupani
    status: ComplaintStatuses.SUBMITTED,
    priority: Priorities.NORMAL,
    assignedDepartmentId: deptWater._id,
    slaTargetHours: 24,
    slaDeadline: new Date(Date.now() + 22 * 60 * 60 * 1000),
    slaBreached: false,
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]
  });

  await AuditLog.create({
    complaintId: ticket9._id,
    actorId: citizenPriya._id,
    actorRole: UserRoles.CITIZEN,
    actorName: citizenPriya.name,
    action: 'COMPLAINT_CREATED',
    toState: ComplaintStatuses.SUBMITTED,
    comment: 'Water pressure complaint registered'
  });

  // Ticket 10: Broken Manhole Cover (In Progress - Emergency)
  const ticket10 = await Complaint.create({
    ticketId: 'BMC-2026-00110',
    citizenId: citizenPriya._id,
    categoryId: categories[4]._id, // Drainage
    subcategory: 'Broken Manhole Cover',
    title: 'Missing manhole cover on heavy traffic Ring Road near Rupani Circle',
    description: 'Cast iron manhole lid missing. Deep 12-foot pit open directly in lane where vehicles travel at speed.',
    location: {
      type: 'Point',
      coordinates: [72.1375, 21.7545],
      address: 'Ring Road, 100m before Rupani Circle, Bhavnagar',
      landmark: 'Opposite Green Park Complex'
    },
    zoneId: centralZone._id,
    wardId: wards[2]._id, // Ward 3 Rupani
    status: ComplaintStatuses.IN_PROGRESS,
    priority: Priorities.EMERGENCY,
    assignedDepartmentId: deptDrainage._id,
    assignedSupervisorId: drainageOfficer._id,
    assignedFieldStaffId: staffRamesh._id,
    slaTargetHours: 4,
    slaDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000),
    slaBreached: false,
    workStartedAt: new Date(Date.now() - 30 * 60 * 1000),
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
      }
    ]
  });

  await AuditLog.create([
    {
      complaintId: ticket10._id,
      actorId: citizenPriya._id,
      actorRole: UserRoles.CITIZEN,
      actorName: citizenPriya.name,
      action: 'COMPLAINT_CREATED',
      toState: ComplaintStatuses.SUBMITTED,
      comment: 'Emergency open manhole danger reported'
    },
    {
      complaintId: ticket10._id,
      actorId: drainageOfficer._id,
      actorRole: UserRoles.DEPT_OFFICER,
      actorName: drainageOfficer.name,
      action: 'DISPATCHED_TO_STAFF',
      fromState: ComplaintStatuses.SUBMITTED,
      toState: ComplaintStatuses.ASSIGNED,
      comment: 'Immediate heavy cover replacement vehicle dispatched'
    },
    {
      complaintId: ticket10._id,
      actorId: staffRamesh._id,
      actorRole: UserRoles.FIELD_STAFF,
      actorName: staffRamesh.name,
      action: 'WORK_STARTED',
      fromState: ComplaintStatuses.ASSIGNED,
      toState: ComplaintStatuses.IN_PROGRESS,
      comment: 'Placed traffic cones and installing reinforced SFRC frame & cover'
    }
  ]);

  // Ticket 11: Sanitation Dead Animal (Assigned)
  const ticket11 = await Complaint.create({
    ticketId: 'BMC-2026-00111',
    citizenId: citizenAnjali._id,
    categoryId: categories[1]._id, // Sanitation
    subcategory: 'Dead Animal Removal',
    title: 'Animal carcass removal required urgently near Top3 Circle service lane',
    description: 'Animal carcass lying on side of service road near Top3 Circle. Sanitation removal van requested urgently.',
    location: {
      type: 'Point',
      coordinates: [72.1760, 21.7610],
      address: 'Top3 Circle Service Lane, Subhashnagar, Bhavnagar',
      landmark: 'Near Highway Flyover Bridge'
    },
    zoneId: eastZone._id,
    wardId: wards[5]._id, // Ward 6 Subhashnagar
    status: ComplaintStatuses.ASSIGNED,
    priority: Priorities.HIGH,
    assignedDepartmentId: deptSanitation._id,
    assignedSupervisorId: sanitationOfficer._id,
    assignedFieldStaffId: staffJignesh._id,
    slaTargetHours: 12,
    slaDeadline: new Date(Date.now() + 10 * 60 * 60 * 1000),
    slaBreached: false,
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]
  });

  await AuditLog.create({
    complaintId: ticket11._id,
    actorId: citizenAnjali._id,
    actorRole: UserRoles.CITIZEN,
    actorName: citizenAnjali.name,
    action: 'COMPLAINT_CREATED',
    toState: ComplaintStatuses.SUBMITTED,
    comment: 'Animal carcass report'
  });

  // Ticket 12: Road & Tree Clearance (Closed)
  const ticket12 = await Complaint.create({
    ticketId: 'BMC-2026-00112',
    citizenId: citizenRajesh._id,
    categoryId: categories[0]._id, // Road
    subcategory: 'Damaged Footpath',
    title: 'Fallen banyan tree branch blocking entire Hill Drive lane',
    description: 'Heavy storm caused large tree branch to fall, obstructing road lane near Hill Drive turning.',
    location: {
      type: 'Point',
      coordinates: [72.1280, 21.7520],
      address: 'Hill Drive Road, Kaliabid, Bhavnagar',
      landmark: 'Near Hill Drive Garden Gate'
    },
    zoneId: westZone._id,
    wardId: wards[4]._id, // Ward 5 Kaliabid
    status: ComplaintStatuses.CLOSED,
    priority: Priorities.HIGH,
    assignedDepartmentId: deptRoad._id,
    assignedSupervisorId: roadOfficer._id,
    assignedFieldStaffId: staffAmit._id,
    slaTargetHours: 24,
    slaDeadline: new Date(Date.now() - 5 * 60 * 60 * 1000),
    slaBreached: false,
    workStartedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    workCompletedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    closedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    citizenAttachments: [
      {
        url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        fileType: 'IMAGE',
        uploadedAt: new Date(Date.now() - 22 * 60 * 60 * 1000)
      }
    ],
    resolutionEvidence: {
      beforePhotoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
      afterPhotoUrl: 'https://images.unsplash.com/photo-1584463699039-446a81bb1a09?w=600',
      resolutionNote: 'Tree branches safely cut with chainsaw, debris hauled away by crane truck, lane opened to traffic.',
      submittedBy: staffAmit._id,
      submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000)
    }
  });

  await AuditLog.create([
    {
      complaintId: ticket12._id,
      actorId: citizenRajesh._id,
      actorRole: UserRoles.CITIZEN,
      actorName: citizenRajesh.name,
      action: 'COMPLAINT_CREATED',
      toState: ComplaintStatuses.SUBMITTED,
      comment: 'Fallen branch reported'
    },
    {
      complaintId: ticket12._id,
      actorId: staffAmit._id,
      actorRole: UserRoles.FIELD_STAFF,
      actorName: staffAmit.name,
      action: 'RESOLUTION_SUBMITTED',
      fromState: ComplaintStatuses.IN_PROGRESS,
      toState: ComplaintStatuses.AWAITING_VERIFICATION,
      comment: 'Branch cut and hauled away'
    },
    {
      complaintId: ticket12._id,
      actorId: citizenRajesh._id,
      actorRole: UserRoles.CITIZEN,
      actorName: citizenRajesh.name,
      action: 'CITIZEN_VERIFIED_CLOSED',
      fromState: ComplaintStatuses.AWAITING_VERIFICATION,
      toState: ComplaintStatuses.CLOSED,
      comment: 'Citizen confirmed: Road is completely clear and clean. Thank you BMC team!'
    }
  ]);

  console.log('✅ Seed completed successfully with 12 real Bhavnagar civic tickets across 8 wards!');
  console.log('📋 Demo Credentials:');
  console.log('  • BMC Super Admin: Mobile "9999999999" or "admin@bmc.gov.in" (Password: Admin@123)');
  console.log('  • Road Dept Officer: Mobile "9888888881" (Password: Admin@123)');
  console.log('  • Sanitation Dept Officer: Mobile "9888888882" (Password: Admin@123)');
  console.log('  • Water Dept Officer: Mobile "9888888883" (Password: Admin@123)');
  console.log('  • Field Staff (Amit Patel - Road): Mobile "9777777771" (Password: Admin@123)');
  console.log('  • Field Staff (Raj Shah - Sanitation): Mobile "9777777772" (Password: Admin@123)');
  console.log('  • Citizen (Bhautik Sorathiya): Mobile "9876543210" (OTP: 123456)');
  console.log('  • Citizen (Priya Patel): Mobile "9825012345" (OTP: 123456)');

  await mongoose.disconnect();
}

// Run directly if called as a script
if (process.argv[1]?.endsWith('seedData.ts') || process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}
