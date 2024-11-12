import { Params } from 'react-router-dom'

import { useGetApCapabilitiesByModelQuery, useGetOldApCapabilitiesByModelQuery } from '@acx-ui/rc/services'

type UseGetApCapabilitiesProps = {
  params: Readonly<Params<string>>
  modelName: string | undefined
  skip?: boolean
  enableRbac?: boolean
}

export function useGetApCapabilities (props: UseGetApCapabilitiesProps) {

  const { params, modelName, skip = false, enableRbac = false } = props

  const result = useGetOldApCapabilitiesByModelQuery(
    { params, modelName },
    { skip: skip || enableRbac || !modelName })

  const rbacApiResult = useGetApCapabilitiesByModelQuery(
    { params },
    { skip: skip || !enableRbac || !params.venueId || !modelName })

  return enableRbac? rbacApiResult : result
}