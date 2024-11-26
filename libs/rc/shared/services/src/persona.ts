import { Params } from 'react-router-dom'

import {
  PersonaUrls,
  PersonaGroup,
  TableResult,
  Persona,
  PersonaDevice,
  NewTableResult,
  transferToTableResult,
  createNewTableHttpRequest,
  TableChangePayload,
  downloadFile,
  onSocketActivityChanged,
  onActivityMessageReceived
} from '@acx-ui/rc/utils'
import { basePersonaApi }                               from '@acx-ui/store'
import { RequestPayload }                               from '@acx-ui/types'
import { ApiInfo, createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

import { CommonAsyncResponse } from './common'

const defaultPersonaVersioningHeaders = {
  'Content-Type': 'application/vnd.ruckus.v1+json',
  'Accept': 'application/vnd.ruckus.v1+json'
}

const createPersonaHttpRequest = (
  apiInfo: ApiInfo,
  paramValues?: Params<string>,
  customHeaders?: Record<string, unknown>,
  ignoreDelegation?: boolean
) => {
  const headers = { ...defaultPersonaVersioningHeaders, ...customHeaders }
  return createHttpRequest(apiInfo, paramValues, headers, ignoreDelegation)
}

export const personaApi = basePersonaApi.injectEndpoints({
  endpoints: build => ({
    // PersonaGroup
    // eslint-disable-next-line max-len
    addPersonaGroup: build.mutation<CommonAsyncResponse, RequestPayload<PersonaGroup> & { callback?: (response: CommonAsyncResponse) => void }>({
      query: ({ params, payload, customHeaders }) => {
        const req = createPersonaHttpRequest(PersonaUrls.addPersonaGroup, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'PersonaGroup', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded

            if (response.data.requestId === msg.requestId
              && msg.status === 'SUCCESS'
              && msg.useCase === 'CreateGroup') {
              requestArgs.callback?.(response.data)
            }
          } catch { }
        })
      }
    }),
    associateIdentityGroupWithDpsk: build.mutation({
      query: ({ params }) => {
        return {
          ...createPersonaHttpRequest(PersonaUrls.associateDpskPool, params)
        }
      },
      invalidatesTags: [{ type: 'PersonaGroup' }]
    }),
    associateIdentityGroupWithMacRegistration: build.mutation({
      query: ({ params }) => {
        return {
          ...createPersonaHttpRequest(PersonaUrls.associateMacRegistration, params)
        }
      },
      invalidatesTags: [{ type: 'PersonaGroup' }]
    }),
    associateIdentityGroupWithCertificateTemplate: build.mutation({
      query: ({ params }) => {
        return {
          ...createHttpRequest(PersonaUrls.associateCertTemplate, params)
        }
      },
      invalidatesTags: [{ type: 'PersonaGroup' }]
    }),
    associateIdentityGroupWithPolicySet: build.mutation({
      query: ({ params }) => {
        return {
          ...createHttpRequest(PersonaUrls.associatePolicySet, params)
        }
      },
      invalidatesTags: [{ type: 'PersonaGroup' }]
    }),
    dissociateIdentityGroupWithPolicySet: build.mutation({
      query: ({ params }) => {
        return {
          ...createHttpRequest(PersonaUrls.associatePolicySet, params)
        }
      },
      invalidatesTags: [{ type: 'PersonaGroup', id: 'ID' }]
    }),
    searchPersonaGroupList: build.query<TableResult<PersonaGroup>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: PersonaUrls.searchPersonaGroupList,
          params,
          payload: payload as TableChangePayload,
          headers: defaultPersonaVersioningHeaders
        })
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      transformResponse (result: NewTableResult<PersonaGroup>) {
        return transferToTableResult<PersonaGroup>(result)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'CreateGroup',
            'UpdateGroup',
            'DeleteGroup'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(personaApi.util.invalidateTags([
              { type: 'PersonaGroup', id: 'LIST' }
            ]))
          })
        })
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'PersonaGroup', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getPersonaGroupById: build.query<PersonaGroup, RequestPayload>({
      query: ({ params }) => {
        const req = createPersonaHttpRequest(PersonaUrls.getPersonaGroupById, params)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [
        { type: 'PersonaGroup', id: 'LIST' },
        { type: 'Persona', id: 'ID' }
      ],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'CreatePersona'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(personaApi.util.invalidateTags([
              { type: 'PersonaGroup', id: 'LIST' },
              { type: 'Persona', id: 'ID' }
            ]))
          })
        })
      }
    }),
    updatePersonaGroup: build.mutation<CommonAsyncResponse, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        const req = createPersonaHttpRequest(PersonaUrls.updatePersonaGroup, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'PersonaGroup' }]
    }),
    deletePersonaGroup: build.mutation({
      query: ({ params, customHeaders }) => {
        const req = createPersonaHttpRequest(PersonaUrls.deletePersonaGroup, params, customHeaders)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'PersonaGroup' }]
    }),
    downloadPersonaGroups: build.query<Blob, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createPersonaHttpRequest(PersonaUrls.exportPersonaGroup, {
          ...{ pageSize: '2147483647', page: '0', sort: 'name,asc' },
          timezone: params?.timezone ?? 'UTC',
          dateFormat: params?.dateFormat ?? 'dd/MM/yyyy HH:mm'
        }, {
          Accept: 'text/csv'
        })

        return {
          ...req,
          body: JSON.stringify(payload),
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'IdentityGroups.csv'
            downloadFile(response, fileName)
          }
        }
      }
    }),

    // Persona
    addPersona: build.mutation<CommonAsyncResponse, RequestPayload>({
      query: ( { params, payload, customHeaders }) => {
        const req = createPersonaHttpRequest(PersonaUrls.addPersona, params, customHeaders)

        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [
        { type: 'PersonaGroup', id: 'LIST' },
        { type: 'Persona', id: 'ID' }
      ]
    }),
    importPersonas: build.mutation<{}, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        const req = createPersonaHttpRequest(PersonaUrls.importPersonas, params, {
          ...ignoreErrorModal,
          ...customHeaders,
          'Content-Type': undefined
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Persona' }]
    }),
    getPersonaById: build.query<Persona, RequestPayload<{ groupId: string, id: string }>>({
      query: ({ params }) => {
        const req = createPersonaHttpRequest(PersonaUrls.getPersonaById, params)
        return {
          ...req
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'CreateDevice',
            'DeleteDevice'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(personaApi.util.invalidateTags([
              { type: 'Persona', id: 'ID' }
            ]))
          })
        })
      },
      providesTags: [{ type: 'Persona', id: 'ID' }]
    }),
    searchPersonaList: build.query<TableResult<Persona>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: PersonaUrls.searchPersonaList,
          params,
          payload: payload as TableChangePayload,
          headers: defaultPersonaVersioningHeaders
        })
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      transformResponse (result: NewTableResult<Persona>) {
        return transferToTableResult<Persona>(result)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'ADD_UNIT',
            'UPDATE_UNIT',
            'DELETE_UNIT',
            'CreatePersona',
            'UpdatePersona',
            'DeletePersona',
            'BulkDeletePersona',
            'ImportPersona'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(personaApi.util.invalidateTags([
              { type: 'Persona', id: 'LIST' }
            ]))
          })
        })
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Persona', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    updatePersona: build.mutation<CommonAsyncResponse, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        const req = createPersonaHttpRequest(PersonaUrls.updatePersona, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [
        { type: 'Persona' }
      ]
    }),
    deletePersona: build.mutation({
      query: ({ params, customHeaders }) => {
        const req = createPersonaHttpRequest(PersonaUrls.deletePersona, params, customHeaders)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Persona' }]
    }),
    deletePersonas: build.mutation({
      query: ({ params, payload, customHeaders }) => {
        const req = createPersonaHttpRequest(PersonaUrls.deletePersonas, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Persona' }]
    }),
    addPersonaDevices: build.mutation<PersonaDevice, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        const req = createPersonaHttpRequest(PersonaUrls.addPersonaDevices, params, {
          ...ignoreErrorModal, ...customHeaders
        })
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Persona' }]
    }),
    deletePersonaDevices: build.mutation<PersonaDevice, RequestPayload>({
      query: ({ params, customHeaders }) => {
        return {
          ...createPersonaHttpRequest(PersonaUrls.deletePersonaDevices, params, customHeaders)
        }
      },
      invalidatesTags: [{ type: 'Persona' }]
    }),
    downloadPersonas: build.query<Blob, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createPersonaHttpRequest(PersonaUrls.exportPersona, {
          ...{ pageSize: '2147483647', page: '0', sort: 'name,asc' },
          timezone: params?.timezone ?? 'UTC',
          dateFormat: params?.dateFormat ?? 'dd/MM/yyyy HH:mm'
        },{
          Accept: 'text/csv'
        })

        return {
          ...req,
          body: JSON.stringify(payload),
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'Identities.csv'
            downloadFile(response, fileName)
          }
        }
      }
    }),
    allocatePersonaVni: build.mutation({
      query: ({ params }) => {
        return {
          ...createPersonaHttpRequest(PersonaUrls.allocateVni, params)
        }
      },
      invalidatesTags: [{ type: 'Persona', id: 'ID' }]
    })
  })
})

export const {
  useAddPersonaGroupMutation,
  useAssociateIdentityGroupWithDpskMutation,
  useAssociateIdentityGroupWithMacRegistrationMutation,
  useAssociateIdentityGroupWithCertificateTemplateMutation,
  useAssociateIdentityGroupWithPolicySetMutation,
  useDissociateIdentityGroupWithPolicySetMutation,
  useSearchPersonaGroupListQuery,
  useLazySearchPersonaGroupListQuery,
  useGetPersonaGroupByIdQuery,
  useLazyGetPersonaGroupByIdQuery,
  useUpdatePersonaGroupMutation,
  useDeletePersonaGroupMutation,
  useLazyDownloadPersonaGroupsQuery,
  useAllocatePersonaVniMutation
} = personaApi

export const {
  useAddPersonaMutation,
  useGetPersonaByIdQuery,
  useLazyGetPersonaByIdQuery,
  useSearchPersonaListQuery,
  useLazySearchPersonaListQuery,
  useUpdatePersonaMutation,
  useDeletePersonasMutation,
  useAddPersonaDevicesMutation,
  useDeletePersonaDevicesMutation,
  useImportPersonasMutation,
  useLazyDownloadPersonasQuery
} = personaApi
