import { z } from 'zod';
import { Priorities } from '../constants/priorities.js';

export const CreateComplaintSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  location: z.object({
    coordinates: z.tuple([
      z.number().min(-180).max(180), // Longitude
      z.number().min(-90).max(90)    // Latitude
    ]),
    address: z.string().min(3, 'Address is required'),
    landmark: z.string().optional()
  }),
  wardId: z.string().optional(),
  priority: z.enum([Priorities.NORMAL, Priorities.HIGH, Priorities.EMERGENCY]).default(Priorities.NORMAL),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        fileType: z.enum(['IMAGE', 'VIDEO'])
      })
    )
    .min(1, 'At least one photo evidence is required for reporting')
});

export type CreateComplaintInput = z.infer<typeof CreateComplaintSchema>;

export const AssignComplaintSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required'),
  supervisorId: z.string().optional(),
  fieldStaffId: z.string().optional(),
  priority: z.enum([Priorities.NORMAL, Priorities.HIGH, Priorities.EMERGENCY]).optional(),
  notes: z.string().optional()
});

export type AssignComplaintInput = z.infer<typeof AssignComplaintSchema>;

export const SubmitResolutionSchema = z.object({
  beforePhotoUrl: z.string().url('Before photo URL is required'),
  afterPhotoUrl: z.string().url('After photo URL is required'),
  resolutionNote: z.string().min(10, 'Resolution note must be at least 10 characters')
});

export type SubmitResolutionInput = z.infer<typeof SubmitResolutionSchema>;

export const VerifyResolutionSchema = z.object({
  isResolved: z.boolean(),
  reopenReason: z.string().optional(),
  reopenPhotoUrl: z.string().url().optional(),
  rating: z.number().min(1).max(5).optional(),
  feedback: z.string().optional()
});

export type VerifyResolutionInput = z.infer<typeof VerifyResolutionSchema>;
