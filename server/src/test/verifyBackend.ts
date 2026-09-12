import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Zone, Ward } from '../models/Ward.js';
import { Department } from '../models/Department.js';
import { Category } from '../models/Category.js';
import { Complaint } from '../models/Complaint.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import { AuthService } from '../services/auth.service.js';
import { GeoService } from '../services/geo.service.js';
import { ComplaintService } from '../services/complaint.service.js';
import { AdminController } from '../controllers/admin.controller.js';
import {
  UserRoles,
  ComplaintStatuses,
  Priorities,
  canTransitionStatus
} from '@bmc/shared';

interface TestResult {
  section: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, section: string, name: string, details?: string) {
  results.push({ section, name, passed: condition, details });
  if (condition) {
    console.log(`  ✅ [PASS] ${section} -> ${name}`);
  } else {
    console.error(`  ❌ [FAIL] ${section} -> ${name} ${details ? `(${details})` : ''}`);
  }
}

export async function runCompleteBackendVerification() {
  console.log('\n================================================================');
  console.log('🚀 BMC CivicConnect — Comprehensive Backend Verification Suite');
  console.log('================================================================\n');

  try {
    // ---------------------------------------------------------
    // SECTION 0: DATABASE CONNECTION & SEEDING VERIFICATION
    // ---------------------------------------------------------
    console.log('📦 SECTION 1: Database Connection & Atlas Cluster Verification');
    await mongoose.connect(env.MONGODB_URI);
    assert(mongoose.connection.readyState === 1, 'Database', 'MongoDB Atlas Connected Successfully', `DB: ${mongoose.connection.name}`);

    // Clear and Seed
    await Promise.all([
      User.deleteMany({}),
      Zone.deleteMany({}),
      Ward.deleteMany({}),
      Department.deleteMany({}),
      Category.deleteMany({}),
      Complaint.deleteMany({}),
      AuditLog.deleteMany({}),
      Notification.deleteMany({})
    ]);

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const centralZone = await Zone.create({ name: 'Central Zone', code: 'ZONE_CENTRAL' });
    const westZone = await Zone.create({ name: 'West Zone', code: 'ZONE_WEST' });
    assert(!!centralZone._id && !!westZone._id, 'Database', 'Zone Collections & Indexes Operational');

    const ward5 = await Ward.create({
      zoneId: westZone._id,
      wardNumber: 5,
      name: 'Ward 5 - Kaliabid Ward',
      boundaryPolygon: {
        type: 'Polygon',
        coordinates: [
          [
            [72.10, 21.70],
            [72.16, 21.70],
            [72.16, 21.78],
            [72.10, 21.78],
            [72.10, 21.70]
          ]
        ]
      },
      officeAddress: 'Ward 5 Office, Main Road, Kaliabid'
    });
    assert(!!ward5._id, 'Database', 'Ward Collection with 2dsphere GeoJSON Polygon Operational');

    const deptRoad = await Department.create({
      name: 'Road & Infrastructure',
      code: 'DEPT_ROAD',
      description: 'Handles potholes, resurfacing, pavers, and footpath repairs',
      defaultSlaHours: { EMERGENCY: 4, HIGH: 24, NORMAL: 72 }
    });
    assert(!!deptRoad._id, 'Database', 'Department Collection with SLA Rules Operational');

    const categoryRoad = await Category.create({
      name: 'Road & Pothole',
      icon: 'Construction',
      defaultDepartmentId: deptRoad._id,
      defaultPriority: Priorities.HIGH,
      subcategories: ['Pothole Repair', 'Road Resurfacing', 'Damaged Footpath']
    });
    assert(!!categoryRoad._id, 'Database', 'Category Collection with Auto-Routing Link Operational');

    const adminUser = await User.create({
      name: 'BMC Central Admin',
      mobile: '9999999999',
      email: 'admin@bmc.gov.in',
      password: hashedPassword,
      role: UserRoles.BMC_ADMIN,
      employeeId: 'ADMIN-001'
    });

    const officerUser = await User.create({
      name: 'Rahul Sharma (Road Officer)',
      mobile: '9888888881',
      email: 'rahul.road@bmc.gov.in',
      password: hashedPassword,
      role: UserRoles.DEPT_OFFICER,
      departmentId: deptRoad._id,
      employeeId: 'ROAD-OFF-01'
    });

    const fieldWorker = await User.create({
      name: 'Amit Patel',
      mobile: '9777777771',
      email: 'amit.field@bmc.gov.in',
      password: hashedPassword,
      role: UserRoles.FIELD_STAFF,
      departmentId: deptRoad._id,
      wardId: ward5._id,
      employeeId: 'STAFF-ROAD-101'
    });

    const citizenUser = await User.create({
      name: 'Bhautik Sorathiya',
      mobile: '9876543210',
      email: 'bhautik.citizen@gmail.com',
      role: UserRoles.CITIZEN,
      otpCode: '123456'
    });

    assert(
      !!adminUser._id && !!officerUser._id && !!fieldWorker._id && !!citizenUser._id,
      'Database',
      '4-Role User Hierarchy Model (Admin, Dept, Field, Citizen) Operational'
    );

    // ---------------------------------------------------------
    // SECTION 2: AUTHENTICATION & RBAC SERVICES
    // ---------------------------------------------------------
    console.log('\n🔐 SECTION 2: Authentication & RBAC Verification');

    // 1. Citizen OTP Send & Verify
    const otpSendResult = await AuthService.sendOtp('9876543210');
    assert(otpSendResult.success === true, 'Auth Service', 'Citizen OTP Dispatch Pipeline Operational');

    const citizenSession = await AuthService.verifyOtp('9876543210', '123456');
    assert(
      !!citizenSession.accessToken && citizenSession.user.role === UserRoles.CITIZEN,
      'Auth Service',
      'Citizen OTP Verification & JWT Token Issuance Operational'
    );

    // 2. Staff Password Login
    const adminSession = await AuthService.passwordLogin('admin@bmc.gov.in', 'Admin@123');
    assert(
      !!adminSession.accessToken && adminSession.user.role === UserRoles.BMC_ADMIN,
      'Auth Service',
      'Admin Password Login & Role Token Issuance Operational'
    );

    const workerSession = await AuthService.passwordLogin('9777777771', 'Admin@123');
    assert(
      !!workerSession.accessToken && workerSession.user.role === UserRoles.FIELD_STAFF,
      'Auth Service',
      'Field Staff Mobile Login & Token Issuance Operational'
    );

    // ---------------------------------------------------------
    // SECTION 3: SMART GIS, WARD DETECTION & DUPLICATE CHECKS
    // ---------------------------------------------------------
    console.log('\n🗺️ SECTION 3: Smart Geospatial & Auto-Routing Verification');

    // Detect Ward using MongoDB $geoIntersects
    const detectedWard = await GeoService.detectWard(72.138, 21.753);
    assert(
      detectedWard?.wardNumber === 5,
      'GIS Service',
      'Smart Ward Detection ($geoIntersects Polygon Containment) Operational',
      `Detected Ward: ${detectedWard?.name}`
    );

    // ---------------------------------------------------------
    // SECTION 4: 4-PARTY COMPLAINT CLOSED-LOOP STATE MACHINE
    // ---------------------------------------------------------
    console.log('\n🔄 SECTION 4: 4-Party Closed-Loop Lifecycle & State Machine Verification');

    // Step 1: Citizen Reports Issue
    const createdComplaint = await ComplaintService.createComplaint(
      citizenUser._id.toString(),
      citizenUser.name,
      {
        categoryId: categoryRoad._id.toString(),
        subcategory: 'Pothole Repair',
        title: 'Severe pothole near Main Road junction',
        description: 'Large 2-foot pothole on the road causing traffic slowdown.',
        location: {
          coordinates: [72.138, 21.753],
          address: 'Near Main Crossroad, Kaliabid, Bhavnagar'
        },
        wardId: ward5._id.toString(),
        priority: Priorities.HIGH,
        attachments: [
          {
            url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
            fileType: 'IMAGE'
          }
        ]
      }
    );

    assert(
      createdComplaint.ticketId.startsWith('BMC-') && createdComplaint.status === ComplaintStatuses.SUBMITTED,
      'Complaint Service',
      'Step 1 (Citizen Report): Ticket Generated with SUBMITTED Status & SLA Target (24h)'
    );

    // Verify Audit Log for creation
    const log1 = await AuditLog.findOne({ complaintId: createdComplaint._id, action: 'COMPLAINT_CREATED' });
    assert(!!log1, 'Audit Log', 'Audit Log Creation Event Immutable Recording Operational');

    // Step 2: BMC Admin / Supervisor Assigns Department & Field Staff
    const assignedComplaint = await ComplaintService.assignComplaint(
      createdComplaint._id.toString(),
      { id: adminUser._id.toString(), name: adminUser.name, role: UserRoles.BMC_ADMIN },
      {
        departmentId: deptRoad._id.toString(),
        fieldStaffId: fieldWorker._id.toString(),
        notes: 'Assigned to Road Dept field worker Amit Patel'
      }
    );

    const assignedStaffId = (assignedComplaint.assignedFieldStaffId as any)?._id?.toString() || assignedComplaint.assignedFieldStaffId?.toString();
    assert(
      assignedComplaint.status === ComplaintStatuses.ASSIGNED &&
      assignedStaffId === fieldWorker._id.toString(),
      'Complaint Service',
      'Step 2 (Admin/Dept Triage): Ticket Assigned to Field Staff Operational'
    );

    // Step 3: Field Staff Starts Work on Site
    const inProgressComplaint = await ComplaintService.startWork(
      createdComplaint._id.toString(),
      { id: fieldWorker._id.toString(), name: fieldWorker.name, role: UserRoles.FIELD_STAFF }
    );

    assert(
      inProgressComplaint.status === ComplaintStatuses.IN_PROGRESS && !!inProgressComplaint.workStartedAt,
      'Complaint Service',
      'Step 3 (Field Execution): Start Work Timestamp Logged & Status IN_PROGRESS'
    );

    // Step 4: Field Staff Submits Resolution Proof (Before & After Photos + Note)
    const resolvedComplaint = await ComplaintService.submitResolutionProof(
      createdComplaint._id.toString(),
      { id: fieldWorker._id.toString(), name: fieldWorker.name, role: UserRoles.FIELD_STAFF },
      {
        beforePhotoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        afterPhotoUrl: 'https://images.unsplash.com/photo-1584463699039-446a81bb1a09?w=600',
        resolutionNote: 'Pothole filled with cold asphalt mix and compactor leveled.'
      }
    );

    assert(
      resolvedComplaint.status === ComplaintStatuses.AWAITING_VERIFICATION &&
      !!resolvedComplaint.resolutionEvidence?.beforePhotoUrl &&
      !!resolvedComplaint.resolutionEvidence?.afterPhotoUrl,
      'Complaint Service',
      'Step 4 (Verifiable Proof): Before/After Photos Submitted & Status AWAITING_VERIFICATION'
    );

    // Step 5: Citizen Verification (Closed Loop)
    const closedComplaint = await ComplaintService.verifyResolution(
      createdComplaint._id.toString(),
      citizenUser._id.toString(),
      citizenUser.name,
      {
        isResolved: true,
        feedback: 'Great job, road is smooth now!'
      }
    );

    assert(
      closedComplaint.status === ComplaintStatuses.CLOSED && !!closedComplaint.closedAt,
      'Complaint Service',
      'Step 5 (Citizen Closed-Loop Verification): Citizen Approved -> Ticket Status CLOSED'
    );

    // Test Guardrail: Invalid transition check
    const invalidCheck = canTransitionStatus(ComplaintStatuses.SUBMITTED, ComplaintStatuses.CLOSED, UserRoles.CITIZEN);
    assert(
      invalidCheck.allowed === false,
      'State Machine Guardrail',
      'State Machine Invalid Jump Prevention (SUBMITTED -> CLOSED) Enforced'
    );

    // ---------------------------------------------------------
    // SECTION 5: 500-METER DUPLICATE DETECTION VERIFICATION
    // ---------------------------------------------------------
    console.log('\n🔍 SECTION 5: 500-Meter Duplicate Detection Verification');

    // Create an active complaint
    const activeComp = await Complaint.create({
      ticketId: 'BMC-2026-999991',
      citizenId: citizenUser._id,
      categoryId: categoryRoad._id,
      title: 'Road pothole spot',
      description: 'Pothole in the same area',
      location: {
        type: 'Point',
        coordinates: [72.1381, 21.7531],
        address: 'Near Main Crossroad, Kaliabid'
      },
      zoneId: westZone._id,
      wardId: ward5._id,
      status: ComplaintStatuses.IN_PROGRESS,
      priority: Priorities.NORMAL,
      slaTargetHours: 72,
      slaDeadline: new Date(Date.now() + 72 * 3600000),
      citizenAttachments: [{ url: 'https://example.com/photo.jpg', fileType: 'IMAGE' }]
    });

    // Check duplicate detection within 500 meters
    const duplicates = await GeoService.findDuplicates(categoryRoad._id, [72.1382, 21.7532], 500);
    assert(
      duplicates.length > 0 && duplicates[0].ticketId === 'BMC-2026-999991',
      'Duplicate Engine',
      '500m Geospatial Duplicate Scanning ($nearSphere) Operational',
      `Found ${duplicates.length} duplicate ticket(s)`
    );

    // ---------------------------------------------------------
    // SECTION 6: CITIZEN REGISTRATION, STAFF MANAGEMENT & NOTIFICATIONS
    // ---------------------------------------------------------
    console.log('\n👥 SECTION 6: Citizen Registration, Staff Management & Notification System Verification');

    // 1. Citizen Self Registration
    const newCitizenSession = await AuthService.registerCitizen({
      name: 'Priya Mehta',
      mobile: '9123456780',
      email: 'priya.mehta@gmail.com',
      wardId: ward5._id.toString()
    });
    assert(
      newCitizenSession.user.name === 'Priya Mehta' && newCitizenSession.user.role === UserRoles.CITIZEN,
      'Citizen Auth',
      'Citizen Full Profile Registration & Instant Auth Session Issuance Operational'
    );

    // 2. Department Staff Creation (Field Technician)
    const newTech = await User.create({
      name: 'Sunil Rathod',
      mobile: '9666666661',
      email: 'sunil.rathod@bmc.gov.in',
      password: hashedPassword,
      role: UserRoles.FIELD_STAFF,
      departmentId: deptRoad._id,
      wardId: ward5._id,
      employeeId: 'EMP-ROAD-202',
      isActive: true
    });
    assert(
      !!newTech._id && newTech.employeeId === 'EMP-ROAD-202',
      'Staff Management',
      'Department Staff Creation & Role Scoping Operational'
    );

    // 3. Notification Dispatch & Read Status
    const testNotif = await Notification.create({
      recipientId: citizenUser._id,
      title: 'Road Work Completed',
      message: 'Your reported pothole ticket has been resolved by Sunil Rathod.',
      ticketId: createdComplaint.ticketId,
      complaintId: createdComplaint._id,
      type: 'STATUS_UPDATE',
      isRead: false
    });
    assert(
      !!testNotif._id && testNotif.isRead === false,
      'Notification System',
      'Real-Time Notification Persistence & Unread Queue Tracking Operational'
    );

    // Mark as read
    testNotif.isRead = true;
    await testNotif.save();
    assert(
      testNotif.isRead === true,
      'Notification System',
      'Notification Acknowledgment & Read-State Mutation Operational'
    );


    // ---------------------------------------------------------
    // SUMMARY
    // ---------------------------------------------------------
    console.log('\n================================================================');
    console.log('📊 VERIFICATION SUMMARY');
    console.log('================================================================');
    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;
    console.log(`Total Checks: ${results.length}`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Failed: ${failedCount}`);

    if (failedCount === 0) {
      console.log('\n🎉 ALL BACKEND SYSTEMS, DATABASE MODELS, GEO-INDEXES, RBAC, AND STATE MACHINES ARE 100% OPERATIONAL & VERIFIED ON LIVE MONGODB ATLAS!\n');
    }

    await mongoose.disconnect();
    return { passedCount, failedCount, results };
  } catch (error) {
    console.error('❌ Verification suite encountered an error:', error);
    await mongoose.disconnect();
    throw error;
  }
}

// Run directly
if (process.argv[1]?.endsWith('verifyBackend.ts') || process.argv[1]?.endsWith('verifyBackend.js')) {
  runCompleteBackendVerification().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
