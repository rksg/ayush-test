import { QueryReturnValue, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'
import _                                                             from 'lodash'

import {
  ActionBase,
  ActionType,
  ApiVersionEnum,
  CommonResult,
  createNewTableHttpRequest,
  FileDto,
  GenericActionData,
  GetApiVersionHeader,
  ImageUrl,
  NewAPITableResult,
  NewTableResult,
  onActivityMessageReceived,
  onSocketActivityChanged,
  RequestFormData,
  SplitOption,
  TableChangePayload,
  TableResult,
  transferNewResToTableResult,
  transferToNewTablePaginationParams,
  TxStatus,
  UIConfiguration,
  Workflow,
  WorkflowActionDefinition,
  WorkflowStep,
  WorkflowUrls,
  FileDownloadResponse
} from '@acx-ui/rc/utils'
import { baseWorkflowApi }                               from '@acx-ui/store'
import { MaybePromise }                                  from '@acx-ui/types'
import { RequestPayload }                                from '@acx-ui/types'
import { batchApi, createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

import { CommonAsyncResponse } from './common'
import { commonQueryFn }       from './servicePolicy.utils'


export interface ActionQueryCriteria {
  name?: string,
  description?: string,
  actionType?: ActionType,
  version?: string,
  sortFields?: string[],
  page?: number,
  pageSize?: number
}

export const workflowApi = baseWorkflowApi.injectEndpoints({
  endpoints: build => ({
    /** Workflow Management */
    // eslint-disable-next-line max-len
    addWorkflow: build.mutation<CommonAsyncResponse, RequestPayload<Workflow> & { callback?: (response: CommonAsyncResponse) => void }>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WorkflowUrls.createWorkflow, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Workflow', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded

            if (response.data.requestId === msg.requestId
              && msg.status === 'SUCCESS'
              && msg.useCase === 'CREATE_WORKFLOW') {
              requestArgs.callback?.(response.data)
            }
          } catch { }
        })
      }
    }),
    cloneWorkflow: build.mutation({
      query: ({ params }) => {
        const req = createHttpRequest(WorkflowUrls.cloneWorkflow, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Workflow' }]
    }),
    nestedCloneWorkflow: build.mutation({
      query: ({ params }) => {
        const req = createHttpRequest(WorkflowUrls.nestedCloneWorkflow, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Workflow' }, { type: 'Step' }]
    }),
    deleteWorkflow: build.mutation({
      query: ({ params }) => {
        const req = createHttpRequest(WorkflowUrls.deleteWorkflow, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Workflow' }]
    }),
    deleteWorkflows: build.mutation<CommonResult, RequestPayload<string[]>>({
      queryFn: async ({ payload }, _queryApi, _extraOptions, fetchWithBQ) => {
        const requests = payload!.map(id => ({ params: { id } }))
        await batchApi(WorkflowUrls.deleteWorkflow, requests, fetchWithBQ)
        return { data: {} as CommonResult }
      },
      invalidatesTags: [{ type: 'Workflow' }]
    }),
    getWorkflowById: build.query<Workflow, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WorkflowUrls.getWorkflowDetail, params)
        return {
          ...req
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UPDATE_WORKFLOW',
            'INITIATE_PUBLISH_WORKFLOW',
            'DELETE_WORKFLOW'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Workflow', id: 'ID' }
            ]))
          })
        })
      },
      keepUnusedDataFor: 0,
      providesTags: [
        { type: 'Workflow', id: 'ID' }
      ]
    }),
    // eslint-disable-next-line max-len
    updateWorkflow: build.mutation<CommonAsyncResponse, RequestPayload<Workflow> & { callback?: () => void }>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WorkflowUrls.updateWorkflow, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Workflow', id: 'ID' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded
            if (response.data.requestId === msg.requestId
              && msg.status === 'SUCCESS'
              && (msg.useCase === 'INITIATE_PUBLISH_WORKFLOW' ||
                msg.useCase === 'UPDATE_WORKFLOW' ||
                msg.useCase === 'INITIATE_UPDATE_AND_PUBLISH_WORKFLOW')) {
              requestArgs.callback?.()
            }
          } catch { }
        })
      }
    }),
    updateWorkflowIgnoreErrors: build.mutation<CommonAsyncResponse, RequestPayload<Workflow>
      & { callback?: () => void }>({
        query: ({ params, payload }) => {
          const req =
            createHttpRequest(WorkflowUrls.updateWorkflow, params, { ...ignoreErrorModal })
          return {
            ...req,
            body: JSON.stringify(payload)
          }
        }
      }),
    searchWorkflowList: build.query<TableResult<Workflow>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: WorkflowUrls.searchWorkflows,
          params,
          payload: payload as TableChangePayload
        })

        return {
          ...req,
          body: JSON.stringify({
            ...Object.assign({}, payload),
            ...transferToNewTablePaginationParams (payload as TableChangePayload)
          })
        }
      },
      transformResponse (result: NewAPITableResult<Workflow>) {
        return transferNewResToTableResult<Workflow>(result)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'CREATE_WORKFLOW',
            'UPDATE_WORKFLOW',
            'DELETE_WORKFLOW',
            'INITIATE_PUBLISH_WORKFLOW',
            'CLONE_WORKFLOW',
            'IMPORT_WORKFLOW'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Workflow', id: 'LIST' }
            ]))
          })
        })
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Workflow', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    searchWorkflowsVersionList: build.query<Workflow[], RequestPayload>({
      async queryFn ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) {
        const ids = payload as string[]
        // eslint-disable-next-line max-len
        const promises: MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>[] = []
        const result:Workflow[] = []
        ids.forEach(id => promises.push(
          fetchWithBQ({ ...createNewTableHttpRequest({
            apiInfo: WorkflowUrls.searchWorkflows,
            params: { ...params, id: id },
            payload: payload as TableChangePayload
          }),
          body: JSON.stringify({
            ...Object.assign({}, payload),
            ...transferToNewTablePaginationParams (payload as TableChangePayload)
          })
          })))
        const responses = await Promise.all(promises)
        responses.forEach(res => {
          if (res.data) {
            const data = res.data as NewTableResult<Workflow>
            if (data.content) {
              data.content.forEach(workflow => result.push(_.cloneDeep(workflow)))
            }
          }
        })

        return { data: result }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'CREATE_WORKFLOW',
            'UPDATE_WORKFLOW',
            'DELETE_WORKFLOW',
            'INITIATE_PUBLISH_WORKFLOW'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Workflow', id: 'LIST' }
            ]))
          })
        })
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Workflow', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    searchInProgressWorkflowList: build.query<TableResult<Workflow>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: WorkflowUrls.searchInProgressWorkflows,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req,
          body: JSON.stringify({
            ...Object.assign({}, payload),
            ...transferToNewTablePaginationParams (payload as TableChangePayload)
          })
        }
      },
      transformResponse (result: NewAPITableResult<Workflow>) {
        return transferNewResToTableResult<Workflow>(result)
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'CREATE_WORKFLOW',
            'UPDATE_WORKFLOW',
            'DELETE_WORKFLOW',
            'INITIATE_PUBLISH_WORKFLOW',
            'CLONE_WORKFLOW',
            'IMPORT_WORKFLOW'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Workflow', id: 'LIST' }
            ]))
          })
        })
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Workflow', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getUIConfiguration: build.query<UIConfiguration, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WorkflowUrls.getWorkflowUIConfig, params)
        return {
          ...req
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UPDATE_WORKFLOW',
            'DELETE_WORKFLOW'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'WorkflowUIConfig', id: 'ID' }
            ]))
          })
        })
      },
      keepUnusedDataFor: 0,
      providesTags: [
        { type: 'WorkflowUIConfig', id: 'ID' }
      ],
      extraOptions: { maxRetries: 5 }
    }),
    updateUIConfiguration: build.mutation<UIConfiguration, RequestPayload>({
      query: ({ params, payload }) => {
        const header = { ...GetApiVersionHeader(ApiVersionEnum.v1), 'Content-Type': undefined }
        const req = createHttpRequest(WorkflowUrls.updateWorkflowUIConfig, params, header)
        return {
          ...req,
          body: payload,
          formData: true
        }
      },
      invalidatesTags: [{ type: 'WorkflowUIConfig', id: 'ID' }]
    }),
    resetUIConfiguration: build.mutation({
      query: ({ params }) => {
        const req = createHttpRequest(WorkflowUrls.resetWorkflowUIConfig, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'WorkflowUIConfig', id: 'ID' }]
    }),
    getUIConfigurationLogoImage: build.query<ImageUrl, RequestPayload>({
      query: ({ params }) => {
        const header = GetApiVersionHeader(ApiVersionEnum.v1)
        const param = { ...params, imageType: 'logoImages' }
        const req = createHttpRequest(WorkflowUrls.getWorkflowUIConfigImage, param, header)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0
    }),
    getUIConfigurationBackgroundImage: build.query<ImageUrl, RequestPayload>({
      query: ({ params }) => {
        const header = GetApiVersionHeader(ApiVersionEnum.v1)
        const param = { ...params, imageType: 'backgroundImages' }
        const req = createHttpRequest(WorkflowUrls.getWorkflowUIConfigImage, param, header)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0
    }),
    getUIConfigurationIconImage: build.query<ImageUrl, RequestPayload>({
      query: ({ params }) => {
        const header = GetApiVersionHeader(ApiVersionEnum.v1)
        const param = { ...params, imageType: 'iconImages' }
        const req = createHttpRequest(WorkflowUrls.getWorkflowUIConfigImage, param, header)
        return {
          ...req
        }
      },
      keepUnusedDataFor: 0
    }),
    /** Workflow Action Definitions */
    getWorkflowActionDefinitionList:
      build.query<NewTableResult<WorkflowActionDefinition>, RequestPayload>({
        query: ({ params }) => {
          return {
            ...createHttpRequest(WorkflowUrls.getWorkflowActionDefinitions, params)
          }
        }
      }),
    // eslint-disable-next-line max-len
    getWorkflowActionRequiredDefinitions: build.query<NewTableResult<WorkflowActionDefinition> ,RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(WorkflowUrls.getWorkflowActionRequiredDefinitions, params)
        }
      }
    }),

    /** Workflow Step API */
    createWorkflowStep: build.mutation<WorkflowStep, RequestPayload>({
      query: commonQueryFn(WorkflowUrls.createWorkflowStep),
      invalidatesTags: [{ type: 'Step' }]
    }),

    createWorkflowChildStep: build.mutation<WorkflowStep, RequestPayload>({
      query: commonQueryFn(WorkflowUrls.createWorkflowChildStep),
      invalidatesTags: [{ type: 'Step' }]
    }),

    deleteWorkflowStepById: build.mutation({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.deleteWorkflowStep, params)
      },
      invalidatesTags: [{ type: 'Step' }]
    }),

    deleteWorkflowStepByIdV2: build.mutation({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.deleteWorkflowStep, params,
          { Accept: 'application/vnd.ruckus.v2+json' }
        )
      },
      invalidatesTags: [{ type: 'Step' }]
    }),

    deleteWorkflowStepAndDescendantsById: build.mutation({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.deleteWorkflowStepAndDescendants, params)
      },
      invalidatesTags: [{ type: 'Step' }]
    }),

    getWorkflowStepsById: build.query<NewAPITableResult<WorkflowStep>, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getWorkflowStepsById, params)
      },
      providesTags: [{ type: 'Step', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'CREATE_STEP',
            'DELETE_STEP',
            'IMPORT_WORKFLOW'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Step' }
            ]))
          })
        })
      }
    }),
    getWorkflowStepById: build.query<WorkflowStep, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getWorkflowStepById, params)
      },
      providesTags: [{ type: 'Step', id: 'ID' }]
    }),

    /** Workflow SplitOptions API */
    createWorkflowStepUnderOption: build.mutation<WorkflowStep, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(WorkflowUrls.createWorkflowStepUnderOption, params),
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Step' }]
    }),
    createSplitOption: build.mutation<SplitOption, RequestPayload>({
      query: commonQueryFn(WorkflowUrls.createWorkflowOption),
      invalidatesTags: [{ type: 'Step' }]
    }),
    getSplitOptionById: build.query<SplitOption, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getWorkflowStepById, params)
      },
      providesTags: [{ type: 'Step' }]
    }),
    getSplitOptionsByStepId: build.query<NewTableResult<SplitOption>, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getWorkflowOptionsByStepId, params)
      },
      providesTags: [{ type: 'Step' }]
    }),
    deleteSplitOptionById: build.mutation({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.deleteSplitOptionById, params)
      },
      invalidatesTags: [{ type: 'Step' }]
    }),


    /** Workflow Actions API */
    uploadFile: build.mutation<FileDto, RequestFormData>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(WorkflowUrls.uploadFile, params,
            { 'Content-Type': undefined }),
          body: payload
        }
      } }),
    deleteFile: build.mutation({
      query: ({ params }) => {
        return {
          ...createHttpRequest(WorkflowUrls.deleteFile, params)
        }
      }
    }),
    getFile: build.query<FileDownloadResponse, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getFile, params)
      }
    }),
    // eslint-disable-next-line max-len
    createAction: build.mutation<CommonAsyncResponse, RequestPayload & { onSuccess?: (response: CommonAsyncResponse) => void, onError?: () => void }>({
      query: commonQueryFn(WorkflowUrls.createAction),
      invalidatesTags: [{ type: 'Action', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded

            if (response.data.requestId === msg.requestId
              && msg.useCase === 'CREATE_WORKFLOW_ACTION') {
              if (msg.status === TxStatus.SUCCESS) {
                requestArgs.onSuccess?.(response.data)
              } else if (msg.status === TxStatus.FAIL) {
                requestArgs?.onError?.()
              }
            }
          } catch {
            requestArgs?.onError?.()
          }
        })
      }
    }),
    getActionById: build.query<GenericActionData, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getActionById, params)
      },
      providesTags: [{ type: 'Action', id: 'ID' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UPDATE_WORKFLOW_ACTION'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Action', id: 'ID' }
            ]))
          })
        })
      }
    }),
    searchActions: build.query<NewTableResult<ActionBase>, RequestPayload<ActionQueryCriteria>>({
      query: commonQueryFn(WorkflowUrls.queryActions),
      providesTags: [{ type: 'Action', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UPDATE_WORKFLOW_ACTION'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Action', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getAllActionsByType: build.query<NewTableResult<ActionBase>, RequestPayload>({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.getAllActionsByType, params)
      },
      providesTags: [{ type: 'Action', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'CREATE_WORKFLOW_ACTION',
            'UPDATE_WORKFLOW_ACTION'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(workflowApi.util.invalidateTags([
              { type: 'Action', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    patchAction: build.mutation<GenericActionData, RequestPayload>({
      query: commonQueryFn(WorkflowUrls.patchAction),
      invalidatesTags: [{ type: 'Action' }]
    }),
    deleteActionById: build.mutation({
      query: ({ params }) => {
        return createHttpRequest(WorkflowUrls.deleteAction, params)
      },
      invalidatesTags: [{ type: 'Action', id: 'LIST' }]
    })
  })
})

export const {
  useAddWorkflowMutation,
  useDeleteWorkflowMutation,
  useDeleteWorkflowsMutation,
  useGetWorkflowByIdQuery,
  useLazyGetWorkflowByIdQuery,
  useUpdateWorkflowMutation,
  useUpdateWorkflowIgnoreErrorsMutation,
  useSearchWorkflowListQuery,
  useLazySearchWorkflowListQuery,
  useSearchInProgressWorkflowListQuery,
  useLazySearchInProgressWorkflowListQuery,
  useLazySearchWorkflowsVersionListQuery,
  useGetUIConfigurationQuery,
  useLazyGetUIConfigurationQuery,
  useUpdateUIConfigurationMutation,
  useLazyGetUIConfigurationLogoImageQuery,
  useLazyGetUIConfigurationBackgroundImageQuery,
  useCloneWorkflowMutation,
  useNestedCloneWorkflowMutation
} = workflowApi

export const {
  useGetWorkflowActionDefinitionListQuery,
  useGetWorkflowActionRequiredDefinitionsQuery,
  useLazyGetWorkflowActionRequiredDefinitionsQuery
} = workflowApi

export const {
  useCreateWorkflowStepMutation,
  useCreateWorkflowChildStepMutation,
  useGetWorkflowStepByIdQuery,
  useGetWorkflowStepsByIdQuery,
  useLazyGetWorkflowStepsByIdQuery,
  useDeleteWorkflowStepByIdMutation,
  useDeleteWorkflowStepByIdV2Mutation,
  useDeleteWorkflowStepAndDescendantsByIdMutation,
  useCreateSplitOptionMutation,
  useCreateWorkflowStepUnderOptionMutation,
  useGetSplitOptionsByStepIdQuery,
  useGetSplitOptionByIdQuery,
  useDeleteSplitOptionByIdMutation
} = workflowApi

export const {
  useCreateActionMutation,
  useLazySearchActionsQuery,
  useGetActionByIdQuery,
  useLazyGetActionByIdQuery,
  useGetAllActionsByTypeQuery,
  usePatchActionMutation,
  useDeleteActionByIdMutation,
  useUploadFileMutation,
  useDeleteFileMutation,
  useLazyGetFileQuery
} = workflowApi
