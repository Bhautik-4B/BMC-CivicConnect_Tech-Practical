export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface CityAnalyticsSummary {
  totalComplaints: number;
  newToday: number;
  inProgress: number;
  resolved: number;
  overdue: number;
  reopened: number;
  resolutionRate: number; // percentage e.g. 88.5
  slaComplianceRate: number; // percentage e.g. 92.4
  categoryBreakdown: Array<{
    categoryName: string;
    count: number;
  }>;
  wardBreakdown: Array<{
    wardNumber: number;
    wardName: string;
    count: number;
  }>;
  departmentPerformance: Array<{
    departmentName: string;
    total: number;
    resolved: number;
    complianceRate: number;
  }>;
}
