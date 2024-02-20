import { UseMutation }        from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { MutationDefinition } from '@reduxjs/toolkit/query'

import {
  useGetVenueQuery,
  useGetVenueTemplateQuery
} from '@acx-ui/rc/services'
import { VenueExtended, useConfigTemplate } from '@acx-ui/rc/utils'
import { useParams }                        from '@acx-ui/react-router-dom'
import { RequestPayload, UseQuery }         from '@acx-ui/types'

export function useVenueConfigTemplateQueryFnSwitcher<ResultType> (
  useQueryFn: UseQuery<ResultType, RequestPayload>,
  useTemplateQueryFn: UseQuery<ResultType, RequestPayload>
): ReturnType<typeof useQueryFn> {
  const { isTemplate } = useConfigTemplate()
  const { tenantId, venueId } = useParams()
  const params = { tenantId, venueId }
  const result = useQueryFn({ params }, { skip: !venueId || isTemplate })
  const templateResult = useTemplateQueryFn({ params }, { skip: !venueId || !isTemplate })

  return isTemplate ? templateResult : result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VenueMutationDefinition = MutationDefinition<any, any, any, any>

export function useVenueConfigTemplateMutationFnSwitcher (
  useMutationFn: UseMutation<VenueMutationDefinition>,
  useTemplateMutationFn: UseMutation<VenueMutationDefinition>
) {
  const { isTemplate } = useConfigTemplate()
  const result = useMutationFn()
  const templateResult = useTemplateMutationFn()

  return isTemplate ? templateResult : result
}

export function useGetVenueInstance () {
  return useVenueConfigTemplateQueryFnSwitcher<VenueExtended>(
    useGetVenueQuery,
    useGetVenueTemplateQuery
  )
}
