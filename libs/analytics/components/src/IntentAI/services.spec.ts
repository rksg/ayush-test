/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { intentAIUrl, store, Provider }               from '@acx-ui/store'
import { act, mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import {
  intentListResult,
  filterOptions
} from './__tests__/fixtures'
import { IntentListItem, api, useIntentAITableQuery } from './services'

import type { TableCurrentDataSource } from 'antd/lib/table/interface'

describe('Intent services', () => {
  const expectedResult = [
    {
      ...intentListResult.intents.data[0],
      aiFeature: 'AI-Driven RRM',
      intent: 'Client Density vs. Throughput for 5 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
      status: 'Applied'
    },
    {
      ...intentListResult.intents.data[1],
      aiFeature: 'AI Operations',
      intent: 'Dynamic vs Static Channel capability on 2.4 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz34 (SZ Cluster)
> 01-US-CA-D1-Test-Home (Domain)
> 01-Alethea-WiCheck Test (Venue)`,
      status: 'No recommendation, Not enough license'
    },
    {
      ...intentListResult.intents.data[2],
      aiFeature: 'AI Operations',
      intent: 'Dynamic vs Static Channel capability on 2.4 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz34 (SZ Cluster)
> 25-US-CA-D25-SandeepKour-home (Domain)
> 25-US-CA-D25-SandeepKour-home (Venue)`,
      status: 'No recommendation, No APs'
    }
  ]
  const filterOptionsResult = {
    aiFeatures: [
      { value: 'AI Operations', key: 'AI Operations' },
      { value: 'AI-Driven RRM', key: 'AI-Driven RRM' }
    ],
    categories: [
      { value: 'Infrastructure', key: 'Infrastructure' },
      { value: 'Wi-Fi Experience', key: 'Wi-Fi Experience' }
    ],
    statuses: [
      { value: 'Applied', key: 'applied' },
      { value: 'No recommendation, No APs', key: 'na-no-aps' }
    ],
    zones: [
      {
        value: '01-Alethea-WiCheck Test',
        key: '01-Alethea-WiCheck Test'
      }, {
        key: 'zone',
        value: 'zone'
      }
    ]
  }

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  describe('useIntentAITableQuery', () => {
    it('should fetch data correctly', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
        data: intentListResult

      })
      mockGraphqlQuery(intentAIUrl, 'IntentAI', {
        data: filterOptions
      })
      const { result } = renderHook(useIntentAITableQuery, {
        wrapper: Provider,
        route: { params: { tenantId: '1' } }
      })
      await waitFor(() => expect(result.current.tableQuery.isSuccess).toBe(true))
      expect(result.current.tableQuery.data).toEqual({
        intents: expectedResult,
        total: 3
      })
      expect(result.current.filterOptions.data).toEqual(filterOptionsResult)
    })

    it('handlePageChange should update pagination', () => {
      mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
        data: intentListResult

      })
      mockGraphqlQuery(intentAIUrl, 'IntentAI', {
        data: filterOptions
      })
      const { result } = renderHook(useIntentAITableQuery, { wrapper: Provider })
      const customPagination = { current: 1, pageSize: 10 }
      act(() => {
        result.current.onPageChange(
          customPagination,
          { filter: null },
          [],
          [] as unknown as TableCurrentDataSource<IntentListItem>
        )
      })
      expect(result.current.pagination).toEqual({
        defaultPageSize: 10,
        page: 1,
        pageSize: 10,
        total: 0
      })
    })
    it('handleFilterChange should update filter', () => {
      mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
        data: intentListResult

      })
      mockGraphqlQuery(intentAIUrl, 'IntentAI', {
        data: filterOptions
      })
      const { result } = renderHook(useIntentAITableQuery, { wrapper: Provider })
      const customFilter = {
        sliceValue: ['1'],
        category: ['Wi-Fi Experience'],
        aiFeature: ['AI-Driven RRM'],
        status: ['new', 'na-no-aps']
      }
      act(() => {
        result.current.onFilterChange(customFilter, {})
      })
      expect(result.current.tableQuery.originalArgs?.filterBy).toEqual([
        { col: '"sliceId"', values: [ '1' ] },
        {
          col: 'code',
          values: [
            'c-bgscan24g-enable',
            'c-bgscan5g-enable',
            'c-bgscan24g-timer',
            'c-bgscan5g-timer',
            'c-bgscan6g-timer',
            'c-dfschannels-enable',
            'c-dfschannels-disable',
            'c-bandbalancing-enable',
            'c-bandbalancing-enable-below-61',
            'c-bandbalancing-proactive',
            'c-aclb-enable',
            'c-txpower-same',
            'c-crrm-channel24g-auto',
            'c-crrm-channel5g-auto',
            'c-crrm-channel6g-auto',
            'c-probeflex-24g',
            'c-probeflex-5g',
            'c-probeflex-6g'
          ]
        },
        {
          col: 'code',
          values: [
            'c-crrm-channel24g-auto',
            'c-crrm-channel5g-auto',
            'c-crrm-channel6g-auto'
          ]
        },
        { col: 'concat_ws(\'-\', status, "statusReason")', values: [ 'new', 'na-no-aps' ] }
      ])
    })
    it('handleFilterChange should handle no filter case', () => {
      mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
        data: intentListResult

      })
      mockGraphqlQuery(intentAIUrl, 'IntentAI', {
        data: filterOptions
      })
      const { result } = renderHook(useIntentAITableQuery, { wrapper: Provider })
      const customFilter = {
        sliceValue: null,
        category: null,
        aiFeature: null,
        status: null
      }
      act(() => {
        result.current.onFilterChange(customFilter, {})
      })
      expect(result.current.tableQuery.originalArgs?.filterBy).toEqual([])
    })
  })
})
