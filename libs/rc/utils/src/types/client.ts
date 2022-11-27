
export interface Guest {
    id: string
    userState: string
    guestUserType: string
    networkId: string
    expiration: GuestExpiration
    mobilePhoneNumber: string
    email: string
    notes: string
    maxDevices: number
    deliveryMethods: DelieverType[],
    expiryDate?: string,
    passDurationHours?: number
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
  