import {
  EntitlementDeviceType,
  EntitlementDeviceSubType,
  LicenseBannerTypeEnum
} from './msp'


export interface LicenseEntitlement {
  id: string;
  deviceType: EntitlementDeviceType;
  deviceSubType: EntitlementDeviceSubType;
  sku: string;
  quantity: number;
  createdDate: string;
  effectiveDate: string;
  expirationDate: string;
  graceEndDate: string;
}

export interface EntitlementBanner {
  deviceCount: number;
  deviceType: EntitlementDeviceType;
  effectDate: string;
  effectDays: number;
  multipleLicense: boolean;
  type: LicenseBannerTypeEnum;
}

export interface EntitlementActivations {
  orderId: string,
  salesOrderId: string,
  productName: string,
  productCode: string,
  productId: string,
  quantity: 100,
  registeredQuantity: number,
  remainingQuantity: number,
  spaStartDate: string,
  spaEndDate: string,
  productCategory: string,
  productClass: string,
  orderSoNumber: string,
  orderCreateDate: string,
  orderRegistrationCode: string,
  orderAcxRegistrationCode:string
}
