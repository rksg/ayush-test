import { useState } from 'react'

import { gql } from 'graphql-request'
import _       from 'lodash'

import { formattedPath }             from '@acx-ui/analytics/utils'
import { TableProps }                from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { intentAIApi }               from '@acx-ui/store'
import {
  getIntl,
  NetworkPath,
  computeRangeFilter,
  TABLE_DEFAULT_PAGE_SIZE
}                                                   from '@acx-ui/utils'
import type { PathFilter } from '@acx-ui/utils'

import { states, codes, StatusTrail, aiFeaturesLabel } from './config'
import { statuses, statusReasons }                     from './states'

type Intent = {
  id: string
  code: string
  status: statuses
  displayStatus: statusReasons
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
  type: string
  category: string
  status: string
  statusTooltip: string
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

const getStatusTooltip = (state: statusReasons, sliceValue: string, metadata: Metadata) => {
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
              status
              statusReason
              displayStatus
              createdAt
              updatedAt
              sliceType
              sliceValue
              metadata
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
            status: $t(states[displayStatus].text),
            statusTooltip: getStatusTooltip(displayStatus, sliceValue, { ...metadata, updatedAt })
          } as (IntentListItem))
          return intents
        }, [] as Array<IntentListItem>)
        return { intents: items, total: response.intents.total }
      },
      providesTags: [{ type: 'Monitoring', id: 'INTENT_AI_LIST' }]
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
        const displayStatuses = statuses.map(({ label, id }) => ({
          value: $t(states[label as unknown as keyof typeof states].text),
          key: id
        })).sort((a, b) => a.value.localeCompare(b.value))

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
      providesTags: [{ type: 'Monitoring', id: 'INTENT_AI_FILTER_OPTIONS' }]
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
type Filters = {
  sliceValue: string[] | undefined
  category: string[] | undefined
  aiFeature: string[] | undefined
  status: string[] | undefined
}
const perpareFilterBy = (filters: Filters) => {
  const { $t } = getIntl()
  const { sliceValue, category, aiFeature, status } = filters
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
  if(status) {
    // concat status and statusReason
    const col = 'concat_ws(\'-\', status, "statusReason")'
    filterBy.push({ col, values: status })
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
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION)
  const [filters, setFilters] = useState<Filters>({
    sliceValue: undefined,
    category: undefined,
    aiFeature: undefined,
    status: undefined
  })
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
    setFilters(customFilter as Filters)
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
  useIntentFilterOptionsQuery
} = api
