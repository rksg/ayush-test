import { TypedUseMutation } from '@reduxjs/toolkit/query/react'

import {
  UseConfigTemplateQueryFnSwitcherProps,
  useConfigTemplateMutationFnSwitcher,
  useConfigTemplateQueryFnSwitcher,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'


const getOpsApi = (apiInfo: ApiInfo) => {
  return apiInfo.opsApi || ''
}

interface ApiInfo {
  url: string;
  method: string;
  newApi?: boolean;
  oldUrl?: string;
  oldMethod?: string;
  opsApi?: string;
  defaultHeaders?: {
    'Content-Type'?: string;
    'Accept'?: string
  };
}

export function useApGroupConfigTemplateQueryFnSwitcher<ResultType, Payload = unknown> (
  props: UseConfigTemplateQueryFnSwitcherProps<ResultType, Payload>
){
  const { skip = false, extraParams, ...rest } = props
  return useConfigTemplateQueryFnSwitcher<ResultType, Payload>({
    ...rest,
    extraParams: { venueId: extraParams?.venueId },
    skip: skip || !extraParams?.venueId
  })
}

export function useApGroupConfigTemplateMutationFnSwitcher (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMutationFn: TypedUseMutation<any, any, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useTemplateMutationFn: TypedUseMutation<any, any, any>
) {
  return useConfigTemplateMutationFnSwitcher({ useMutationFn, useTemplateMutationFn })
}

// eslint-disable-next-line max-len
export function useApGroupConfigTemplateOpsApiSwitcher (apiInfo: ApiInfo, templateApiInfo: ApiInfo) {
  const { isTemplate } = useConfigTemplate()

  return !isTemplate? getOpsApi(apiInfo) : getOpsApi(templateApiInfo)
}
