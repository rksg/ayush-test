import { rbacApi } from '@acx-ui/analytics/services'

export type ApplicationToken = {
  id: string
  name: string
  clientId: string
  clientSecret: string
}

export const applicationTokenDtoKeys = [
  'id', 'name', 'clientId', 'clientSecret'
] as const

const omittedKeys = ['id', 'clientId', 'clientSecret'] as const

export type ApplicationTokenDto = Omit<
Pick<ApplicationToken, typeof applicationTokenDtoKeys[number]>, typeof omittedKeys[number]
> & {
  id?: string
  clientId?: string
}

export const {
  useApplicationTokensQuery,
  useCreateApplicationTokenMutation,
  useDeleteApplicationTokenMutation,
  useRotateApplicationTokenMutation
} = rbacApi.injectEndpoints({
  endpoints: (build) => ({
    applicationTokens: build.query<ApplicationToken[], void>({
      query: () => ({
        url: '/applicationTokens',
        method: 'GET',
        credentials: 'include'
      }),
      providesTags: [{ type: 'ApplicationToken', id: 'LIST' }]
    }),
    createApplicationToken: build.mutation<void, ApplicationTokenDto>({
      query: (applicationToken) => ({
        url: '/applicationTokens',
        method: 'POST',
        credentials: 'include',
        body: applicationToken
      }),
      invalidatesTags: [{ type: 'ApplicationToken', id: 'LIST' }]
    }),
    deleteApplicationToken: build.mutation<void, ApplicationTokenDto>({
      query: (applicationToken) => ({
        url: `/applicationTokens/${applicationToken.id}`,
        method: 'DELETE',
        credentials: 'include'
      }),
      invalidatesTags: [{ type: 'ApplicationToken', id: 'LIST' }]
    }),
    rotateApplicationToken: build.mutation<ApplicationToken, ApplicationTokenDto>({
      query: (applicationToken) => ({
        url: `/applicationTokens/${applicationToken.id}`,
        method: 'PATCH',
        credentials: 'include'
      }),
      invalidatesTags: [{ type: 'ApplicationToken', id: 'LIST' }]
    })
  })
})