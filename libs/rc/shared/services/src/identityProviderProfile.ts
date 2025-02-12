import { FetchBaseQueryError, FetchBaseQueryMeta, QueryReturnValue } from '@reduxjs/toolkit/query'

import {
  CommonResult,
  IdentityProviderProfile,
  IdentityProviderProfileUrls,
  IdentityProviderProfileViewData,
  TableResult,
  onActivityMessageReceived,
  onSocketActivityChanged
} from '@acx-ui/rc/utils'
import { baseIdentityProviderProfileApi } from '@acx-ui/store'
import { RequestPayload }                 from '@acx-ui/types'
import { createHttpRequest }              from '@acx-ui/utils'

export const identityProviderProfileApi = baseIdentityProviderProfileApi.injectEndpoints({
  endpoints: (build) => ({
    createIdentityProviderProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(IdentityProviderProfileUrls.createIdentityProviderProfile)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'IdentityProviderProfile', id: 'LIST' }]
    }),

    updateIdentityProviderProfile: build.mutation<IdentityProviderProfile, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          IdentityProviderProfileUrls.updateIdentityProviderProfile, params
        )

        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'IdentityProviderProfile', id: 'LIST' }]
    }),

    deleteIdentityProviderProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          IdentityProviderProfileUrls.deleteIdentityProviderProfile, params
        )

        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'IdentityProviderProfile', id: 'LIST' }]
    }),

    getIdentityProviderProfileById: build.query<IdentityProviderProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          IdentityProviderProfileUrls.getIdentityProviderProfile, params
        )

        return {
          ...req
        }
      },
      providesTags: [{ type: 'IdentityProviderProfile', id: 'DETAIL' }]
    }),

    getIdentityProviderProfileWithRelationsById:
    build.query<IdentityProviderProfile | null, RequestPayload>({
      async queryFn ({ payload, params }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.id) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)

        const viewDataReq = createHttpRequest(
          IdentityProviderProfileUrls.getIdentityProviderProfileViewDataList, params)
        const idPListQuery = await fetchWithBQ({ ...viewDataReq, body: JSON.stringify(payload) })
        let idPList = idPListQuery.data as TableResult<IdentityProviderProfileViewData>

        const identityProviderProfile = await fetchWithBQ(
          createHttpRequest(IdentityProviderProfileUrls.getIdentityProviderProfile, params)
        )
        const identityProviderProfileData = identityProviderProfile.data as IdentityProviderProfile

        if (identityProviderProfileData && idPList.data) {

        }

        return identityProviderProfileData
          ? { data: identityProviderProfileData }
          : { error: identityProviderProfile.error } as QueryReturnValue<
          IdentityProviderProfile, FetchBaseQueryError, FetchBaseQueryMeta | undefined>
      },
      providesTags: [{ type: 'IdentityProviderProfile', id: 'DETAIL' }]
    }),

    getIdentityProviderProfileViewDataList:
      build.query<TableResult<IdentityProviderProfileViewData>, RequestPayload>
      ({
        query: ({ payload, params }) => {
          const req = createHttpRequest(
            IdentityProviderProfileUrls.getIdentityProviderProfileViewDataList, params)
          return {
            ...req,
            body: JSON.stringify(payload)
          }
        },
        providesTags: [{ type: 'IdentityProviderProfile', id: 'LIST' }],
        async onCacheEntryAdded (requestArgs, api) {
          await onSocketActivityChanged(requestArgs, api, (msg) => {
            const activities = [
              'AddIdentityProviderProfile',
              'DeleteIdentityProviderProfile'
            ]
            onActivityMessageReceived(msg, activities, () => {
              api.dispatch(
                identityProviderProfileApi.util.invalidateTags([
                  { type: 'IdentityProviderProfile', id: 'LIST' }
                ])
              )
            })
          })
        },
        extraOptions: { maxRetries: 5 }
      })
  })
})

export const {
  useCreateIdentityProviderProfileMutation,
  useDeleteIdentityProviderProfileMutation,
  useUpdateIdentityProviderProfileMutation,
  useGetIdentityProviderProfileByIdQuery,
  useGetIdentityProviderProfileWithRelationsByIdQuery,
  useGetIdentityProviderProfileViewDataListQuery,
  useLazyGetIdentityProviderProfileViewDataListQuery
} = identityProviderProfileApi