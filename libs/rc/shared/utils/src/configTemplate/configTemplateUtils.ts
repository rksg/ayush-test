import { UseLazyQuery, UseMutation }           from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { MutationDefinition, QueryDefinition } from '@reduxjs/toolkit/query'

import { Params, TenantType, useParams }           from '@acx-ui/react-router-dom'
import { RequestPayload, RolesEnum, UseQuery } from '@acx-ui/types'
import { hasRoles }                                from '@acx-ui/user'
import { AccountType, getIntl }                    from '@acx-ui/utils'

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

interface UseConfigTemplateQueryFnSwitcherProps<ResultType, Payload = unknown> {
  useQueryFn: UseQuery<ResultType, RequestPayload>
  useTemplateQueryFn: UseQuery<ResultType, RequestPayload>
  skip?: boolean
  payload?: Payload
  extraParams?: Params<string>
  templatePayload?: Payload
  enableRbac?: boolean
  enableTemplateRbac?: boolean
}
export function useConfigTemplateQueryFnSwitcher<ResultType, Payload = unknown> (
  props: UseConfigTemplateQueryFnSwitcherProps<ResultType, Payload>
): ReturnType<typeof useQueryFn> {

  const {
    useQueryFn, useTemplateQueryFn, skip = false, payload, templatePayload,
    extraParams, enableRbac, enableTemplateRbac
  } = props

  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const resolvedPayload = isTemplate && templatePayload ? templatePayload : payload
  const resolvedEnableRbac = isTemplate ? enableTemplateRbac : enableRbac
  const requestPayload = {
    params: { ...params, ...(extraParams ?? {}) },
    ...(resolvedPayload ? ({ payload: resolvedPayload }) : {}),
    ...(resolvedEnableRbac ? ({ enableRbac: resolvedEnableRbac }) : {})
  }
  const result = useQueryFn(requestPayload, { skip: skip || isTemplate })
  const templateResult = useTemplateQueryFn(requestPayload, { skip: skip || !isTemplate })

  return isTemplate ? templateResult : result
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultQueryDefinition<ResultType> = QueryDefinition<any, any, any, ResultType>
interface UseConfigTemplateLazyQueryFnSwitcherProps<ResultType> {
  useLazyQueryFn: UseLazyQuery<DefaultQueryDefinition<ResultType>>,
  useLazyTemplateQueryFn: UseLazyQuery<DefaultQueryDefinition<ResultType>>
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


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultMutationDefinition = MutationDefinition<any, any, any, any>
interface UseConfigTemplateMutationFnSwitcherProps {
  useMutationFn: UseMutation<DefaultMutationDefinition>,
  useTemplateMutationFn: UseMutation<DefaultMutationDefinition>
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
