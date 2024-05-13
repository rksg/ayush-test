import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import _                       from 'lodash'

import { useGetResourceGroupsQuery } from '@acx-ui/analytics/services'
import { showToast }                 from '@acx-ui/components'
import { get }                       from '@acx-ui/config'
import { notificationApi }           from '@acx-ui/store'
import { getIntl }                   from '@acx-ui/utils'

type Response <Data> = {
  success: boolean
  data: Data
}

export type Webhook = {
  id: string
  name: string
  secret: string
  enabled: boolean
  callbackUrl: string
  eventTypes: string[]
  resourceGroupId: string
  createdAt: string
  updatedAt: string
}
export type ExtendedWebhook = Webhook & {
  resourceGroup: string
  status: string
  enabledStr: string
}

export const webhookDtoKeys = [
  'id', 'name', 'secret', 'enabled',
  'callbackUrl', 'eventTypes', 'resourceGroupId'
] as const

export type WebhookDto = Omit<Pick<Webhook, typeof webhookDtoKeys[number]>, 'id'> & {
  id?: string
}

type SampleResponse = {
  success: boolean
  status: number
  data: string
}

type SamplePayload = Pick<Webhook, 'callbackUrl' | 'secret'>

export const {
  useWebhooksQuery,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useCreateWebhookMutation,
  useSendSampleMutation
} = notificationApi.injectEndpoints({
  endpoints: (build) => ({
    webhooks: build.query<ExtendedWebhook[], Record<string, string>>({
      query: () => ({
        url: '/webhooks',
        method: 'get',
        credentials: 'include'
      }),
      providesTags: [{ type: 'Webhook', id: 'LIST' }],
      transformResponse: (response: Response<Webhook[]>, _, rgMap) =>
        response.data.map((item) => ({
          ...item,
          resourceGroup: rgMap[item.resourceGroupId],
          enabledStr: String(item.enabled),
          status: item.enabled
            ? getIntl().formatMessage({ defaultMessage: 'Enabled' })
            : getIntl().formatMessage({ defaultMessage: 'Disabled' })
        }))
    }),
    createWebhook: build.mutation<void, WebhookDto>({
      query: (webhook) => ({
        url: '/webhooks',
        method: 'post',
        credentials: 'include',
        body: webhook
      }),
      invalidatesTags: [{ type: 'Webhook', id: 'LIST' }]
    }),
    updateWebhook: build.mutation<void, WebhookDto>({
      query: ({ id, ...webhook }) => ({
        url: `/webhooks/${id}`,
        method: 'put',
        credentials: 'include',
        body: webhook
      }),
      invalidatesTags: [{ type: 'Webhook', id: 'LIST' }]
    }),
    deleteWebhook: build.mutation<void, Webhook['id']>({
      query: (id) => ({
        url: `/webhooks/${id}`,
        method: 'delete',
        credentials: 'include'
      }),
      invalidatesTags: [{ type: 'Webhook', id: 'LIST' }]
    }),
    sendSample: build.mutation<SampleResponse, SamplePayload>({
      query: (webhook) => ({
        url: '/webhooks/send-sample-incident',
        method: 'post',
        credentials: 'include',
        body: webhook
      })
    })
  })
})

export const useResourceGroups = () => useGetResourceGroupsQuery(undefined, {
  skip: !Boolean(get('IS_MLISA_SA')),
  selectFromResult: (response) => {
    return ({
      ...response,
      rgMap: Object.fromEntries(response.data?.map((item) => [item.id, item.name]) ?? [])
    })
  }
})

function isApiError (
  error: FetchBaseQueryError
): error is ({ status: number, data: { success: boolean, error: string } }) {
  return _.has(error, 'data.error')
}

export function handleError (
  error: FetchBaseQueryError,
  defaultErrorMessage: string
) {
  const { $t } = getIntl()
  let message: string = defaultErrorMessage

  if (isApiError(error)) {
    message = $t({ defaultMessage: 'Error: {message}. (status code: {code})' }, {
      message: error.data.error,
      code: error.status
    })
  }

  showToast({ type: 'error', content: message })
}
