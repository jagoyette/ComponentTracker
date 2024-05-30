import { ServiceInterval } from "./service-interval";

export class ComponentModel {
    id: string | undefined;
    userId: string | undefined;
    category: string | undefined;
    name: string | undefined;

    description: string | undefined;
    manufacturer: string | undefined;
    model: string | undefined;
    isInstalled: boolean | undefined;
    installDate: Date | undefined;
    uninstallDate: Date | undefined;
    serviceIntervals: ServiceInterval[] | undefined;

    totalRides: Number = 0;
    totalDistance: Number = 0;
    totalTime: Number = 0;
}