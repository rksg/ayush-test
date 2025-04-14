export enum EthernetPortType {
    ACCESS = 'ACCESS',
    TRUNK = 'TRUNK',
    SELECTIVE_TRUNK = 'SELECTIVE_TRUNK'
}

export enum EthernetPortAuthType {
    DISABLED= 'DISABLED',
    SUPPLICANT= 'SUPPLICANT',
    PORT_BASED= 'PORT_BASED_AUTHENTICATOR',
    MAC_BASED= 'MAC_BASED_AUTHENTICATOR',
    OPEN= 'OPEN'
}

export enum EthernetPortSupplicantType {
    DISABLED= 'DISABLED',
    MAC_AUTH= 'MAC_AUTH',
    CUSTOM= 'CUSTOM'
}