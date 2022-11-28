
export interface Guest {
    id: string
    userState: string
    guestType: string
    networkId: string
    expiration: string
    mobilePhoneNumber: string
    emailAddress: string
    notes: string
    maxDevices: number
    deliveryMethods: DelieverType[]
    expiryDate?: string
    passDurationHours?: number
    ssid?: string
    name?: string
    maxNumberOfClients?: number,
    guestStatus: GuestStatusEnum
}

export interface GuestExpiration {
    activationType: string;
    duration: number;
    unit: string;
}

export type DelieverType = 'PRINT' | 'SMS' | 'MAIL';

export enum GuestTypesEnum {
  MANAGED = 'GuestPass',
  SELF_SIGN_IN = 'SelfSign',
  HOST_GUEST = 'HostGuest'
}

export enum GuestStatusEnum {
  OFFLINE = 'Offline',
  EXPIRED = 'Expired',
  NOT_APPLICABLE = 'Not Applicable',
  ONLINE = 'Online',
  DISABLED = 'Disabled'
}
