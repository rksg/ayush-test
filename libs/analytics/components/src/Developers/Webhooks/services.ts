import { useGetResourceGroupsQuery } from '@acx-ui/analytics/services'
import { get }                       from '@acx-ui/config'
import { notificationApi }           from '@acx-ui/store'
import { hasPermission }             from '@acx-ui/user'
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
        method: 'GET',
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
        method: 'POST',
        credentials: 'include',
        body: webhook
      }),
      invalidatesTags: [{ type: 'Webhook', id: 'LIST' }]
    }),
    updateWebhook: build.mutation<void, WebhookDto>({
      query: ({ id, ...webhook }) => ({
        url: `/webhooks/${id}`,
        method: 'PUT',
        credentials: 'include',
        body: webhook
      }),
      invalidatesTags: [{ type: 'Webhook', id: 'LIST' }]
    }),
    deleteWebhook: build.mutation<void, Webhook['id']>({
      query: (id) => ({
        url: `/webhooks/${id}`,
        method: 'DELETE',
        credentials: 'include'
      }),
      invalidatesTags: [{ type: 'Webhook', id: 'LIST' }]
    }),
    sendSample: build.mutation<SampleResponse, SamplePayload>({
      query: (webhook) => ({
        url: '/webhooks/send-sample-incident',
        method: 'POST',
        credentials: 'include',
        body: webhook
      })
    })
  })
})

export const useResourceGroups = () => useGetResourceGroupsQuery(undefined, {
  skip: !Boolean(get('IS_MLISA_SA')) || !hasPermission({ permission: 'READ_WEBHOOKS' }),
  selectFromResult: (response) => {
    return ({
      ...response,
      rgMap: Object.fromEntries(response.data?.map((item) => [item.id, item.name]) ?? [])
    })
  }
})
