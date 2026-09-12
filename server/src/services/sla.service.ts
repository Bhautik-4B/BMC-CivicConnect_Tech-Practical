import cron from 'node-cron';
import { Complaint } from '../models/Complaint.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { ComplaintStatuses } from '@bmc/shared';
import { getSocketIO } from '../sockets/socket.js';
import { logger } from '../utils/logger.js';

export class SlaService {
  /**
   * Starts periodic cron job (every 2 minutes) for SLA monitoring & auto-escalation
   */
  public static startSlaMonitor(): void {
    logger.info('⏰ SLA & Escalation Engine initialized');

    cron.schedule('*/2 * * * *', async () => {
      try {
        const now = new Date();

        // 1. Find overdue complaints not yet marked as breached
        const breachedTickets = await Complaint.find({
          status: {
            $in: [
              ComplaintStatuses.SUBMITTED,
              ComplaintStatuses.UNDER_REVIEW,
              ComplaintStatuses.ASSIGNED,
              ComplaintStatuses.IN_PROGRESS
            ]
          },
          slaDeadline: { $lte: now },
          slaBreached: false
        }).populate('assignedDepartmentId assignedSupervisorId assignedFieldStaffId');

        for (const ticket of breachedTickets) {
          ticket.slaBreached = true;
          await ticket.save();

          logger.warn(`⚠️ SLA Breached for ticket: ${ticket.ticketId}`);

          // Create notification for supervisor / dept
          if (ticket.assignedSupervisorId) {
            await Notification.create({
              recipientId: ticket.assignedSupervisorId,
              title: `🚨 SLA Breach Alert: ${ticket.ticketId}`,
              message: `Complaint ${ticket.ticketId} has passed its resolution deadline. Immediate escalation required.`,
              ticketId: ticket.ticketId,
              complaintId: ticket._id,
              type: 'SLA_WARNING'
            });
          }

          const io = getSocketIO();
          if (io) {
            io.emit('ticket:sla_warning', {
              ticketId: ticket.ticketId,
              slaDeadline: ticket.slaDeadline,
              slaBreached: true
            });
          }
        }
      } catch (error) {
        logger.error('Error running SLA monitor cron:', error);
      }
    });
  }
}
