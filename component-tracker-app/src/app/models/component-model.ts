export class ComponentModel {
    id: string | undefined;
    userId: string | undefined;
    category: string | undefined;
    name: string | undefined;

    description: string | undefined;
    manufacturer: string | undefined;
    model: string | undefined;
    isActive: boolean | undefined;
    installDate: Date | undefined;
    retireDate: Date | undefined;
    history: any[] | undefined;

    totalDistance: Number = 0;
    totalTime: Number = 0;

}