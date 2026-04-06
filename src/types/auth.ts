export type UserRole = 'admin' | 'tutor' | 'student';

export interface Profile {
    id: string;
    name: string;
    role: UserRole;
    email: string;
    created_at: string;
    updated_at: string;
    avatar_url: string;
}

export enum EventStatus {
    ALL = 'all',
    AVAILABLE = 'available',
    BOOKED = 'booked',
    CANCELED = 'canceled',
    PENDING = 'pending'
}

export enum Role {
    ALL = 'all',
    STUDENT = 'student',
    ADMIN = 'admin',
    TUTOR = 'tutor',
}

export enum RepositoryStatus {
    ALL = 'all',
    SUBMITTED = 'submitted',
    REVIEWED = 'reviewed',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export interface CareerProps {
    id: string,
    name: string,
    code: string,
    faculty: string,
    duration_semesters: number,
    is_active: boolean,
    created_at: string,
    updated_at: string
}

export interface UserStats {
    scheduledSessions?: number;
    activeStudents?: number;
    weeklyHours?: number;
    upcomingSessions?: number;
    completedSessions?: number;
    pendingSubmissions?: number;
}

export interface UserFormData {
    email: string;
    name: string;
    role: UserRole;
    password: string;
    career_id?: string;
}

export interface DashboardStats {
    totalUsers: number;
    totalStudents: number;
    totalTutors: number;
    totalAdmins: number;
    totalCareers: number;
    totalSessions: number;
    upcomingSessions: number;
    completedSessions: number;
    totalSubmissions: number;
    pendingReviews: number;
    activeEnrollments: number;
}

export interface CareerFormData {
    name: string;
    code: string;
    faculty: string;
    duration_semesters: number;
    is_active: boolean;
}

export interface AddUserFormProps {
    visible: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

export interface Career {
    id: string;
    name: string;
    code: string;
    faculty: string;
}