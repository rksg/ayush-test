import { RbacOpsIds }           from '@acx-ui/types'
import { hasAllowedOperations } from '@acx-ui/user'
import { ApiInfo, getOpsApi }   from '@acx-ui/utils'

import { useConfigTemplate }             from '../../configTemplate'
import { ServiceType, ServiceOperation } from '../../constants'
import { PolicyType, PolicyOperation }   from '../../types'

import { AllowedOperationMap, policyAllowedOperationMap, serviceAllowedOperationMap } from './allowedOperationContentMap'
import { SvcPcyAllowedOper, SvcPcyAllowedType }                                       from './servicePolicyAbacContentsMap'

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

export const getPolicyAllowedOperation = (
  type: PolicyType, oper: PolicyOperation, isTemplate?: boolean
): RbacOpsIds | undefined => {
  return getAllowedOperation({ map: policyAllowedOperationMap, type, oper, isTemplate })
}

// eslint-disable-next-line max-len
export const useTemplateAwareServiceAllowedOperation = (type: ServiceType, oper: ServiceOperation) => {
  const { isTemplate } = useConfigTemplate()
  return getServiceAllowedOperation(type, oper, isTemplate)
}

// eslint-disable-next-line max-len
export const useTemplateAwarePolicyAllowedOperation = (type: PolicyType, oper: PolicyOperation) => {
  const { isTemplate } = useConfigTemplate()
  return getPolicyAllowedOperation(type, oper, isTemplate)
}

export const hasSomeServicesPermission = (oper: ServiceOperation) => {
  return hasSomeProfilesPermission(serviceAllowedOperationMap, oper, getServiceAllowedOperation)
}

export const hasSomePoliciesPermission = (oper: PolicyOperation) => {
  return hasSomeProfilesPermission(policyAllowedOperationMap, oper, getPolicyAllowedOperation)
}

export const hasSomeProfilesPermission = <T extends SvcPcyAllowedType, O extends SvcPcyAllowedOper>(
  map: AllowedOperationMap<T, O>,
  oper: O,
  getProfileAllowdOperation: (type: T, oper: O, isTemplate?: boolean) => RbacOpsIds | undefined
) => {
  const allProfiles = Object.keys(map)
  return allProfiles.some(profile => {
    const allowedOperations = getProfileAllowdOperation(profile as T, oper)
    return allowedOperations ? hasAllowedOperations(allowedOperations) : false
  })
}


interface useActivationPermissionProps {
  activateApiInfo: ApiInfo
  activateTemplateApiInfo: ApiInfo
  deactivateApiInfo: ApiInfo
  deactivateTemplateApiInfo: ApiInfo
}
export const useActivativationPermission = (props: useActivationPermissionProps) => {
  const {
    activateApiInfo,
    activateTemplateApiInfo,
    deactivateApiInfo,
    deactivateTemplateApiInfo
  } = props
  const { isTemplate } = useConfigTemplate()

  const activateOpsApi = getOpsApi(isTemplate ? activateTemplateApiInfo : activateApiInfo)

  const deactivateOpsApi = getOpsApi(isTemplate ? deactivateTemplateApiInfo : deactivateApiInfo)

  return {
    activateOpsApi,
    deactivateOpsApi,
    hasFullActivationPermission: hasAllowedOperations([[ activateOpsApi, deactivateOpsApi]])
  }
}
