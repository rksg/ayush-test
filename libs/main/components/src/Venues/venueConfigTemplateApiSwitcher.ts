import { UseMutation }        from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { MutationDefinition } from '@reduxjs/toolkit/query'

import {
  useGetVenueQuery,
  useGetVenueTemplateQuery
} from '@acx-ui/rc/services'
import {
  UseConfigTemplateQueryFnSwitcherProps,
  VenueExtended,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

export function useVenueConfigTemplateQueryFnSwitcher<ResultType, Payload = unknown> (
  props: UseConfigTemplateQueryFnSwitcherProps<ResultType, Payload>
){
  const { venueId } = useParams()
  const { skip = false, ...rest } = props

  return useConfigTemplateQueryFnSwitcher<ResultType, Payload>({
    ...rest,
    skip: skip || !venueId
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VenueMutationDefinition = MutationDefinition<any, any, any, any>
export function useVenueConfigTemplateMutationFnSwitcher (
  useMutationFn: UseMutation<VenueMutationDefinition>,
  useTemplateMutationFn: UseMutation<VenueMutationDefinition>
) {
  return useConfigTemplateMutationFnSwitcher({ useMutationFn, useTemplateMutationFn })
}

export function useGetVenueInstance () {
  return useVenueConfigTemplateQueryFnSwitcher<VenueExtended>({
    useQueryFn: useGetVenueQuery,
    useTemplateQueryFn: useGetVenueTemplateQuery
  })
}
