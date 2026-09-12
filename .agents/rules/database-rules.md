---
name: database-rules
description: Defines MongoDB, Mongoose, indexing, geospatial queries, and transaction rules for the civic management platform.
---

# Database & Mongoose Engineering Rules

## 1. Indexing Strategy
To guarantee fast query times across millions of tickets, every collection must implement index standards:

### 1.1 `Complaints` Collection Indexes
```typescript
// Fast ticket lookup
ComplaintSchema.index({ ticketId: 1 }, { unique: true });

// Citizen dashboard query
ComplaintSchema.index({ citizenId: 1, createdAt: -1 });

// Department queue filtering
ComplaintSchema.index({ assignedDepartmentId: 1, status: 1, priority: 1 });

// Field staff task list
ComplaintSchema.index({ assignedFieldStaffId: 1, status: 1 });

// GIS & Duplicate detection queries (CRITICAL)
ComplaintSchema.index({ 'location.coordinates': '2dsphere' });

// SLA monitoring cron
ComplaintSchema.index({ status: 1, slaDeadline: 1, slaBreached: 1 });

// Ward-level analytics
ComplaintSchema.index({ wardId: 1, categoryId: 1, status: 1 });
```

### 1.2 `Wards` Collection Indexes
```typescript
// Spatial polygon matching for automated ward detection
WardSchema.index({ boundaryPolygon: '2dsphere' });
WardSchema.index({ wardNumber: 1, zoneId: 1 }, { unique: true });
```

---

## 2. Geospatial Query Standards

### 2.1 GeoJSON Point Standard
All coordinates in MongoDB MUST be stored in `[Longitude, Latitude]` format (note longitude first in GeoJSON):
```typescript
location: {
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true } // [lng, lat]
}
```

### 2.2 Finding Point within Ward Polygon
```typescript
const ward = await Ward.findOne({
  boundaryPolygon: {
    $geoIntersects: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    }
  }
});
```

---

## 3. Data Integrity & Transactions
- **Multi-document writes**: Status changes that trigger an `AuditLog` creation and `Notification` insertion MUST be wrapped in a Mongoose session transaction where replica sets are active.
- **Optimistic Concurrency**: Use Mongoose timestamps (`timestamps: true`) and version keys (`__v` or explicit version fields) to detect conflicting writes on complaint reassignment.
- **Soft Delete / Archival**: Never hard-delete complaints. Use `isDeleted: boolean` or `status: 'REJECTED'/'CLOSED'`.
