import {
  onSocketActivityChanged,
  onActivityMessageReceived,
  ApiInfo,
  MigrationUrlsInfo,
  createHttpRequest,
  RequestPayload,
  RequestFormData,
  CommonResult,
  ImportErrorRes
} from '@acx-ui/rc/utils'
import { baseMigrationApi } from '@acx-ui/store'

export const migrationApi = baseMigrationApi.injectEndpoints({
  endpoints: (build) => ({
    getZdMigrationList: build.query<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MigrationUrlsInfo.getZdMigrationList, params)
        return {
          ...req,
          body: payload
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddZdMigration',
            'UpdateZdMigration',
            'DeleteZdMigration',
            'DeleteZdMigrations'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(migrationApi.util.invalidateTags([{ type: 'Migration', id: 'LIST' }]))
          })
        })
      }
    }),
    addZdMigrationOld: build.mutation<ImportErrorRes, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MigrationUrlsInfo.addZdMigration, params, {
          'Content-Type': undefined,
          'Accept': '*/*'
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Migration', id: 'LIST' }]
    }),
    addZdMigration: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MigrationUrlsInfo.addZdMigration, params, {
          'Content-Type': undefined,
          'Accept': '*/*'
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Migration', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded
            if (response && msg.useCase === 'ImportApsCsv'
            && ((msg.steps?.find((step) => {
              return step.id === 'PostProcessedImportAps'
            })?.status !== 'IN_PROGRESS'))) {
              (requestArgs.callback as Function)(response.data)
            }
          } catch {
          }
        })
      }
    }),
    migrateResult: build.query<ImportErrorRes, RequestPayload>({
      query: ({ params, payload }) => {
        const { requestId } = payload as { requestId: string }
        const api:ApiInfo = { ...MigrationUrlsInfo.getMigrateResult }
        api.url += `?requestId=${requestId}`
        const req = createHttpRequest(api, params)
        return {
          ...req
        }
      }
    })
  })
})

export const {
  useGetZdMigrationListQuery,
  useAddZdMigrationOldMutation,
  useAddZdMigrationMutation,
  useLazyMigrateResultQuery
} = migrationApi
