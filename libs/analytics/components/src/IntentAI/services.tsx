import { useState } from 'react'
import React        from 'react'

import { gql }                             from 'graphql-request'
import _                                   from 'lodash'
import { defineMessage, FormattedMessage } from 'react-intl'

import { formattedPath }             from '@acx-ui/analytics/utils'
import { TableProps }                from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { intentAIApi }               from '@acx-ui/store'
import {
  getIntl,
  TABLE_DEFAULT_PAGE_SIZE,
  useEncodedParameter
}                                                   from '@acx-ui/utils'
import type { PathFilter } from '@acx-ui/utils'

import { getIntentStatus }      from './common/getIntentStatus'
import { richTextFormatValues } from './common/richTextFormatValues'
import {
  states,
  codes,
  aiFeaturesLabel,
  stateToGroupedStates,
  IntentListItem,
  Intent,
  failureCodes,
  Metadata,
  IntentWlan
} from './config'
import { DisplayStates }  from './states'
import {
  Actions,
  parseTransitionGQLByAction,
  TransitionIntentItem
} from './utils'

export type HighlightItem = {
  new: number
  active: number
}

export type IntentHighlight = {
  rrm?: HighlightItem
  probeflex?: HighlightItem
  ops?: HighlightItem
}

type IntentAPPayload = {
  code: string
  root: string
  sliceId: string
  search: string
}

export type IntentAP = {
  name: string
  mac: string
  model: string
  version: string
}

export const formatValues: typeof richTextFormatValues = {
  ...richTextFormatValues,
  p: (chunks) => <p>{chunks}</p>
}

const crrmRevertErrorDetail = defineMessage({
  defaultMessage: `{apName} ({apMac}){configKey, select,
    radio5gLower { on Lower 5 GHz}
    radio5gUpper { on Upper 5 GHz}
    other        {}
  }: {message}`
})

export const getStatusTooltip = (
  state: DisplayStates, sliceValue: string, metadata: Metadata) => {
  const { $t } = getIntl()
  const stateConfig = states[state] ?? { tooltip: defineMessage({ defaultMessage: 'Unknown' }) }

  let errMsg: JSX.Element
  if (String(metadata.failures?.at(0)).includes('Revert failed') && metadata.error?.details) {
    errMsg = <ul>
      {metadata.error.details.map((item, index) => <li
        key={index}
        children={$t(crrmRevertErrorDetail, { ...item } as typeof formatValues)}
      />)}
    </ul>
  } else {
    errMsg = <ul>
      {metadata.failures?.map(failure => <li
        key={failure}
        children={failureCodes[failure] ? $t(failureCodes[failure]) : failure}
      />)}
    </ul>
  }

  const values = {
    ...formatValues,
    zoneName: sliceValue,
    scheduledAt: formatter(DateFormatEnum.DateTimeFormat)(metadata.scheduledAt),
    errorMessage: errMsg,
    changedByName: metadata.changedByName
    // newConfig: metadata.newConfig //TODO: how to display newConfig?
  }

  return <FormattedMessage {...stateConfig.tooltip} values={values} />
}

type MutationResponse = { success: boolean, errorMsg: string, errorCode: string }

interface TransitionMutationPayload {
  action: Actions
  data: TransitionIntentItem[]
}

export type TransitionMutationResponse = Record<string, MutationResponse>

