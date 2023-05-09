import {
  ApplicationPolicyMgmt,
  createHttpRequest,
  downloadFile,
  RequestPayload,
  SigPackUrlsInfo
} from '@acx-ui/rc/utils'
import { baseSigPackApi } from '@acx-ui/store'
export const sigPackApi = baseSigPackApi.injectEndpoints({
  endpoints: (build) => ({
    getSigPack: build.query<ApplicationPolicyMgmt, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SigPackUrlsInfo.getSigPack, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SigPack', id: 'SIGPACK' }]
    }),
    exportAllSigPack: build.mutation<Blob, RequestPayload>({
      query: () => {
        const req = createHttpRequest(SigPackUrlsInfo.exportAllSigPack)
        return {
          ...req,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'SIGPACK_All.csv'
            downloadFile(response, fileName)
          },
          headers: {
            ...req.headers,
            'Content-Type': 'text/csv',
            'Accept': 'text/csv'
          }
        }
      }
    }),
    exportSigPack: build.mutation<Blob, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SigPackUrlsInfo.exportSigPack, params)
        return {
          ...req,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : ('SIGPACK_'+'a'+'.csv')
            downloadFile(response, fileName)
          },
          headers: {
            ...req.headers,
            'Content-Type': 'text/csv',
            'Accept': 'text/csv'
          }
        }
      }
    }),
    updateSigPack: build.mutation<ApplicationPolicyMgmt, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SigPackUrlsInfo.updateSigPack, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SigPack', id: 'SIGPACK' }]
    })
  })
})
export const {
  useGetSigPackQuery,
  useExportAllSigPackMutation,
  useExportSigPackMutation,
  useUpdateSigPackMutation
} = sigPackApi
