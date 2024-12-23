import { ServiceType }     from '../../constants'
import { PolicyType }      from '../../types'
import { PolicyOperation } from '../policy'

import { SvcPcyAllowedOper, SvcPcyAllowedType } from './servicePolicyAbacContentsMap'
import { ServiceOperation }                     from './serviceRouteUtils'

// eslint-disable-next-line max-len
export type AllowedOperationMap<T extends SvcPcyAllowedType, O extends SvcPcyAllowedOper> = Partial<Record<T, Partial<Record<O, string>>>>

export const serviceAllowedOperationMap: AllowedOperationMap<ServiceType, ServiceOperation> = {
  [ServiceType.WIFI_CALLING]: {
    [ServiceOperation.CREATE]: 'POST:/wifiCallingServiceProfiles',
    [ServiceOperation.EDIT]: 'PUT:/wifiCallingServiceProfiles/{serviceId}',
    [ServiceOperation.DELETE]: 'DELETE:/wifiCallingServiceProfiles/{serviceId}'
  }
}

export const policyAllowedOperationMap: AllowedOperationMap<PolicyType, PolicyOperation> = {
  [PolicyType.AAA]: {
    [PolicyOperation.CREATE]: 'POST:/radiusServerProfiles',
    [PolicyOperation.EDIT]: 'PUT:/radiusServerProfiles/{policyId}',
    [PolicyOperation.DELETE]: 'DELETE:/radiusServerProfiles/{policyId}'
  }
}
