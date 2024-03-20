import { rbacApi as baseRbacApi } from '@acx-ui/store'

export type UpdateUserPayload = {
  userId: string
  preferences: {}
}

export const rbacApi = baseRbacApi.injectEndpoints({
  endpoints: (build) => ({
    updateUser: build.mutation<string, UpdateUserPayload>({
      query: ({ userId, preferences }) => {
        return {
          url: `/users/${userId}`,
          method: 'put',
          credentials: 'include',
          headers: {
            'x-mlisa-user-id': userId
          },
          body: { preferences },
          responseHandler: 'text'
        }
      },
      invalidatesTags: [{ type: 'RBAC', id: 'GET_USERS' }]
    })
  })
})

export const {
  useUpdateUserMutation
} = rbacApi
