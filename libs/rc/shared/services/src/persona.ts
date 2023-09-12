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
  RequestFormData,
  onSocketActivityChanged,
  onActivityMessageReceived
} from '@acx-ui/rc/utils'
import { basePersonaApi }                      from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

export const personaApi = basePersonaApi.injectEndpoints({
  endpoints: build => ({
    // PersonaGroup
    addPersonaGroup: build.mutation<PersonaGroup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PersonaUrls.addPersonaGroup, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'PersonaGroup', id: 'LIST' }]
    }),
    getPersonaGroupList: build.query<TableResult<PersonaGroup>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: PersonaUrls.getPersonaGroupList,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req
        }
      },
      transformResponse (result: NewTableResult<PersonaGroup>) {
        return transferToTableResult<PersonaGroup>(result)
      },
      providesTags: [{ type: 'PersonaGroup', id: 'LIST' }]
    }),
    searchPersonaGroupList: build.query<TableResult<PersonaGroup>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: PersonaUrls.searchPersonaGroupList,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: NewTableResult<PersonaGroup>) {
        return transferToTableResult<PersonaGroup>(result)
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'PersonaGroup', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getPersonaGroupById: build.query<PersonaGroup, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(PersonaUrls.getPersonaGroupById, params)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [
        { type: 'PersonaGroup', id: 'LIST' },
        { type: 'Persona', id: 'ID' }
      ]
    }),
    updatePersonaGroup: build.mutation<PersonaGroup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PersonaUrls.updatePersonaGroup, params)
        return {
          ...req,
          body: payload
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
        const req = createHttpRequest(PersonaUrls.exportPersonaGroup, {
          ...{ pageSize: '2147483647', page: '0', sort: 'name,asc' },
          timezone: params?.timezone ?? 'UTC',
          dateFormat: params?.dateFormat ?? 'dd/MM/yyyy HH:mm'
        }, {
          Accept: 'text/csv'
        })

        return {
          ...req,
          body: payload,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'PersonaGroups.csv'
            downloadFile(response, fileName)
          }
        }
      }
    }),

    // Persona
    addPersona: build.mutation<Persona, RequestPayload>({
      query: ( { params, payload }) => {
        const req = createHttpRequest(PersonaUrls.addPersona, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Persona' }]
    }),
    importPersonas: build.mutation<{}, RequestFormData>({
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
    getPersonaList: build.query<TableResult<Persona>, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(PersonaUrls.getPersonaList, params)
        return {
          ...req,
          params
        }
      },
      transformResponse (result: NewTableResult<Persona>) {
        return transferToTableResult<Persona>(result)
      },
      providesTags: [{ type: 'Persona', id: 'LIST' }]
    }),
    getPersonaById: build.query<Persona, RequestPayload<{ groupId: string, id: string }>>({
      query: ({ params }) => {
        const req = createHttpRequest(PersonaUrls.getPersonaById, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Persona', id: 'ID' }]
    }),
    listPersonaByGroupId: build.query<TableResult<Persona>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PersonaUrls.listPersonaByGroupId, params)
        return {
          ...req,
          params,
          payload
        }
      },
      transformResponse (result: NewTableResult<Persona>) {
        return transferToTableResult<Persona>(result)
      },
      providesTags: [
        { type: 'Persona', id: 'LIST' },
        { type: 'PersonaGroup', id: 'ID' }
      ]
    }),
    searchPersonaList: build.query<TableResult<Persona>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: PersonaUrls.searchPersonaList,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req,
          body: payload
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
            'DELETE_UNIT'
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
    updatePersona: build.mutation<Persona, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PersonaUrls.updatePersona, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [
        { type: 'Persona' }
      ]
    }),
    deletePersona: build.mutation({
      query: ({ params }) => {
        const req = createHttpRequest(PersonaUrls.deletePersona, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Persona' }]
    }),
    deletePersonas: build.mutation({
      query: ({ payload }) => {
        const req = createHttpRequest(PersonaUrls.deletePersonas)
        return {
          ...req,
          body: payload
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
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Persona' }]
    }),
    deletePersonaDevices: build.mutation<PersonaDevice, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(PersonaUrls.deletePersonaDevices, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Persona' }]
    }),
    downloadPersonas: build.query<Blob, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PersonaUrls.exportPersona, {
          ...{ pageSize: '2147483647', page: '0', sort: 'name,asc' },
          timezone: params?.timezone ?? 'UTC',
          dateFormat: params?.dateFormat ?? 'dd/MM/yyyy HH:mm'
        },{
          Accept: 'text/csv'
        })

        return {
          ...req,
          body: payload,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'Personas.csv'
            downloadFile(response, fileName)
          }
        }
      }
    }),
    allocatePersonaVni: build.mutation({
      query: ({ params }) => {
        return {
          ...createHttpRequest(PersonaUrls.allocateVni, params)
        }
      },
      invalidatesTags: [{ type: 'Persona', id: 'ID' }]
    })
  })
})

export const {
  useAddPersonaGroupMutation,
  useGetPersonaGroupListQuery,
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
