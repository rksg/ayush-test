import {
  ApplicationPolicyMgmt,
  ApplicationPolicyMgmtRbac,
  downloadFile,
  onSocketActivityChanged,
  SigPackUrlsInfo,
  Transaction,
  TxStatus
} from '@acx-ui/rc/utils'
import { baseSigPackApi } from '@acx-ui/store'
import { RequestPayload } from '@acx-ui/types'

import { commonQueryFn } from './servicePolicy.utils'
export const sigPackApi = baseSigPackApi.injectEndpoints({
  endpoints: (build) => ({
    getSigPack: build.query<ApplicationPolicyMgmt, RequestPayload>({
      query: commonQueryFn(SigPackUrlsInfo.getSigPack, SigPackUrlsInfo.getSigPackRbac),
      providesTags: [{ type: 'SigPack', id: 'LIST' }],
      // eslint-disable-next-line max-len
      transformResponse: (response: ApplicationPolicyMgmt | ApplicationPolicyMgmtRbac, _meta, arg: RequestPayload) => {
        if(arg.enableRbac) {
          // eslint-disable-next-line max-len
          const { version, updatedDate, releasedDate, ...rest } = response as ApplicationPolicyMgmtRbac
          return {
            ...rest,
            currentVersion: version,
            currentUpdatedDate: updatedDate,
            currentReleasedDate: releasedDate
          } as ApplicationPolicyMgmt
        }
        return response as ApplicationPolicyMgmt
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          if (isTriggerSigPackFinished(msg)) {
            api.dispatch(sigPackApi.util.invalidateTags([{ type: 'SigPack', id: 'LIST' }]))
          }
        })
      }
    }),
    exportAllSigPack: build.mutation<Blob, RequestPayload>({
      query: (queryArgs: RequestPayload) => {
        const query = commonQueryFn(
          SigPackUrlsInfo.exportAllSigPack,
          SigPackUrlsInfo.exportAllSigPackRbac
        )
        const req = query(queryArgs)
        return {
          ...req,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'SIGPACK_All.csv'
            downloadFile(response, fileName)
          }
        }
      }
    }),
    exportSigPack: build.mutation<Blob, RequestPayload>({
      query: (queryArgs: RequestPayload) => {
        const query = commonQueryFn(
          SigPackUrlsInfo.exportSigPack,
          SigPackUrlsInfo.exportSigPackRbac
        )
        const req = query(queryArgs)
        return {
          ...req,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : ('SIGPACK_' + queryArgs?.params?.type + '.csv')
            downloadFile(response, fileName)
          }
        }
      }
    }),
    updateSigPack: build.mutation<{ [key:string]: string }, RequestPayload>({
      query: commonQueryFn(SigPackUrlsInfo.updateSigPack, SigPackUrlsInfo.updateSigPackRbac)
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
  useExportAllSigPackMutation,
  useExportSigPackMutation,
  useUpdateSigPackMutation
} = sigPackApi
