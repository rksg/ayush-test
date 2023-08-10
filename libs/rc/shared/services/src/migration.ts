import {
  onSocketActivityChanged,
  onActivityMessageReceived,
  TableResult,
  MigrationUrlsInfo,
  CommonResult,
  RequestFormData,
  TaskContextType,
  ZdConfigurationType,
  MigrationResultType
} from '@acx-ui/rc/utils'
import { baseMigrationApi }                    from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

export const migrationApi = baseMigrationApi.injectEndpoints({
  endpoints: (build) => ({
    uploadZdConfig: build.mutation<TaskContextType, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MigrationUrlsInfo.uploadZdConfig, params, {
          ...ignoreErrorModal,
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
    addZdMigration: build.mutation<TaskContextType, RequestPayload>({
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
    getZdMigrationList: build.query<TaskContextType[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MigrationUrlsInfo.getZdMigrationList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Migration', id: 'LIST' }],
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
    getMigrationResult: build.query<TaskContextType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MigrationUrlsInfo.getMigrationResult, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Migration', id: 'LIST' }]
    }),
    getPollingMigrationResult: build.query<TableResult<MigrationResultType>, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MigrationUrlsInfo.getMigrationResult, params)
        return {
          ...req
        }
      },
      transformResponse (result: TaskContextType) {
        return {
          data: result.apImportResults,
          page: 1,
          totalCount: result.apImportResults.length
        } as TableResult<MigrationResultType>
      }
    }),
    deleteMigration: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MigrationUrlsInfo.deleteMigration, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Migration', id: 'LIST' }]
    }),
    getZdConfigurationList: build.query<TableResult<TaskContextType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MigrationUrlsInfo.getZdConfigurationList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Migration', id: 'LIST' }],
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
    getZdConfiguration: build.query<ZdConfigurationType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MigrationUrlsInfo.getZdConfiguration, params)
        return {
          ...req
        }
      }
    })
  })
})

export const {
  useUploadZdConfigMutation,
  useAddZdMigrationMutation,
  useGetZdMigrationListQuery,
  useGetMigrationResultQuery,
  useLazyGetMigrationResultQuery,
  useGetPollingMigrationResultQuery,
  useDeleteMigrationMutation,
  useGetZdConfigurationListQuery,
  useGetZdConfigurationQuery,
  useLazyGetZdConfigurationQuery
} = migrationApi
