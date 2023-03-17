import {
  RequestPayload,
  onSocketActivityChanged,
  showActivityToast
} from '@acx-ui/rc/utils'
import { baseCommonApi } from '@acx-ui/store'

export const commonApi = baseCommonApi.injectEndpoints({
  endpoints: (build) => ({
    streamActivityMessages: build.query<unknown[], RequestPayload>({
      // This query is for global websocket event and it shows activity messages.
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityToast(msg)
        })
      }
    })
  })
})

export const {
  useStreamActivityMessagesQuery
} = commonApi
