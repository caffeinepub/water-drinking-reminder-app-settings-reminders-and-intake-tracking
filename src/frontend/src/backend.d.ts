import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SleepLog {
    hours: number;
    date: bigint;
}
export interface RunningLog {
    pace: number;
    time: bigint;
    completed: boolean;
    distance: number;
    timestamp: bigint;
}
export interface CustomReminderDefinition {
    name: string;
    description: string;
    intervalInNanos: bigint;
    enabled: boolean;
    lastSent: bigint;
}
export interface HydrationLog {
    date: bigint;
    totalIntake: number;
}
export interface UserData {
    dailyGoal: number;
    cupSize: number;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Custom Reminders System
     */
    addCustomReminder(name: string, description: string, interval: bigint, enabled: boolean): Promise<void>;
    addDailyIntake(amount: number): Promise<void>;
    /**
     * / Sleep Tracking Functions
     */
    addSleepLog(hours: number): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getIntakeHistory(): Promise<Array<HydrationLog>>;
    getRunningHistory(): Promise<Array<RunningLog>>;
    getSleepHistory(): Promise<Array<SleepLog>>;
    getTodaysIntake(): Promise<number>;
    getTodaysRuns(): Promise<Array<RunningLog>>;
    getTodaysSleep(): Promise<number>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserSettings(): Promise<UserData | null>;
    isCallerAdmin(): Promise<boolean>;
    listCustomReminders(): Promise<Array<CustomReminderDefinition>>;
    /**
     * / Running Tracker
     */
    logRun(distance: number, time: bigint, pace: number, completed: boolean): Promise<void>;
    removeCustomReminder(name: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCustomReminder(name: string, description: string, interval: bigint, enabled: boolean): Promise<void>;
    /**
     * / Hydration Tracking Functions
     */
    updateUserSettings(dailyGoal: number, cupSize: number): Promise<void>;
}
