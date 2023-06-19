import {
  TableResult,
  PropertyUrlsInfo,
  ResidentPortal,
  NewTableResult,
  transferToTableResult,
  RequestFormData,
  createNewTableHttpRequest,
  TableChangePayload
} from '@acx-ui/rc/utils'
import { baseResidentPortalApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { createHttpRequest }     from '@acx-ui/utils'


export const residentPortalApi = baseResidentPortalApi.injectEndpoints({
  endpoints: (build) => ({
    getResidentPortalList: build.query<TableResult<ResidentPortal>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: PropertyUrlsInfo.getResidentPortalList,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req
        }
      },
      transformResponse (result: NewTableResult<ResidentPortal>) {
        return transferToTableResult<ResidentPortal>(result)
      },
      providesTags: [{ type: 'ResidentPortal', id: 'LIST' }]
    }),
    getQueriableResidentPortals: build.query<TableResult<ResidentPortal>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.getResidentPortalsQuery, params,
          { Accept: '*/*' })

        return {
          ...req,
          body: payload
        }
      },
      transformResponse (result: NewTableResult<ResidentPortal>) {
        return transferToTableResult<ResidentPortal>(result)
      },
      providesTags: [{ type: 'ResidentPortal', id: 'LIST' }]
    }),
    addResidentPortal: build.mutation<ResidentPortal, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.addResidentPortal, params,
          { 'Content-Type': undefined, 'Accept': '*/*' })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'ResidentPortal', id: 'LIST' }]
    }),
    getResidentPortal: build.query<ResidentPortal, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          PropertyUrlsInfo.getResidentPortal,
          params,
          { Accept: 'application/hal+json' })
        return {
          ...req
        }
      },
      providesTags: [{ type: 'ResidentPortal', id: 'ID' }]
    }),
    updateResidentPortal: build.mutation<ResidentPortal, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.patchResidentPortal, params,
          { 'Content-Type': undefined, 'Accept': '*/*' })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'ResidentPortal', id: 'LIST' }]
    }),
    deleteResidentPortalLogo: build.mutation<ResidentPortal, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(PropertyUrlsInfo.deleteResidentPortalLogo, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'ResidentPortal', id: 'ID' }]
    }),
    deleteResidentPortalFavicon: build.mutation<ResidentPortal, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(PropertyUrlsInfo.deleteResidentPortalFavicon, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'ResidentPortal', id: 'ID' }]
    }),
    deleteResidentPortals: build.mutation<ResidentPortal, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PropertyUrlsInfo.deleteResidentPortals, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'ResidentPortal', id: 'LIST' }]
    })
  })
})

export const {
  useGetResidentPortalListQuery,
  useGetQueriableResidentPortalsQuery,
  useLazyGetQueriableResidentPortalsQuery,
  useLazyGetResidentPortalListQuery,
  useAddResidentPortalMutation,
  useGetResidentPortalQuery,
  useUpdateResidentPortalMutation,
  useDeleteResidentPortalsMutation,
  useDeleteResidentPortalLogoMutation,
  useDeleteResidentPortalFaviconMutation
} = residentPortalApi
