import { useGetAAAPolicyTemplateListQuery }  from '@acx-ui/msp/services'
import { useGetAAAPolicyViewModelListQuery } from '@acx-ui/rc/services'
import { useConfigTemplate }                 from '@acx-ui/rc/utils'
import { useParams }                         from '@acx-ui/react-router-dom'

export function useGetAAAPolicyInstanceList (customPayload?: {}) {
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const requestPayload = { params, payload: customPayload || {} }
  const aaaPolicyListResult = useGetAAAPolicyViewModelListQuery(requestPayload, {
    skip: isTemplate
  })
  const aaaPolicyTemplateListResult = useGetAAAPolicyTemplateListQuery(requestPayload, {
    skip: !isTemplate
  })

  return isTemplate ? aaaPolicyTemplateListResult : aaaPolicyListResult
}
