import { rbacApi } from '@acx-ui/store'

export type ApplicationToken = {
  id: string
  camId: string
  name: string
  clientId: string
  clientSecret: string
}

export type ApplicationTokenResponse = {
  camId: string
  name: string
  clientId: string
  clientSecret: string
}

export const applicationTokenDtoKeys = [
  'id', 'camId', 'name', 'clientId', 'clientSecret'
] as const

const omittedKeys = ['id', 'camId', 'clientId', 'clientSecret'] as const

export type ApplicationTokenDto = Omit<
Pick<ApplicationToken, typeof applicationTokenDtoKeys[number]>, typeof omittedKeys[number]
> & {
  id?: string
  camId?: string
  clientId?: string
}

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
      providesTags: [{ type: 'ApplicationToken', id: 'LIST' }],
      transformResponse: (response: ApplicationTokenResponse[]) => response.map((item) => ({
        id: item.camId,
        ...item
      }))
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
          url: `/applicationTokens/${applicationToken.camId}`,
          method: 'delete',
          credentials: 'include'
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