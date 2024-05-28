import { UseMutation }        from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { MutationDefinition } from '@reduxjs/toolkit/query'

import {
  useGetVenueQuery,
  useGetVenueTemplateQuery
} from '@acx-ui/rc/services'
import {
  VenueExtended,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher
} from '@acx-ui/rc/utils'
import { useParams }                from '@acx-ui/react-router-dom'
import { RequestPayload, UseQuery } from '@acx-ui/types'

interface UseVenueConfigTemplateQueryFnSwitcherProps<ResultType> {
  useQueryFn: UseQuery<ResultType, RequestPayload>
  useTemplateQueryFn: UseQuery<ResultType, RequestPayload>
  skip?: boolean
  enableRbac?: boolean
  enableTemplateRbac?: boolean
}

export function useVenueConfigTemplateQueryFnSwitcher<ResultType> (
  props: UseVenueConfigTemplateQueryFnSwitcherProps<ResultType>
): ReturnType<typeof useQueryFn> {
  const { venueId } = useParams()
  const {
    useQueryFn, useTemplateQueryFn, skip = false,
    enableRbac, enableTemplateRbac
  } = props

  return useConfigTemplateQueryFnSwitcher({
    useQueryFn,
    useTemplateQueryFn,
    skip: skip || !venueId,
    enableRbac,
    enableTemplateRbac
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
