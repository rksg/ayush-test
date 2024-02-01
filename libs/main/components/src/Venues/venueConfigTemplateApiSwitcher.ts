import {
  useGetVenueQuery,
  useGetVenueTemplateQuery
} from '@acx-ui/rc/services'
import { VenueExtended, useConfigTemplate } from '@acx-ui/rc/utils'
import { useParams }                        from '@acx-ui/react-router-dom'
import { RequestPayload, UseQuery }         from '@acx-ui/types'

export function useVenueConfigTemplateQueryFnSwitcher<ResultType> (
  queryFn: UseQuery<ResultType, RequestPayload>,
  templateQueryFn: UseQuery<ResultType, RequestPayload>
): ReturnType<typeof queryFn> {
  const { isTemplate } = useConfigTemplate()
  const { tenantId, venueId } = useParams()
  const params = { tenantId, venueId }
  const result = queryFn({ params }, { skip: !venueId || isTemplate })
  const templateResult = templateQueryFn({ params }, { skip: !venueId || !isTemplate })

  return isTemplate ? templateResult : result
}

export function useGetVenueInstance () {
  return useVenueConfigTemplateQueryFnSwitcher<VenueExtended>(
    useGetVenueQuery,
    useGetVenueTemplateQuery
  )
}
