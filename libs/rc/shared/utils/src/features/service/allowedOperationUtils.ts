import { useConfigTemplate } from '../../configTemplate'
import { ServiceType }       from '../../constants'
import { PolicyType }        from '../../types'
import { PolicyOperation }   from '../policy'

import { AllowedOperationMap, policyAllowedOperationMap, serviceAllowedOperationMap } from './allowedOperationContentMap'
import { SvcPcyAllowedOper, SvcPcyAllowedType }                                       from './servicePolicyAbacContentsMap'
import { ServiceOperation }                                                           from './serviceRouteUtils'

// TODO: Implement isAllowedOperationCheckEnabled
export const isAllowedOperationCheckEnabled = () => {
  // const userProfile = getUserProfile()
  // return userProfile.allowedOperationCheckEnabled
  return true
}

const getAllowedOperation = <T extends SvcPcyAllowedType, O extends SvcPcyAllowedOper>(
  map: AllowedOperationMap<T, O>,
  type: T,
  oper: O
) => {
  return map[type]?.[oper]
}

export const useAllowedOperation = <T extends SvcPcyAllowedType, O extends SvcPcyAllowedOper>(
  map: AllowedOperationMap<T, O>,
  type: T,
  oper: O
) => {
  const { isTemplate } = useConfigTemplate()
  const allowedOperation = getAllowedOperation(map, type, oper)

  return applyTemplateIfNeeded(allowedOperation, isTemplate)
}

// eslint-disable-next-line max-len
export const applyTemplateIfNeeded = (allowedOperation: string | undefined, isTemplate: boolean) => {
  return isTemplate
    ? allowedOperation?.replace(':/', ':/templates/')
    : allowedOperation
}

// eslint-disable-next-line max-len
export const getServiceAllowedOperation = (type: ServiceType, oper: ServiceOperation): string | undefined => {
  return getAllowedOperation(serviceAllowedOperationMap, type, oper)
}

export const useServiceAllowedOperation = (type: ServiceType, oper: ServiceOperation) => {
  return useAllowedOperation(serviceAllowedOperationMap, type, oper)
}

// eslint-disable-next-line max-len
export const getPolicyAllowedOperation = (type: PolicyType, oper: PolicyOperation): string | undefined => {
  return getAllowedOperation(policyAllowedOperationMap, type, oper)
}

export const usePolicyAllowedOperation = (type: PolicyType, oper: PolicyOperation) => {
  return useAllowedOperation(policyAllowedOperationMap, type, oper)
}
