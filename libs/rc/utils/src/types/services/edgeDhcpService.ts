export interface EdgeDhcpSetting {
    id: string;
    serviceName: string;
    dhcpRelay?:boolean;
    externalDhcpServerFqdnIp: string;
    domainName: string;
    primaryDnsIp:string;
    secondaryDnsIp:string;
    leaseTime?: number;
    leaseTimeUnit?: LeaseTimeUnit;
    dhcpPools: EdgeDhcpPool[];
    hosts: EdgeDhcpHost[];
}

export enum LeaseTimeUnit {
    DAYS = 'DAYS',
    HOURS = 'HOURS',
    MINUTES = 'MINUTES'
}

export interface EdgeDhcpPool {
    id: string;
    poolIndex: number;
    poolName: string;
    subnetMask: string;
    poolStartIp: string;
    poolEndIp: string;
    gatewayIp:string;
    activated?: boolean;
}

export interface EdgeDhcpHost {
    id: string;
    hostIndex: number;
    hostName: string;
    mac: string;
    fixedAddress: string;
}