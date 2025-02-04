import { notificationApi } from '@acx-ui/store'

export type DataQuotaUsage = {
    used: number
    allowed: number
}

export const subscriptionsApi = notificationApi.injectEndpoints({
  endpoints: (build) => ({
    getQuotaUsage: build.query<DataQuotaUsage, void>({
      query: () => {
        return {
          url: 'dataSubscriptions/quota',
          method: 'GET',
          credentials: 'include'
        }
      }
    })
  })
})

export const {
  useGetQuotaUsageQuery
} = subscriptionsApi
