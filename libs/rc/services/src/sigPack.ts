import {
  ApplicationPolicyMgmt,
  createHttpRequest,
  downloadFile,
  onSocketActivityChanged,
  RequestPayload,
  SigPackUrlsInfo,
  TxStatus
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
      providesTags: [{ type: 'SigPack', id: 'LIST' }]
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
              : ('SIGPACK_' + params?.type + '.csv')
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
    updateSigPack: build.mutation<{ [key:string]:string }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SigPackUrlsInfo.updateSigPack, params)
        return {
          ...req,
          body: payload
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          if(msg.status === TxStatus.SUCCESS){
            api.dispatch(sigPackApi.util.invalidateTags([{ type: 'SigPack', id: 'LIST' }]))
          }
        })
      }
    })
  })
})
export const {
  useGetSigPackQuery,
  useLazyGetSigPackQuery,
  useExportAllSigPackMutation,
  useExportSigPackMutation,
  useUpdateSigPackMutation
} = sigPackApi
