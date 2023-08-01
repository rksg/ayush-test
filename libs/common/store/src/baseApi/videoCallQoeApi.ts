import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

import { get }           from '@acx-ui/config'
import { getJwtHeaders } from '@acx-ui/utils'

export const r1VideoCallQoeURL =
  `${window.location.origin}/api/a4rc/api/rsa-mlisa-call-manager/graphql`
export const raVideoCallQoeURL =
  `${window.location.origin}/analytics/api/rsa-mlisa-call-manager/graphql`

const baseQuery = graphqlRequestBaseQuery({
  url: get('IS_MLISA_SA') ? raVideoCallQoeURL : r1VideoCallQoeURL,
  prepareHeaders: (headers) => {
    Object.entries(getJwtHeaders())
      .forEach(([header, value]) => headers.set(header, value))
    return headers
  }
})

export const videoCallQoeApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'video-call-qoe-api',
  refetchOnMountOrArgChange: true,
  tagTypes: ['VideoCallQoe'],
  endpoints: () => ({ })
})
