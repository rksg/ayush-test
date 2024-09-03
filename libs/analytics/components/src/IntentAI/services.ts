import { useState } from 'react'

import { gql } from 'graphql-request'
import _       from 'lodash'

import { formattedPath }             from '@acx-ui/analytics/utils'
import { TableProps }                from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { intentAIApi }               from '@acx-ui/store'
import {
  getIntl,
  computeRangeFilter,
  TABLE_DEFAULT_PAGE_SIZE,
  useEncodedParameter
}                                                   from '@acx-ui/utils'
import type { PathFilter } from '@acx-ui/utils'

import { states, codes, aiFeaturesLabel, groupedStates, IntentListItem, Intent, failureCodes } from './config'
import { DisplayStates }                                                                       from './states'
import {
  Actions,
  IntentWlan,
  parseTransitionGQLByAction,
  TransitionIntentItem } from './utils'

type Metadata = {
  failures?: (keyof typeof failureCodes)[]
  scheduledAt?: string
  updatedAt?: string
  oneClickOptimize?: boolean
  scheduledBy?: string
}

export type HighlightItem = {
  new: number
  active: number
}

export type IntentHighlight = {
  rrm?: HighlightItem
  airflex?: HighlightItem
  ops?: HighlightItem
}

const getStatusTooltip = (state: DisplayStates, sliceValue: string, metadata: Metadata) => {
  const { $t } = getIntl()

  const stateConfig = states[state]

  const errMsg: string = metadata.failures?.map(failure => {
    return failureCodes[failure] ? $t(failureCodes[failure]) : failure
  }).join('\n - ') || ''

  return $t(stateConfig.tooltip, {
    errorMessage: `\n - ${errMsg}\n\n`,
    scheduledAt: formatter(DateFormatEnum.DateTimeFormat)(metadata.scheduledAt),
    zoneName: sliceValue
    // userName: metadata.scheduledBy //TODO: scheduledBy is ID, how to get userName for R1 case?
    // newConfig: metadata.newConfig //TODO: how to display newConfig?
  })
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
          $startDate: DateTime, $endDate: DateTime, $path: [HierarchyNodeInput],
          $filterBy: JSON, $page: Int, $pageSize: Int
        ) {
          intents(
            start: $startDate, end: $endDate, path: $path,
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
          ...computeRangeFilter({
            dateFilter: _.pick(payload, ['startDate', 'endDate', 'range'])
          }),
          page: payload.page,
          pageSize: payload.pageSize,
          filterBy: payload.filterBy
        }
      }),
      transformResponse: (response: Response<Intent>) => {
        const { $t } = getIntl()
        const items = response.intents.data.reduce((intents, intent) => {
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
            statusLabel: states[displayStatus] ? $t(states[displayStatus].text) : displayStatus,
            statusTooltip: getStatusTooltip(displayStatus, sliceValue, { ...metadata, updatedAt })
          } as (IntentListItem))
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
          $startDate: DateTime
          $endDate: DateTime
          $path: [HierarchyNodeInput]
        ) {
          intentFilterOptions(
            start: $startDate
            end: $endDate
            path: $path
          ) {
            codes { id label }
            zones { id label }
            statuses { id label }
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
      transformResponse: (response: { intentFilterOptions: FilterOptions }) => {
        const { $t } = getIntl()
        const { codes: filterCodes, statuses, zones } = response.intentFilterOptions
        const aiFeatAndCat = filterCodes.reduce((data, { id }) => {
          const aiFeature = codes[id as keyof typeof codes].aiFeature
          const category = $t(codes[id as keyof typeof codes].category)
          !data.aiFeatures.includes(aiFeature) && data.aiFeatures.push(aiFeature)
          !data.categories.includes(category) && data.categories.push(category)
          return data
        }, { aiFeatures: [] as string[], categories: [] as string[] })

        const displayStatuses = statuses.reduce((data, { id, label }) => {
          const groupedState = groupedStates.find(({ states }) => states.includes(id as string))
          if (groupedState) {
            const found = data.find(({ value }) => value === $t(groupedState.group))
            if (!found) {
              data.push({ key: id, value: $t(groupedState.group) })
            } else { // state from same group
              found.key = `${found.key}+${id}`
            }
          } else {
            data.push(
              { key: id, value: $t(states[label as unknown as keyof typeof states].text) }
            )
          }
          return data
        }, [] as DisplayOption[])
          .sort((a, b) => a.value.localeCompare(b.value))

        const displayZones = zones.map(({ id, label }) => ({
          value: label,
          key: id
        })).sort((a, b) => a.value.localeCompare(b.value))
        return {
          aiFeatures: aiFeatAndCat.aiFeatures.map(
            aiFeature => ({
              value: $t(aiFeaturesLabel[aiFeature as keyof typeof aiFeaturesLabel]),
              key: aiFeature
            })).sort((a, b) => a.value.localeCompare(b.value)),
          categories: aiFeatAndCat.categories.map(
            category => ({
              value: category,
              key: category
            })).sort((a, b) => a.value.localeCompare(b.value)),
          statuses: displayStatuses,
          zones: displayZones
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
          $startDate: DateTime, $endDate: DateTime, $path: [HierarchyNodeInput]
        ) {
          highlights(start: $startDate, end: $endDate, path: $path) {
            rrm {
              new
              active
            }
            airflex {
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
          ...(_.pick(payload,['path'])),
          ...computeRangeFilter({
            dateFilter: _.pick(payload, ['startDate', 'endDate', 'range'])
          })
        }
      }),
      transformResponse: (response: { highlights: IntentHighlight }) =>
        response.highlights,
      providesTags: [{ type: 'Intent', id: 'INTENT_HIGHLIGHTS' }]
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
}
const perpareFilterBy = (filters: Filters) => {
  const { $t } = getIntl()
  const { sliceValue, category, aiFeature, statusLabel } = filters
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
  useTransitionIntentMutation,
  useIntentFilterOptionsQuery,
  useIntentHighlightQuery
} = api
