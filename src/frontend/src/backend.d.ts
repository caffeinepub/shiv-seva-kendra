import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ShivSevaKendra {
    name: string;
    email: string;
    address: string;
    phone: string;
}
export type AddJobResult = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export interface AdminJob {
    id: bigint;
    title: string;
    salary: string;
    notifDate: string;
    vacancy: string;
    fees: string;
    createdAt: bigint;
    lastDate: string;
}
export type AddServiceResult = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export interface SubServiceItem {
    nameEn: string;
    nameMr: string;
}
export interface Appointment {
    id: bigint;
    customerName: string;
    createdAt: bigint;
    mobileNumber: string;
    preferredTime?: string;
}
export interface AdminService {
    id: bigint;
    subServices: Array<SubServiceItem>;
    mainNameEn: string;
    mainNameMr: string;
}
export interface backendInterface {
    addJob(title: string, notifDate: string, vacancy: string, salary: string, lastDate: string, fees: string): Promise<AddJobResult>;
    addService(mainNameEn: string, mainNameMr: string, subServices: Array<SubServiceItem>): Promise<AddServiceResult>;
    bookAppointment(customerName: string, mobileNumber: string, preferredTime: string | null): Promise<bigint>;
    deleteJob(id: bigint): Promise<boolean>;
    deleteService(id: bigint): Promise<boolean>;
    getAdminJobs(): Promise<Array<AdminJob>>;
    getAdminPrincipal(): Promise<Principal | null>;
    getAdminServices(): Promise<Array<AdminService>>;
    getAppointments(): Promise<Array<Appointment>>;
    getShivSevaKendraInfo(): Promise<ShivSevaKendra>;
    setAdmin(): Promise<boolean>;
}
