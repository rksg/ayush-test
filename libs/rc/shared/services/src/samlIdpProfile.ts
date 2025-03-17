
import { FetchBaseQueryError, FetchBaseQueryMeta, QueryReturnValue } from '@reduxjs/toolkit/query'

import {
  CommonResult,
  SamlIdpProfile,
  SamlIdpProfileViewData,
  SamlIdpProfileUrls,
  TableResult,
  SamlIdpProfileFormType,
  onActivityMessageReceived,
  onSocketActivityChanged,
  downloadFile
} from '@acx-ui/rc/utils'
import { baseSamlIdpProfileApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { createHttpRequest }     from '@acx-ui/utils'


export const samlIdpProfileApi = baseSamlIdpProfileApi.injectEndpoints({
  endpoints: (build) => ({
    createSamlIdpProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(SamlIdpProfileUrls.createSamlIdpProfile)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'SamlIdpProfile', id: 'LIST' }]
    }),

    updateSamlIdpProfile: build.mutation<SamlIdpProfile, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          SamlIdpProfileUrls.updateSamlIdpProfile, params
        )

        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'SamlIdpProfile', id: 'LIST' }]
    }),

    deleteSamlIdpProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          SamlIdpProfileUrls.deleteSamlIdpProfile, params
        )

        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'SamlIdpProfile', id: 'LIST' }]
    }),

    getSamlIdpProfileById: build.query<SamlIdpProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          SamlIdpProfileUrls.getSamlIdpProfile, params
        )

        return {
          ...req
        }
      },
      providesTags: [{ type: 'SamlIdpProfile', id: 'DETAIL' }]
    }),

    getSamlIdpProfileWithRelationsById:
    build.query<SamlIdpProfileFormType | null, RequestPayload>({
      async queryFn ({ payload, params }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.id) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)
        const viewDataReq = createHttpRequest(
          SamlIdpProfileUrls.getSamlIdpProfileViewDataList, params)

        const idPListQuery = await fetchWithBQ({ ...viewDataReq, body: JSON.stringify(payload) })
        let idPList = idPListQuery.data as TableResult<SamlIdpProfileViewData>
        const samlIdpProfile = await fetchWithBQ(
          createHttpRequest(SamlIdpProfileUrls.getSamlIdpProfile, params)
        )
        const samlIdpProfileData = samlIdpProfile.data as SamlIdpProfileFormType

        if (samlIdpProfileData && idPList?.data) {
          const viewData = idPList.data.find(item => item.id === params.id)
          if(viewData) {
            samlIdpProfileData.responseEncryptionEnabled = viewData.responseEncryptionEnabled
            samlIdpProfileData.encryptionCertificateId = viewData.encryptionCertificateId
          }
        }

        return samlIdpProfileData
          ? { data: samlIdpProfileData }
          : { error: samlIdpProfile.error } as QueryReturnValue<
          SamlIdpProfileFormType, FetchBaseQueryError, FetchBaseQueryMeta | undefined>
      },
      providesTags: [{ type: 'SamlIdpProfile', id: 'DETAIL' }]
    }),

    getSamlIdpProfileViewDataList:
      build.query<TableResult<SamlIdpProfileViewData>, RequestPayload> ({
        query: ({ payload, params }) => {
          const req = createHttpRequest(
            SamlIdpProfileUrls.getSamlIdpProfileViewDataList, params)
          return {
            ...req,
            body: JSON.stringify(payload)
          }
        },
        providesTags: [{ type: 'SamlIdpProfile', id: 'LIST' }],
        async onCacheEntryAdded (requestArgs, api) {
          await onSocketActivityChanged(requestArgs, api, (msg) => {
            const activities = [
              'AddSamlIdpProfile',
              'DeleteSamlIdpProfile'
            ]
            onActivityMessageReceived(msg, activities, () => {
              api.dispatch(
                samlIdpProfileApi.util.invalidateTags([
                  { type: 'SamlIdpProfile', id: 'LIST' }
                ])
              )
            })
          })
        },
        extraOptions: { maxRetries: 5 }
      }),
    activateSamlIdpProfileCertificate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(SamlIdpProfileUrls.activateSamlIdpProfileCertificate, params)
      },
      invalidatesTags: [
        { type: 'SamlIdpProfile', id: 'LIST' },
        { type: 'SamlIdpProfile', id: 'Options' }
      ]
    }),
    deactivateSamlIdpProfileCertificate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(SamlIdpProfileUrls.deactivateSamlIdpProfileCertificate, params)
      },
      invalidatesTags: [
        { type: 'SamlIdpProfile', id: 'LIST' },
        { type: 'SamlIdpProfile', id: 'Options' }
      ]
    }),
    downloadSamlServiceProviderMetadata: build.mutation<Blob, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          SamlIdpProfileUrls.downloadSamlServiceProviderMetadata, params
        )
        return {
          ...req,
          responseHandler: async (response) => {
            const date = new Date()
            // eslint-disable-next-line max-len
            const nowTime = date.getUTCFullYear() + ('0' + (date.getUTCMonth() + 1)).slice(-2) + ('0' + date.getUTCDate()).slice(-2) + ('0' + date.getUTCHours()).slice(-2) + ('0' + date.getUTCMinutes()).slice(-2) + ('0' + date.getUTCSeconds()).slice(-2)
            const filename = 'SAML Metadata - ' + nowTime + '.xml'
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : filename
            downloadFile(response, fileName)
          }
        }
      }
    })
  })
})

export const {
  useCreateSamlIdpProfileMutation,
  useDeleteSamlIdpProfileMutation,
  useUpdateSamlIdpProfileMutation,
  useGetSamlIdpProfileByIdQuery,
  useLazyGetSamlIdpProfileByIdQuery,
  useGetSamlIdpProfileWithRelationsByIdQuery,
  useGetSamlIdpProfileViewDataListQuery,
  useLazyGetSamlIdpProfileViewDataListQuery,
  useActivateSamlIdpProfileCertificateMutation,
  useDeactivateSamlIdpProfileCertificateMutation,
  useDownloadSamlServiceProviderMetadataMutation
} = samlIdpProfileApi