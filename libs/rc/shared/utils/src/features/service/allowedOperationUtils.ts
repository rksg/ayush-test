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
  { map, type, oper, isTemplate = false }:
  { map: AllowedOperationMap<T, O>, type: T, oper: O, isTemplate?: boolean }
) => {
  return applyTemplateIfNeeded(map[type]?.[oper], isTemplate)
}

// eslint-disable-next-line max-len
export const applyTemplateIfNeeded = (allowedOperation: string | undefined, isTemplate: boolean) => {
  return isTemplate
    ? allowedOperation?.replace(':/', ':/templates/')
    : allowedOperation
}

export const getServiceAllowedOperation = (
  type: ServiceType, oper: ServiceOperation, isTemplate?: boolean
): string | undefined => {
  return getAllowedOperation({ map: serviceAllowedOperationMap, type, oper, isTemplate })
}

// eslint-disable-next-line max-len
export const useTemplateAwareServiceAllowedOperation = (type: ServiceType, oper: ServiceOperation) => {
  const { isTemplate } = useConfigTemplate()
  return getServiceAllowedOperation(type, oper, isTemplate)
}

export const getPolicyAllowedOperation = (
  type: PolicyType, oper: PolicyOperation, isTemplate?: boolean
): string | undefined => {
  return getAllowedOperation({ map: policyAllowedOperationMap, type, oper, isTemplate })
}

// eslint-disable-next-line max-len
export const useTemplateAwarePolicyAllowedOperation = (type: PolicyType, oper: PolicyOperation) => {
  const { isTemplate } = useConfigTemplate()
  return getPolicyAllowedOperation(type, oper, isTemplate)
}
