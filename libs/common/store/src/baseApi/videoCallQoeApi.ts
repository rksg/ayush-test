import { createApi }               from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'

import { getJwtHeaders } from '@acx-ui/utils'

// eslint-disable-next-line max-len
export const videoCallQoeURL = `${window.location.origin}/api/a4rc/api/rsa-mlisa-call-manager/graphql`

const baseQuery = graphqlRequestBaseQuery({
  url: videoCallQoeURL,
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
  endpoints: () => ({ })
})
