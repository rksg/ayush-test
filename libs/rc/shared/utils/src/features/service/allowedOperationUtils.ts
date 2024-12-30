import { alarmList } from './../../../../components/src/EdgeInfoWidget/__tests__/fixtures';
import { RbacOpsIds }     from '@acx-ui/types'
import { getUserProfile, hasAllowedOperations } from '@acx-ui/user'

import { useConfigTemplate } from '../../configTemplate'
import { ServiceType }       from '../../constants'
import { PolicyType }        from '../../types'
import { PolicyOperation }   from '../policy'

import { AllowedOperationMap, policyAllowedOperationMap, serviceAllowedOperationMap } from './allowedOperationContentMap'
import { SvcPcyAllowedOper, SvcPcyAllowedType }                                       from './servicePolicyAbacContentsMap'
import { ServiceOperation }                                                           from './serviceRouteUtils'

const getAllowedOperation = <T extends SvcPcyAllowedType, O extends SvcPcyAllowedOper>(
  { map, type, oper, isTemplate = false }:
  { map: AllowedOperationMap<T, O>, type: T, oper: O, isTemplate?: boolean }
) => {
  return applyTemplateIfNeeded(map[type]?.[oper], isTemplate)
}

export const applyTemplateIfNeeded = (
  allowedOperation: RbacOpsIds | undefined, isTemplate: boolean
): RbacOpsIds | undefined => {
  if (!isTemplate) return allowedOperation

  return allowedOperation?.map(item => {
    if (typeof item === 'string') {
      return item.replace(':/', ':/templates/')
    } else if (Array.isArray(item)) {
      return item.map(str => str.replace(':/', ':/templates/'))
    }
    return item
  })

}

export const getServiceAllowedOperation = (
  type: ServiceType, oper: ServiceOperation, isTemplate?: boolean
): RbacOpsIds | undefined => {
  return getAllowedOperation({ map: serviceAllowedOperationMap, type, oper, isTemplate })
}

// eslint-disable-next-line max-len
export const useTemplateAwareServiceAllowedOperation = (type: ServiceType, oper: ServiceOperation) => {
  const { isTemplate } = useConfigTemplate()
  return getServiceAllowedOperation(type, oper, isTemplate)
}

export const hasSomeServicesPermission = (oper: ServiceOperation) => {
  const allServices = Object.keys(serviceAllowedOperationMap)
  return allServices.some(service => {
    const allowedOperations = getServiceAllowedOperation(service as ServiceType, oper)
    return allowedOperations ? hasAllowedOperations(allowedOperations) : false
  })
}

export const getPolicyAllowedOperation = (
  type: PolicyType, oper: PolicyOperation, isTemplate?: boolean
): RbacOpsIds | undefined => {
  return getAllowedOperation({ map: policyAllowedOperationMap, type, oper, isTemplate })
}

// eslint-disable-next-line max-len
export const useTemplateAwarePolicyAllowedOperation = (type: PolicyType, oper: PolicyOperation) => {
  const { isTemplate } = useConfigTemplate()
  return getPolicyAllowedOperation(type, oper, isTemplate)
}
