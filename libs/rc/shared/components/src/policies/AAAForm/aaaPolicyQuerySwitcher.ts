import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import {
  useGetAAAPolicyTemplateListQuery,
  useGetAAAPolicyViewModelListQuery,
  useLazyAaaPolicyQuery,
  useLazyGetAAAPolicyTemplateQuery
} from '@acx-ui/rc/services'
import { AAA_LIMIT_NUMBER, useConfigTemplate } from '@acx-ui/rc/utils'
import { useParams }                           from '@acx-ui/react-router-dom'

interface useGetAAAPolicyInstanceListProps {
  customPayload?: {}
  queryOptions?: {}
}
export function useGetAAAPolicyInstanceList (props: useGetAAAPolicyInstanceListProps) {
  const { customPayload = {}, queryOptions = {} } = props
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const radiusMaxiumnNumber = useIsSplitOn(Features.WIFI_INCREASE_RADIUS_INSTANCE_1024)
    ? 1024
    : AAA_LIMIT_NUMBER

  const isServicePolicyRbacEnabled = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const enableRbac = isTemplate ? isConfigTemplateRbacEnabled : isServicePolicyRbacEnabled

  const requestPayload = {
    params,
    payload: { page: 1, pageSize: radiusMaxiumnNumber, ...customPayload },
    enableRbac
  }
  const aaaPolicyListResult = useGetAAAPolicyViewModelListQuery(requestPayload, {
    ...queryOptions,
    skip: isTemplate
  })
  const aaaPolicyTemplateListResult = useGetAAAPolicyTemplateListQuery(requestPayload, {
    ...queryOptions,
    skip: !isTemplate
  })

  return isTemplate ? aaaPolicyTemplateListResult : aaaPolicyListResult
}

export function useLazyGetAAAPolicyInstance () {
  const { isTemplate } = useConfigTemplate()
  const lazyGetAaaPolicy = useLazyAaaPolicyQuery()
  const lazyGetAaaPolicyTemplate = useLazyGetAAAPolicyTemplateQuery()

  return isTemplate ? lazyGetAaaPolicyTemplate : lazyGetAaaPolicy
}
