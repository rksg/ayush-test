import { UseMutation }        from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { MutationDefinition } from '@reduxjs/toolkit/query'

import {
  useGetVenueQuery,
  useGetVenueTemplateQuery
} from '@acx-ui/rc/services'
import { VenueExtended, useConfigTemplateMutationFnSwitcher, useConfigTemplateQueryFnSwitcher } from '@acx-ui/rc/utils'
import { useParams }                                                                            from '@acx-ui/react-router-dom'
import { RequestPayload, UseQuery }                                                             from '@acx-ui/types'

export function useVenueConfigTemplateQueryFnSwitcher<ResultType> (
  useQueryFn: UseQuery<ResultType, RequestPayload>,
  useTemplateQueryFn: UseQuery<ResultType, RequestPayload>
): ReturnType<typeof useQueryFn> {
  const { venueId } = useParams()

  return useConfigTemplateQueryFnSwitcher(useQueryFn, useTemplateQueryFn, !venueId)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VenueMutationDefinition = MutationDefinition<any, any, any, any>
export function useVenueConfigTemplateMutationFnSwitcher (
  useMutationFn: UseMutation<VenueMutationDefinition>,
  useTemplateMutationFn: UseMutation<VenueMutationDefinition>
) {
  return useConfigTemplateMutationFnSwitcher(useMutationFn, useTemplateMutationFn)
}

export function useGetVenueInstance () {
  return useVenueConfigTemplateQueryFnSwitcher<VenueExtended>(
    useGetVenueQuery,
    useGetVenueTemplateQuery
  )
}
