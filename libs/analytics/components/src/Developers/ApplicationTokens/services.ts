import jwt from 'jsonwebtoken'

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
  'id', 'name', 'clientId', 'clientSecret'
] as const

export type ApplicationTokenDto = Omit<
Pick<ApplicationToken, typeof applicationTokenDtoKeys[number]>, 'id'
> & {
  id?: string
}

const token = sessionStorage.getItem('jwt')
const decodedJwt = jwt.decode(token)

console.log('JWT', jwt)
console.log('Decoded JWT', decodedJwt)

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