type Payload = PathFilter & {
  page: number
  pageSize: number
  filterBy: object
}
type FilterOption = {
  id: string
  label: string
}
type DisplayOption = {
  key: string
  value: string
}
type FilterOptions = {
  codes: FilterOption[]
  statuses: FilterOption[]
  zones: FilterOption[]
}
type TransformedFilterOptions = {
  aiFeatures: DisplayOption[]
  categories: DisplayOption[]
  statuses: DisplayOption[]
  zones: DisplayOption[]
  intents: DisplayOption[]
}
export const api = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    intentAIList: build.query<
      { intents:IntentListItem[], total: number },
      Payload
    >({
      query: (payload) => ({
        document: gql`
        query IntentAIList(
          $path: [HierarchyNodeInput],
          $filterBy: JSON, $page: Int, $pageSize: Int
        ) {
          intents(
            path: $path,
            filterBy: $filterBy, page: $page, pageSize: $pageSize
          ) {
            data {
              id
              code
              root
              status
              statusReason
              displayStatus
              createdAt
              updatedAt
              sliceType
              sliceValue
              sliceId
              metadata
              preferences
              statusTrail { status statusReason createdAt }
              path {
                type
                name
              }
              idPath {
                type
                name
              }
            }
            total
          }
        }
        `,
        variables: {
          ...(_.pick(payload,['path'])),
          page: payload.page,
          pageSize: payload.pageSize,
          filterBy: payload.filterBy
        }
      }),
      transformResponse: (response: Response<Intent>) => {
        const { $t } = getIntl()
        const items = response.intents.data.reduce((intents, intent) => {
          const {
            id, path, sliceValue, code, displayStatus
          } = intent
          const detail = codes[code]
          detail && states[displayStatus] && intents.push({
            ...intent,
            id: id,
            aiFeature: $t(aiFeaturesLabel[detail.aiFeature]),
            intent: $t(detail.intent),
            scope: formattedPath(path, sliceValue),
            category: $t(detail.category),
            statusLabel: states[displayStatus] ? getIntentStatus(displayStatus) : displayStatus
          } as IntentListItem)
          return intents
        }, [] as Array<IntentListItem>)
        return { intents: items, total: response.intents.total }
      },
      providesTags: [{ type: 'Intent', id: 'INTENT_AI_LIST' }]
    }),
    intentWlans: build.query<
      IntentWlan[],
      Partial<{ code: String, root: String, sliceId: String }>
    >({
      query: ({ code, root, sliceId }) => ({
        document: gql`
          query Wlans($code: String!, $root: String!, $sliceId: String!) {
            intent(code: $code, root: $root, sliceId: $sliceId) {
              wlans {
                name
                ssid
              }
            }
          }
        `,
        variables: { code, root, sliceId }
      }),
      providesTags: [{ type: 'Intent', id: 'INTENT_AI_WLANS' }],
      transformResponse: (response: { intent: { wlans: IntentWlan[] } }) =>
        response.intent.wlans
    }),
    transitionIntent: build.mutation<TransitionMutationResponse, TransitionMutationPayload>({
      query: ({ action, data }) => {
        const { paramsGQL, transitionsGQLs, variables } = parseTransitionGQLByAction(action, data)
        return {
          document: gql`
          mutation TransitionIntent(
            ${paramsGQL.join(',')}
          ) {
            ${transitionsGQLs.join('\n')}
          }
        `,
          variables
        }
      },
      invalidatesTags: [
        { type: 'Intent', id: 'INTENT_AI_LIST' },
        { type: 'Intent', id: 'INTENT_AI_FILTER_OPTIONS' }
      ]
    }),
    intentFilterOptions: build.query<TransformedFilterOptions, PathFilter>({
      query: (payload) => ({
        document: gql`
        query IntentAI(
          $path: [HierarchyNodeInput]
        ) {
          intentFilterOptions(
            path: $path
          ) {
            codes { id label }
            zones { id label }
            statuses { id label }
          }
        }
        `,
        variables: {
          ...(_.pick(payload,['path']))
        }
      }),
      transformResponse: (response: { intentFilterOptions: FilterOptions }) => {
        const { $t } = getIntl()
        const { codes: filterCodes, statuses, zones } = response.intentFilterOptions
        const { aiFeatures, categories, intents } = filterCodes.reduce((data, { id }) => {
          const aiFeature = codes[id as keyof typeof codes].aiFeature
          const category = $t(codes[id as keyof typeof codes].category)
          const intent = $t(codes[id as keyof typeof codes].intent)
          !data.intents.includes(intent) && data.intents.push(intent)
          !data.aiFeatures.includes(aiFeature) && data.aiFeatures.push(aiFeature)
          !data.categories.includes(category) && data.categories.push(category)
          return data
        }, { aiFeatures: [] as string[], categories: [] as string[], intents: [] as string[] })

        const displayStatuses = statuses.reduce((data, { id }) => {
          const stateKey = id as unknown as DisplayStates
          const groupedState = stateToGroupedStates[stateKey]
          const key = groupedState ? groupedState.key : id
          const value = groupedState ? $t(groupedState.group) : getIntentStatus(stateKey)
          if (!data.find(({ key: dataKey }) => dataKey === key)) data.push({ key, value })
          return data
        }, [] as DisplayOption[])
          .sort((a, b) => a.value.localeCompare(b.value))

        const displayZones = zones.map(({ id, label }) => ({
          value: label,
          key: id
        })).sort((a, b) => a.value.localeCompare(b.value))
        return {
          aiFeatures: aiFeatures.map(
            aiFeature => ({
              value: $t(aiFeaturesLabel[aiFeature as keyof typeof aiFeaturesLabel]),
              key: aiFeature
            })).sort((a, b) => a.value.localeCompare(b.value)),
          categories: categories.map(
            category => ({
              value: category,
              key: category
            })).sort((a, b) => a.value.localeCompare(b.value)),
          statuses: displayStatuses,
          zones: displayZones,
          intents: intents.map(
            intent => ({
              value: intent,
              key: intent
            })).sort((a, b) => a.value.localeCompare(b.value))
        }
      },
      providesTags: [{ type: 'Intent', id: 'INTENT_AI_FILTER_OPTIONS' }]
    }),
    intentHighlight: build.query<
      IntentHighlight,
      PathFilter & { selectedTenants?: string | null }
    >({
      query: (payload) => ({
        document: gql`
        query IntentHighlight(
          $path: [HierarchyNodeInput]
        ) {
          highlights(path: $path) {
            rrm {
              new
              active
            }
            probeflex {
              new
              active
            }
            ops {
              new
              active
            }
          }
        }
        `,
        variables: {
          ...(_.pick(payload,['path']))
        }
      }),
      transformResponse: (response: { highlights: IntentHighlight }) =>
        response.highlights,
      providesTags: [{ type: 'Intent', id: 'INTENT_HIGHLIGHTS' }]
    }),
    getAps: build.query<IntentAP[], IntentAPPayload>({
      query: (payload) => ({
        document: gql`
          query GetAps(
            $code: String!
            $root: String!
            $sliceId: String!
            $n: Int
            $search: String
          ) {
            intent(code: $code, root: $root, sliceId: $sliceId) {
              aps: aps(n: $n, search: $search) {
                name mac model version
              }
            }
          }
          `,
        variables: { ...payload, n: 100 }
      }),
      transformResponse: (response: { intent: { aps: IntentAP[] } }) =>
        response.intent.aps
    })
  })
})

