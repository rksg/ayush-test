import { rbacApi } from '@acx-ui/store'

export type ApplicationToken = {
  id: string
  name: string
  clientId: string
  clientSecret: string
  grantTypes: string[]
  accessTokenTtl: number
}

export const applicationTokenDtoKeys = [
  'id', 'name', 'clientId', 'clientSecret'
] as const

export type ApplicationTokenDto = Omit<
Pick<ApplicationToken, typeof applicationTokenDtoKeys[number]>, 'id'
> & {
  id?: string
}

// type SampleResponse = {
//   success: boolean
//   status: number
//   data: string
// }

// type SamplePayload = Pick<Webhook, 'callbackUrl' | 'secret'>

export const {
  useApplicationTokensQuery,
  useCreateApplicationTokenMutation,
  useUpdateApplicationTokenMutation,
  useDeleteApplicationTokenMutation
  // useSendSampleMutation
} = rbacApi.injectEndpoints({
  endpoints: (build) => ({
    applicationTokens: build.query<ApplicationToken[], void>({
      query: () => ({
        url: '/applicationTokens',
        method: 'get',
        credentials: 'include'
      }),
      providesTags: [{ type: 'ApplicationToken', id: 'LIST' }]
    }),
    createApplicationToken: build.mutation<void, ApplicationTokenDto>({
      query: (applicationToken) => ({
        url: '/applicationTokens',
        method: 'post',
        credentials: 'include',
        body: applicationToken
      }),
      invalidatesTags: [{ type: 'ApplicationToken', id: 'LIST' }]
    }),
    updateApplicationToken: build.mutation<void, ApplicationTokenDto>({
      query: (applicationToken) => ({
        url: '/applicationTokens',
        method: 'post',
        credentials: 'include',
        body: applicationToken
      }),
      invalidatesTags: [{ type: 'ApplicationToken', id: 'LIST' }]
    }),
    deleteApplicationToken: build.mutation<void, ApplicationTokenDto>({
      query: (applicationToken) => {
        return ({
          url: '/applicationTokens',
          method: 'delete',
          credentials: 'include',
          body: applicationToken
        })
      },
      invalidatesTags: [{ type: 'ApplicationToken', id: 'LIST' }]
    })
    // sendSample: build.mutation<SampleResponse, SamplePayload>({
    //   query: (webhook) => ({
    //     url: '/webhooks/send-sample-incident',
    //     method: 'post',
    //     credentials: 'include',
    //     body: webhook
    //   })
    // })
  })
})