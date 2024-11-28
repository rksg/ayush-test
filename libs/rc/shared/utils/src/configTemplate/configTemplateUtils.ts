import { TypedUseMutation, TypedUseLazyQuery } from '@reduxjs/toolkit/query/react'

import { Features, useIsSplitOn }              from '@acx-ui/feature-toggle'
import { Params, TenantType, useParams }       from '@acx-ui/react-router-dom'
import { RequestPayload, RolesEnum, UseQuery } from '@acx-ui/types'
import { hasRoles }                            from '@acx-ui/user'
import { AccountType, getIntl }                from '@acx-ui/utils'

import { CONFIG_TEMPLATE_LIST_PATH } from './configTemplateRouteUtils'
import { useConfigTemplate }         from './useConfigTemplate'

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
  return featureFlagEnabled
    && hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
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
