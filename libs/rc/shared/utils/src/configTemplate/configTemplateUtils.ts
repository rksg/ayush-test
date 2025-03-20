import { TypedUseMutation, TypedUseLazyQuery } from '@reduxjs/toolkit/query/react'

import { Features, useIsSplitOn }                         from '@acx-ui/feature-toggle'
import { Params, TenantType, useParams }                  from '@acx-ui/react-router-dom'
import { RequestPayload, RolesEnum, UseQuery }            from '@acx-ui/types'
import { getUserProfile, hasAllowedOperations, hasRoles } from '@acx-ui/user'
import { AccountType, getIntl, getOpsApi }                from '@acx-ui/utils'

import { hasPolicyPermission, hasServicePermission } from '../features'
import { ConfigTemplateType }                        from '../types'
import { ConfigTemplateUrlsInfo }                    from '../urls'

import { CONFIG_TEMPLATE_LIST_PATH }                                          from './configTemplateRouteUtils'
import {
  configTemplateApGroupOperationMap,
  configTemplateNetworkOperationMap, ConfigTemplateOperation, configTemplatePolicyOperationMap,
  configTemplatePolicyTypeMap, configTemplateServiceOperationMap, configTemplateServiceTypeMap,
  configTemplateSwitchProfileOperationMap, configTemplateVenueOperationMap
} from './contentsMap'
import { useConfigTemplate } from './useConfigTemplate'

// eslint-disable-next-line max-len
export function generateConfigTemplateBreadcrumb (): { text: string, link?: string, tenantType?: TenantType }[] {
  const { $t } = getIntl()

  return [
    {
      text: $t({ defaultMessage: 'Configuration Templates' }),
      link: CONFIG_TEMPLATE_LIST_PATH,
      tenantType: 'v'
    }
  ]
}

// eslint-disable-next-line max-len
export function hasConfigTemplateAccess (featureFlagEnabled: boolean, accountType: string): boolean {
  const hasPermission = getUserProfile().rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(ConfigTemplateUrlsInfo.getConfigTemplatesRbac)])
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  return featureFlagEnabled
    && hasPermission
    && (accountType === AccountType.MSP || accountType === AccountType.MSP_NON_VAR)
}

export interface UseConfigTemplateQueryFnSwitcherProps<ResultType, Payload = unknown> {
  useQueryFn: UseQuery<ResultType, RequestPayload<Payload>>
  useTemplateQueryFn: UseQuery<ResultType, RequestPayload<Payload>>
  skip?: boolean
  payload?: Payload
  extraParams?: Params<string>
  templatePayload?: Payload
  enableRbac?: boolean
  extraQueryArgs?: {}
}
export function useConfigTemplateQueryFnSwitcher<ResultType, Payload = unknown> (
  props: UseConfigTemplateQueryFnSwitcherProps<ResultType, Payload>
): ReturnType<typeof useQueryFn> {
  const {
    useQueryFn, useTemplateQueryFn, skip = false, payload, templatePayload,
    extraParams, enableRbac, extraQueryArgs = {}
  } = props

  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const resolvedPayload = isTemplate && templatePayload ? templatePayload : payload
  const resolvedEnableRbac = isTemplate ? enableTemplateRbac : enableRbac
  const requestPayload = {
    params: { ...params, ...(extraParams ?? {}) },
    ...(resolvedPayload ? ({ payload: resolvedPayload }) : {}),
    ...(resolvedEnableRbac ? ({ enableRbac: resolvedEnableRbac }) : {}),
    ...extraQueryArgs
  }
  const result = useQueryFn(requestPayload, { skip: skip || isTemplate })
  const templateResult = useTemplateQueryFn(requestPayload, { skip: skip || !isTemplate })

  return isTemplate ? templateResult : result
}

interface UseConfigTemplateLazyQueryFnSwitcherProps<ResultType> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useLazyQueryFn: TypedUseLazyQuery<ResultType, any, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useLazyTemplateQueryFn: TypedUseLazyQuery<ResultType, any, any>
}
export function useConfigTemplateLazyQueryFnSwitcher<ResultType> (
  props: UseConfigTemplateLazyQueryFnSwitcherProps<ResultType>
): ReturnType<typeof useLazyQueryFn> {
  const { useLazyQueryFn, useLazyTemplateQueryFn } = props
  const { isTemplate } = useConfigTemplate()
  const result = useLazyQueryFn()
  const templateResult = useLazyTemplateQueryFn()

  return isTemplate ? templateResult : result
}

interface UseConfigTemplateMutationFnSwitcherProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMutationFn: TypedUseMutation<any, any, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useTemplateMutationFn: TypedUseMutation<any, any, any>
}
export function useConfigTemplateMutationFnSwitcher (
  props: UseConfigTemplateMutationFnSwitcherProps
): ReturnType<typeof useMutationFn> {
  const { useMutationFn, useTemplateMutationFn } = props
  const { isTemplate } = useConfigTemplate()
  const result = useMutationFn()
  const templateResult = useTemplateMutationFn()

  return isTemplate ? templateResult : result
}

// eslint-disable-next-line max-len
export function hasConfigTemplateAllowedOperation (type: ConfigTemplateType, oper: ConfigTemplateOperation): boolean {
  const policyType = configTemplatePolicyTypeMap[type]
  const serviceType = configTemplateServiceTypeMap[type]

  if (policyType) {
    return hasPolicyPermission({
      type: policyType,
      oper: configTemplatePolicyOperationMap[oper],
      isTemplate: true
    })
  } else if (serviceType) {
    return hasServicePermission({
      type: serviceType,
      oper: configTemplateServiceOperationMap[oper],
      isTemplate: true
    })
  } else if (type === ConfigTemplateType.NETWORK) {
    return hasAllowedOperations([getOpsApi(configTemplateNetworkOperationMap[oper])])
  } else if (type === ConfigTemplateType.VENUE) {
    return hasAllowedOperations([getOpsApi(configTemplateVenueOperationMap[oper])])
  } else if (type === ConfigTemplateType.SWITCH_REGULAR || type === ConfigTemplateType.SWITCH_CLI) {
    return hasAllowedOperations([getOpsApi(configTemplateSwitchProfileOperationMap[oper])])
  } else if (type === ConfigTemplateType.AP_GROUP) {
    return hasAllowedOperations([getOpsApi(configTemplateApGroupOperationMap[oper])])
  }

  return false
}
