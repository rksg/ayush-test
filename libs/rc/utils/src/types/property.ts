
export enum PropertyManagerRoleEnum {
  PrimeAdministrator = 'Prime Administrator',
  Administrator = 'Administrator',
  PropertyManager = 'Property Manager'
}
//PrimeAdministrator = 'Prime Administrator',
//   Administrator = 'Administrator',
//   'PropertyManager' = 'Property Manager'

export interface PropertyManager {
  name: string,
  role: PropertyManagerRoleEnum,
  email: string,
  phone: string
}

export interface PropertyUnit {
  name: string,
  vlan: number,
  residentName?: string,
  residentEmail?: string,
  residentPhone?: string
}