export interface Response<Intent> {
  intents: {
    data: Intent[]
    total: number
  }
}

type Pagination = {
  page: number,
  pageSize: number,
  defaultPageSize: number,
  total: number
}
export type Filters = {
  sliceValue: string[] | undefined
  category: string[] | undefined
  aiFeature: string[] | undefined
  statusLabel: string[] | undefined
  intent: string[] | undefined
}
const perpareFilterBy = (filters: Filters) => {
  const { $t } = getIntl()
  const { sliceValue, category, aiFeature, statusLabel, intent } = filters
  let filterBy = []
  if (sliceValue) {
    filterBy.push({ col: '"sliceId"', values: sliceValue })
  }
  let catCodes = [] as string[]
  if(category) {
    // derive codes from category
    category.forEach(category => {
      const matchedCodes = Object.keys(codes).filter(key => $t(codes[key].category) === category)
      catCodes = catCodes.concat(matchedCodes)
    })
  }
  if(catCodes.length > 0) {
    filterBy.push({ col: 'code', values: catCodes })
  }
  let intentCodes = [] as string[]
  if(intent) {
    // derive codes from intent
    intent.forEach(intent => {
      const matchedCodes = Object.keys(codes).filter(key => $t(codes[key].intent) === intent)
      intentCodes = intentCodes.concat(matchedCodes)
    })
  }
  if(intentCodes.length > 0) {
    filterBy.push({ col: 'code', values: intentCodes })
  }
  let featCodes = [] as string[]
  if(aiFeature) {
    // derive codes from aiFeature
    aiFeature.forEach(aiFeature => {
      const matchedCodes = Object.keys(codes).filter(key => codes[key].aiFeature === aiFeature)
      featCodes = featCodes.concat(matchedCodes)
    })
  }
  if(featCodes.length > 0) {
    filterBy.push({ col: 'code', values: featCodes })
  }
  if(statusLabel) {
    const filterStates = [] as string[]
    statusLabel.forEach(st => {
      filterStates.push(...st.split('+'))
    })
    // concat status and statusReason
    const col = 'concat_ws(\'-\', status, "statusReason")'
    filterBy.push({ col, values: filterStates })
  }
  return filterBy

}
export function useIntentAITableQuery (filter: PathFilter) {
  const DEFAULT_PAGINATION = {
    page: 1,
    pageSize: TABLE_DEFAULT_PAGE_SIZE,
    defaultPageSize: TABLE_DEFAULT_PAGE_SIZE,
    total: 0
  }

  const intentTableFilters = useEncodedParameter<Filters>('intentTableFilters')
  const filters = intentTableFilters.read() || {}
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION)
  const handlePageChange: TableProps<IntentListItem>['onChange'] = (
    customPagination
  ) => {
    const paginationDetail = {
      page: customPagination.current,
      pageSize: customPagination.pageSize
    } as Pagination

    setPagination({ ...pagination, ...paginationDetail })
  }
  const handleFilterChange: TableProps<IntentListItem>['onFilterChange'] = (
    customFilter
  ) => {
    intentTableFilters.write(customFilter as Filters)
    setPagination(DEFAULT_PAGINATION)
  }
  return {
    tableQuery: useIntentAIListQuery(
      {
        ...filter,
        page: pagination.page,
        pageSize: pagination.pageSize,
        filterBy: perpareFilterBy(filters)
      }
    ),
    onPageChange: handlePageChange,
    onFilterChange: handleFilterChange,
    pagination,
    filterOptions: useIntentFilterOptionsQuery(filter)
  }
}
export const {
  useIntentAIListQuery,
  useLazyIntentWlansQuery,
  useIntentWlansQuery,
  useTransitionIntentMutation,
  useIntentFilterOptionsQuery,
  useIntentHighlightQuery,
  useGetApsQuery
} = api
