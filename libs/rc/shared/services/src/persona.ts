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
  onActivityMessageReceived,
  TxStatus,
  PersonaAssociation
} from '@acx-ui/rc/utils'
import { basePersonaApi }                               from '@acx-ui/store'
import { RequestPayload }                               from '@acx-ui/types'
import { ApiInfo, createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

import { CommonAsyncCallback, CommonAsyncResponse } from './common'

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
    addPersonaGroup: build.mutation<CommonAsyncResponse, RequestPayload<PersonaGroup> & CommonAsyncCallback>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PersonaUrls.addPersonaGroup, params)
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

            if (response.data.requestId === msg.requestId && msg.useCase === 'CreateGroup') {
              if (msg.status === TxStatus.SUCCESS) {
                requestArgs.onSuccess?.(response.data)
              } else if (msg.status === TxStatus.FAIL) {
                requestArgs.onError?.(response.data)
              }
            }
          } catch {
            requestArgs.onError?.()
          }
        })
      }
    }),
    associateIdentityGroupWithDpsk: build.mutation({
      query: ({ params }) => {
        return {
          ...createHttpRequest(PersonaUrls.associateDpskPool, params)
        }
      },
      invalidatesTags: [{ type: 'PersonaGroup' }]
    }),
    associateIdentityGroupWithMacRegistration: build.mutation({
      query: ({ params }) => {
        return {
          ...createHttpRequest(PersonaUrls.associateMacRegistration, params)
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
          ...createHttpRequest(PersonaUrls.dissociatePolicySet, params)
        }
      },
      invalidatesTags: [{ type: 'PersonaGroup' }]
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
            'DeleteGroup',
            'CreateGroupAssociation',
            'DeleteGroupAssociation'
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
            'CreatePersona',
            'CreateGroupAssociation',
            'DeleteGroupAssociation'
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(PersonaUrls.updatePersonaGroup, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'PersonaGroup' }]
    }),
    deletePersonaGroup: build.mutation({
      query: ({ params }) => {
        const req = createHttpRequest(PersonaUrls.deletePersonaGroup, params)
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
      query: ( { params, payload }) => {
        const req = createHttpRequest(PersonaUrls.addPersona, params)

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
      query: ({ params, payload }) => {
        const req = createHttpRequest(PersonaUrls.importPersonas, params, {
          ...ignoreErrorModal,
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
    getPersonaIdentities: build.query<TableResult<PersonaAssociation>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PersonaUrls.getPersonaIdentities, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: NewTableResult<PersonaAssociation>) {
        return transferToTableResult<PersonaAssociation>(result)
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(PersonaUrls.updatePersona, params)
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(PersonaUrls.deletePersonas, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Persona' }]
    }),
    deletePersonaAssociation: build.mutation({
      query: ({ params }) => {
        const req = createPersonaHttpRequest(PersonaUrls.deletePersonaAssociation, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Persona' }]
    }),
    addPersonaDevices: build.mutation<PersonaDevice, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PersonaUrls.addPersonaDevices, params, {
          ...ignoreErrorModal
        })
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Persona' }]
    }),
    deletePersonaDevices: build.mutation<PersonaDevice, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(PersonaUrls.deletePersonaDevices, params)
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
  useGetPersonaIdentitiesQuery,
  useSearchPersonaListQuery,
  useLazySearchPersonaListQuery,
  useUpdatePersonaMutation,
  useDeletePersonasMutation,
  useDeletePersonaAssociationMutation,
  useAddPersonaDevicesMutation,
  useDeletePersonaDevicesMutation,
  useImportPersonasMutation,
  useLazyDownloadPersonasQuery
} = personaApi
