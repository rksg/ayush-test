import { UseLazyQuery, UseMutation }           from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { MutationDefinition, QueryDefinition } from '@reduxjs/toolkit/query'

import { TenantType, useParams }               from '@acx-ui/react-router-dom'
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

export function useConfigTemplateQueryFnSwitcher<ResultType> (
  useQueryFn: UseQuery<ResultType, RequestPayload>,
  useTemplateQueryFn: UseQuery<ResultType, RequestPayload>,
  skip = false
): ReturnType<typeof useQueryFn> {
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const result = useQueryFn({ params }, { skip: skip || isTemplate })
  const templateResult = useTemplateQueryFn({ params }, { skip: skip || !isTemplate })

  return isTemplate ? templateResult : result
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultQueryDefinition<ResultType> = QueryDefinition<any, any, any, ResultType>
export function useConfigTemplateLazyQueryFnSwitcher<ResultType> (
  useLazyQueryFn: UseLazyQuery<DefaultQueryDefinition<ResultType>>,
  useLazyTemplateQueryFn: UseLazyQuery<DefaultQueryDefinition<ResultType>>
): ReturnType<typeof useLazyQueryFn> {
  const { isTemplate } = useConfigTemplate()
  const result = useLazyQueryFn()
  const templateResult = useLazyTemplateQueryFn()

  return isTemplate ? templateResult : result
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultMutationDefinition = MutationDefinition<any, any, any, any>

export function useConfigTemplateMutationFnSwitcher (
  useMutationFn: UseMutation<DefaultMutationDefinition>,
  useTemplateMutationFn: UseMutation<DefaultMutationDefinition>
) {
  const { isTemplate } = useConfigTemplate()
  const result = useMutationFn()
  const templateResult = useTemplateMutationFn()

  return isTemplate ? templateResult : result
}
