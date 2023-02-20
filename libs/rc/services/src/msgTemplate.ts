import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  MsgTemplateUrls,
  createHttpRequest,
  TemplateScope,
//   TableResult,
  RequestPayload,
//   Persona,
//   PersonaDevice,
//   NewTableResult,
//   transferToTableResult,
//   createNewTableHttpRequest,
//   TableChangePayload
} from '@acx-ui/rc/utils'

export const baseMsgTemplateApi = createApi({
  baseQuery: fetchBaseQuery(),
  tagTypes: ['TemplateScope'],
  reducerPath: 'msgTemplateApi',
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const msgTemplateApi = baseMsgTemplateApi.injectEndpoints({
  endpoints: build => ({
    getTemplateScopeById: build.query<TemplateScope, RequestPayload>({
        query: ({ params }) => {
        const req = createHttpRequest(MsgTemplateUrls.getTemplateScopeById, params)
            return {
                ...req
            }
        },
        providesTags: [
          // TODO: fix id -- do I have it listed correctly?
            { type: 'TemplateScope', id: 'templateScopeId' },
        ]
    }),
    // getPersonaGroupById: build.query<PersonaGroup, RequestPayload>({
    //     query: ({ params }) => {
    //     const req = createHttpRequest(PersonaUrls.getPersonaGroupById, params)
    //         return {
    //             ...req
    //         }
    //     },
    //     providesTags: [
    //         { type: 'PersonaGroup', id: 'LIST' },
    //     ]
    // }),
//     // PersonaGroup
//     addPersonaGroup: build.mutation<PersonaGroup, RequestPayload>({
//       query: ({ params, payload }) => {
//         const req = createHttpRequest(PersonaUrls.addPersonaGroup, params)
//         return {
//           ...req,
//           body: payload
//         }
//       },
//       invalidatesTags: [{ type: 'PersonaGroup', id: 'LIST' }]
//     }),
//     getPersonaGroupList: build.query<TableResult<PersonaGroup>, RequestPayload>({
//       query: ({ params, payload }) => {
//         const req = createNewTableHttpRequest({
//           apiInfo: PersonaUrls.getPersonaGroupList,
//           params,
//           payload: payload as TableChangePayload
//         })
//         return {
//           ...req
//         }
//       },
//       transformResponse (result: NewTableResult<PersonaGroup>) {
//         return transferToTableResult<PersonaGroup>(result)
//       },
//       providesTags: [{ type: 'PersonaGroup', id: 'LIST' }]
//     }),
//     searchPersonaGroupList: build.query<TableResult<PersonaGroup>, RequestPayload>({
//       query: ({ params, payload }) => {
//         const req = createNewTableHttpRequest({
//           apiInfo: PersonaUrls.searchPersonaGroupList,
//           params,
//           payload: payload as TableChangePayload
//         })
//         return {
//           ...req,
//           body: payload
//         }
//       },
//       transformResponse (result: NewTableResult<PersonaGroup>) {
//         return transferToTableResult<PersonaGroup>(result)
//       },
//       providesTags: [{ type: 'PersonaGroup', id: 'LIST' }]
//     }),
//     getPersonaGroupById: build.query<PersonaGroup, RequestPayload>({
//       query: ({ params }) => {
//         const req = createHttpRequest(PersonaUrls.getPersonaGroupById, params)
//         return {
//           ...req
//         }
//       },
//       providesTags: [
//         { type: 'PersonaGroup', id: 'LIST' },
//         { type: 'Persona', id: 'ID' }
//       ]
//     }),
//     updatePersonaGroup: build.mutation<PersonaGroup, RequestPayload>({
//       query: ({ params, payload }) => {
//         const req = createHttpRequest(PersonaUrls.updatePersonaGroup, params)
//         return {
//           ...req,
//           body: payload
//         }
//       },
//       invalidatesTags: [{ type: 'PersonaGroup' }]
//     }),
//     deletePersonaGroup: build.mutation({
//       query: ({ params }) => {
//         const req = createHttpRequest(PersonaUrls.deletePersonaGroup, params)
//         return {
//           ...req
//         }
//       },
//       invalidatesTags: [{ type: 'PersonaGroup' }]
//     }),
//     // Persona
//     addPersona: build.mutation<Persona, RequestPayload>({
//       query: ( { params, payload }) => {
//         const req = createHttpRequest(PersonaUrls.addPersona, params)
//         return {
//           ...req,
//           body: payload
//         }
//       },
//       invalidatesTags: [{ type: 'Persona' }]
//     }),
//     getPersonaList: build.query<TableResult<Persona>, RequestPayload>({
//       query: ({ params }) => {
//         const req = createHttpRequest(PersonaUrls.getPersonaList, params)
//         return {
//           ...req,
//           params
//         }
//       },
//       transformResponse (result: NewTableResult<Persona>) {
//         return transferToTableResult<Persona>(result)
//       },
//       providesTags: [{ type: 'Persona', id: 'LIST' }]
//     }),
//     getPersonaById: build.query<Persona, RequestPayload>({
//       query: ({ params }) => {
//         const req = createHttpRequest(PersonaUrls.getPersonaById, params)
//         return {
//           ...req
//         }
//       },
//       providesTags: [{ type: 'Persona', id: 'ID' }]
//     }),
//     listPersonaByGroupId: build.query<TableResult<Persona>, RequestPayload>({
//       query: ({ params, payload }) => {
//         const req = createHttpRequest(PersonaUrls.listPersonaByGroupId, params)
//         return {
//           ...req,
//           params,
//           payload
//         }
//       },
//       transformResponse (result: NewTableResult<Persona>) {
//         return transferToTableResult<Persona>(result)
//       },
//       providesTags: [
//         { type: 'Persona', id: 'LIST' },
//         { type: 'PersonaGroup', id: 'ID' }
//       ]
//     }),
//     searchPersonaList: build.query<TableResult<Persona>, RequestPayload>({
//       query: ({ params, payload }) => {
//         const req = createHttpRequest(PersonaUrls.searchPersonaList, params)
//         return {
//           ...req,
//           params,
//           body: payload
//         }
//       },
//       transformResponse (result: NewTableResult<Persona>) {
//         return transferToTableResult<Persona>(result)
//       },
//       providesTags: [{ type: 'Persona', id: 'LIST' }]
//     }),
//     updatePersona: build.mutation<Persona, RequestPayload>({
//       query: ({ params, payload }) => {
//         const req = createHttpRequest(PersonaUrls.updatePersona, params)
//         return {
//           ...req,
//           body: payload
//         }
//       },
//       invalidatesTags: [
//         { type: 'Persona' }
//       ]
//     }),
//     deletePersona: build.mutation({
//       query: ({ params }) => {
//         const req = createHttpRequest(PersonaUrls.deletePersona, params)
//         return {
//           ...req
//         }
//       },
//       invalidatesTags: [{ type: 'Persona' }]
//     }),
//     addPersonaDevices: build.mutation<PersonaDevice, RequestPayload>({
//       query: ({ params, payload }) => {
//         const req = createHttpRequest(PersonaUrls.addPersonaDevices, params)
//         return {
//           ...req,
//           body: payload
//         }
//       },
//       invalidatesTags: [{ type: 'Persona' }]
//     }),
//     deletePersonaDevices: build.mutation<PersonaDevice, RequestPayload>({
//       query: ({ params }) => {
//         const req = createHttpRequest(PersonaUrls.deletePersonaDevices, params)
//         return {
//           ...req
//         }
//       },
//       invalidatesTags: [{ type: 'Persona' }]
//     })
  })
})

export const {
  useGetTemplateScopeByIdQuery
} = msgTemplateApi