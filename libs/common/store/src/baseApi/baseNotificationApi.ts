import { get }           from '@acx-ui/config'
import { getJwtHeaders } from '@acx-ui/utils'

import { createApi, fetchBaseQuery } from './baseQuery'

const isRa = get('IS_MLISA_SA')

export const notificationApiURL = isRa
  ? `${window.location.origin}/analytics/api/rsa-mlisa-notification`
  : `${window.location.origin}/api/a4rc/api/rsa-mlisa-notification`

export const notificationApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: notificationApiURL,
    prepareHeaders: (headers) => {
      Object.entries(getJwtHeaders())
        .forEach(([header, value]) => headers.set(header, value))
      return headers
    }
  }),
  reducerPath: 'analytics-notification-api',
  refetchOnMountOrArgChange: true,
  tagTypes: ['Notification', 'Webhook', 'DataConnector'],
  endpoints: () => ({})
})
