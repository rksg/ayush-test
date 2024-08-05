import { gql } from 'graphql-request'
import _       from 'lodash'

import { formattedPath }                            from '@acx-ui/analytics/utils'
import { DateFormatEnum, formatter }                from '@acx-ui/formatter'
import { intentAIApi }                              from '@acx-ui/store'
import { getIntl, NetworkPath, computeRangeFilter } from '@acx-ui/utils'
import type { PathFilter }                          from '@acx-ui/utils'

import { states, codes, StatusTrail, aiFeaturesLabel } from './config'
import { statuses, displayStates, statusReasons }      from './states'

type Intent = {
  id: string
  code: string
  status: statuses
  displayStatus: displayStates
  createdAt: string
  updatedAt: string
  sliceType: string
  sliceValue: string
  metadata: object
  path: NetworkPath
  idPath: NetworkPath
  statusTrail: StatusTrail
  trigger: string
}

export type IntentListItem = Intent & {
  aiFeature: string
  intent: string
  scope: string
  type?: string
  category: string
  status: string
  statusTooltip: string,
  preferences?: {
    crrmFullOptimization: boolean
  }
}

type Metadata = {
  error?: {
    message?: string
  }
  scheduledAt?: string
  updatedAt?: string
  oneClickOptimize?: boolean
  scheduledBy?: string
}

const getStatusTooltip = (state: displayStates, sliceValue: string, metadata: Metadata) => {
  const { $t } = getIntl()

  const stateConfig = states[state]
  return $t(stateConfig.tooltip, {
    errorMessage: metadata.error?.message,  //TODO: need to update error message logics after ETL finalizes metadata.failures
    scheduledAt: formatter(DateFormatEnum.DateTimeFormat)(metadata.scheduledAt),
    zoneName: sliceValue
    // userName: metadata.scheduledBy //TODO: scheduledBy is ID, how to get userName for R1 case?
    // newConfig: metadata.newConfig //TODO: how to display newConfig?
  })
}

type IntentWlan = {
  name: string
  ssid: string
}

type OptimizeAllMetadata = {
  scheduledAt: string
  wlans?: IntentWlan[]
  preferences?: {
    crrmFullOptimization: boolean
  }
}

export type OptimizeAllItemMutationPayload = {
  id: string
  metadata: OptimizeAllMetadata
}
type MutationResponse = { success: boolean, errorMsg: string, errorCode: string }

interface OptimizeAllMutationPayload {
  optimizeList: OptimizeAllItemMutationPayload[]
}

export type OptimizeAllMutationResponse = Record<string, MutationResponse>


const buildTransitionGQL = (index:number) => `t${index}: transition(
  id: $id${index}, status: $status${index}, 
  statusReason: $statusReason${index}, metadata: $metadata${index}) {
    success
    errorMsg
    errorCode
  }`

export const parseTransitionGQL = (optimizeList:OptimizeAllItemMutationPayload[]) => {
  const status = 'applyscheduled'
  const statusReason = statusReasons.oneClick
  const paramsGQL:string[] = []
  const transitionsGQLs:string[] = []
  const variables:Record<string, string|OptimizeAllMetadata> = {}
  optimizeList.forEach((item, index) => {
    const currentIndex = index + 1
    const { id, metadata } = item
    paramsGQL.push(
      `$id${currentIndex}:String!, $status${currentIndex}:String!, \n
      $statusReason${currentIndex}:String, $metadata${currentIndex}:JSON`
    )
    transitionsGQLs.push(buildTransitionGQL(currentIndex))
    variables[`id${currentIndex}`] = id
    variables[`status${currentIndex}`] = status
    variables[`statusReason${currentIndex}`] = statusReason
    variables[`metadata${currentIndex}`] = metadata
  })
  return { paramsGQL,transitionsGQLs, variables } as {
    paramsGQL:string[],
    transitionsGQLs:string[],
    variables: Record<string, string|OptimizeAllMetadata> }
}

export const api = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentAIList: build.query<
      IntentListItem[],
      PathFilter
    >({
      query: (payload) => ({
        document: gql`
        query IntentAIList(
          $startDate: DateTime, $endDate: DateTime, $path: [HierarchyNodeInput]
        ) {
          intents(start: $startDate, end: $endDate, path: $path) {
            id
            code
            status
            status_reason
            displayStatus
            createdAt
            updatedAt
            sliceType
            sliceValue
            metadata
            preferences
            path {
              type
              name
            }
            idPath {
              type
              name
            }
          }
        }
        `,
        variables: {
          ...(_.pick(payload,['path'])),
          ...computeRangeFilter({
            dateFilter: _.pick(payload, ['startDate', 'endDate', 'range'])
          })
        }
      }),
      transformResponse: (response: Response<Intent>) => {
        const { $t } = getIntl()
        const items = response.intents.reduce((intents, intent) => {
          const {
            id, path, sliceValue, code, displayStatus, metadata, updatedAt
          } = intent
          const detail = codes[code]
          detail && states[displayStatus] && intents.push({
            ...intent,
            id: id,
            aiFeature: $t(aiFeaturesLabel[detail.aiFeature]),
            intent: $t(detail.intent),
            scope: formattedPath(path, sliceValue),
            category: $t(detail.category),
            status: $t(states[displayStatus].text),
            statusTooltip: getStatusTooltip(displayStatus, sliceValue, { ...metadata, updatedAt })
          } as (IntentListItem))
          return intents
        }, [] as Array<IntentListItem>)
        return items
      },
      providesTags: [{ type: 'Monitoring', id: 'INTENT_AI_LIST' }]
    }),
    optimizeAllIntent: build.mutation<OptimizeAllMutationResponse, OptimizeAllMutationPayload>({
      query: ({ optimizeList }) => {
        const { paramsGQL, transitionsGQLs, variables } = parseTransitionGQL( optimizeList )
        return {
          document: gql`
          mutation OptimizeAll(
            ${paramsGQL.join(',')}
          ) {
            ${transitionsGQLs.join('\n')}
          }
        `,
          variables
        }
      },
      invalidatesTags: [
        { type: 'Monitoring', id: 'INTENT_AI_LIST' }
      ]
    })
  })
})

export interface Response<Intent> {
  intents: Intent[]
}

export const {
  useIntentAIListQuery,
  useOptimizeAllIntentMutation
} = api
