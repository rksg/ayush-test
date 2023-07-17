import {
  ApplicationPolicyMgmt,
  downloadFile,
  onSocketActivityChanged,
  SigPackUrlsInfo,
  Transaction,
  TxStatus
} from '@acx-ui/rc/utils'
import { baseSigPackApi }    from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'
export const sigPackApi = baseSigPackApi.injectEndpoints({
  endpoints: (build) => ({
    getSigPack: build.query<ApplicationPolicyMgmt, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SigPackUrlsInfo.getSigPack, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SigPack', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          if (isTriggerSigPackFinished(msg)) {
            api.dispatch(sigPackApi.util.invalidateTags([{ type: 'SigPack', id: 'LIST' }]))
          }
        })
      }
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
    updateSigPack: build.mutation<{ [key:string]: string }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SigPackUrlsInfo.updateSigPack, params)
        return {
          ...req,
          body: payload
        }
      }
    })
  })
})

function isTriggerSigPackFinished (tx: Transaction): boolean {
  const targetUseCase = 'TriggerApplicationLibraryAction'

  if (tx.useCase !== targetUseCase) return false

  const targetStep = tx.steps?.find(step => step.id === targetUseCase)

  return targetStep ? targetStep.status !== TxStatus.IN_PROGRESS : false
}

export const {
  useGetSigPackQuery,
  useLazyGetSigPackQuery,
  useExportAllSigPackMutation,
  useExportSigPackMutation,
  useUpdateSigPackMutation
} = sigPackApi
