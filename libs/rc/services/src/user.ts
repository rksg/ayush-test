import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  RequestPayload
} from '@acx-ui/rc/utils'

export const baseUserApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'userApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const userApi = baseUserApi.injectEndpoints({
  endpoints: (build) => ({
    getAllUserSettings: build.query<any, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          CommonUrlsInfo.getAllUserSettings,
          params
        )
        return {
          ...req
        }
      },
      transformResponse (userSettings: any) {
        let result:{[key: string]: string} = {}
        Object.keys(userSettings).forEach((key: string) => {
          result[key] = JSON.parse(userSettings[key])
        })
        return result
      }
    })
  })
})
export const { useGetAllUserSettingsQuery } = userApi
