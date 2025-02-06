import { TypedUseMutation } from '@reduxjs/toolkit/query/react'

import {
  useGetVenueQuery,
  useGetVenueTemplateQuery
} from '@acx-ui/rc/services'
import {
  UseConfigTemplateQueryFnSwitcherProps,
  VenueExtended,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { useParams }          from '@acx-ui/react-router-dom'
import { ApiInfo, getOpsApi } from '@acx-ui/utils'

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

export function useVenueConfigTemplateMutationFnSwitcher (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMutationFn: TypedUseMutation<any, any, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useTemplateMutationFn: TypedUseMutation<any, any, any>
) {
  return useConfigTemplateMutationFnSwitcher({ useMutationFn, useTemplateMutationFn })
}

export function useGetVenueInstance () {
  return useVenueConfigTemplateQueryFnSwitcher<VenueExtended>({
    useQueryFn: useGetVenueQuery,
    useTemplateQueryFn: useGetVenueTemplateQuery
  })
}

export function useVenueConfigTemplateOpsApiSwitcher (apiInfo: ApiInfo, templateApiInfo: ApiInfo) {
  const { isTemplate } = useConfigTemplate()

  return !isTemplate? getOpsApi(apiInfo) : getOpsApi(templateApiInfo)
}
