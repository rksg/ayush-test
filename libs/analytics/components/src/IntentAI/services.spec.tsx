/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { FormattedMessage } from 'react-intl'

import { defaultNetworkPath }                                              from '@acx-ui/analytics/utils'
import { intentAIUrl, store, Provider }                                    from '@acx-ui/store'
import { mockGraphqlQuery, mockGraphqlMutation, renderHook, act, waitFor } from '@acx-ui/test-utils'
import { render }                                                          from '@acx-ui/test-utils'
import { DateRange }                                                       from '@acx-ui/utils'

import {
  intentHighlights,
  intentListResult,
  filterOptions,
  intentListWithAllStatus
} from './__tests__/fixtures'
import { mockedIntentAps }          from './AIOperations/__tests__/mockedIZoneFirmwareUpgrade'
import { IntentListItem, Metadata } from './config'
import {
  api,
  useIntentAITableQuery,
  TransitionMutationResponse,
  IntentAP,
  formatValues,
  getStatusTooltip
} from './services'
import { DisplayStates, Statuses, StatusReasons } from './states'
import { Actions }                                from './utils'

import type { TableCurrentDataSource } from 'antd/lib/table/interface'

describe('getStatusTooltip', () => {
  it.each(intentListWithAllStatus.intents.data)(
    'returns correct tooltip for $displayStatus',
    (intent) => {
      const state = intent.displayStatus as DisplayStates
      const metadata = intent.metadata as Metadata
      const { asFragment } = render(getStatusTooltip(state, intent.sliceValue, metadata))
      expect(asFragment()).toMatchSnapshot()
    }
  )
})

describe('formatValues', () => {
  it('renders elements', () => {
    const { asFragment } = render(<FormattedMessage
      defaultMessage={`
        <p>paragraph</p>
        <ul>
          <li>item 1</li>
          <li>item 2</li>
        </ul>
      `}
      values={formatValues}
    />)

    expect(asFragment()).toMatchSnapshot()
  })
})

describe('Intent services', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  describe('useIntentAITableQuery', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const expectedResult = [
      {
        ...intentListResult.intents.data[0],
        aiFeature: 'AI-Driven RRM',
        intent: 'Client Density vs Throughput for 5 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz611 (SZ Cluster)
> zone-1 (Venue)`,
        status: Statuses.active,
        statusLabel: 'Active'
      },
      {
        ...intentListResult.intents.data[1],
        aiFeature: 'AI Operations',
        intent: 'Dynamic vs Static Channel capability on 2.4 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz34 (SZ Cluster)
> 01-US-CA-D1-Test-Home (Domain)
> 01-Alethea-WiCheck Test (Venue)`,
        status: Statuses.na,
        statusLabel: 'No Recommendation, Not Enough License'
      },
      {
        ...intentListResult.intents.data[2],
        aiFeature: 'AI Operations',
        intent: 'Dynamic vs Static Channel capability on 2.4 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz34 (SZ Cluster)
> 25-US-CA-D25-SandeepKour-home (Domain)
> 25-US-CA-D25-SandeepKour-home (Venue)`,
        status: Statuses.na,
        statusLabel: 'No Recommendation, No APs'
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
        { value: 'New', key: 'new' },
        { value: 'No Recommendation, No APs', key: 'na-no-aps' },
        { value: 'Paused', key: 'paused-from-inactive+paused-from-active+paused-by-default' }
      ],
      zones: [
        {
          value: '01-Alethea-WiCheck Test',
          key: '01-Alethea-WiCheck Test'
        }, {
          key: 'zone',
          value: 'zone'
        }
      ],
      intents: [
        {
          value: 'Client Density vs Throughput for 5 GHz radio',
          key: 'Client Density vs Throughput for 5 GHz radio'
        },
        {
          value: 'Secure AP firmware vs Client Device Compatibility',
          key: 'Secure AP firmware vs Client Device Compatibility'
        }
      ]
    }

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
      const { result } = renderHook(useIntentAITableQuery, { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
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
      const { result } = renderHook(useIntentAITableQuery, { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
      const customFilter = {
        sliceValue: ['1'],
        category: ['Wi-Fi Experience', 'Sustainability'],
        aiFeature: ['AI-Driven RRM'],
        statusLabel: ['new', 'na-no-aps', 'paused-from-active+paused-by-default'],
        intent: ['Client Density vs Throughput for 5 GHz radio']
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
            'c-probeflex-6g',
            'i-ecoflex'
          ]
        },
        { col: 'code', values: [ 'c-crrm-channel5g-auto' ] },
        {
          col: 'code',
          values: [
            'c-crrm-channel24g-auto',
            'c-crrm-channel5g-auto',
            'c-crrm-channel6g-auto'
          ]
        },
        {
          col: 'concat_ws(\'-\', status, "statusReason")',
          values: [ 'new', 'na-no-aps', 'paused-from-active', 'paused-by-default' ]
        }
      ])

    })
    it('handleFilterChange should handle no filter case', () => {
      mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
        data: intentListResult

      })
      mockGraphqlQuery(intentAIUrl, 'IntentAI', {
        data: filterOptions
      })
      const { result } = renderHook(useIntentAITableQuery, { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } })
      const customFilter = {
        sliceValue: null,
        category: null,
        aiFeature: null,
        statusLabel: null,
        intent: null
      }
      act(() => {
        result.current.onFilterChange(customFilter, {})
      })
      expect(result.current.tableQuery.originalArgs?.filterBy).toEqual([])
    })

    it('handleFilterChange should handle feature filter case from url(EquiFlex)', () => {
      mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
        data: intentListResult

      })
      mockGraphqlQuery(intentAIUrl, 'IntentAI', {
        data: filterOptions
      })
      const { result } = renderHook(useIntentAITableQuery,
        {
          wrapper: Provider,
          route: {
            params: { tenantId: 'tenant-id' },
            search: '?selectedTenants=tenantId&intentTableFilters=%7B%22feature%22%3A%22EquiFlex%22%7D',
            path: '/intentAI'
          }
        })
      const customFilter = {
        sliceValue: null,
        category: null,
        aiFeature: ['EquiFlex'],
        statusLabel: null,
        intent: null
      }
      act(() => {
        result.current.onFilterChange(customFilter, {})
      })
      expect(result.current.tableQuery.originalArgs?.filterBy).toEqual([{
        col: 'code',
        values: [
          'c-probeflex-24g',
          'c-probeflex-5g',
          'c-probeflex-6g'
        ]
      }])
    })

    it('should mutation TransitionIntent(Actions.One_Click_Optimize)', async () => {
      const resp = { t1: { success: true, errorMsg: '' , errorCode: '' } } as TransitionMutationResponse
      mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
      const { result } = renderHook(() =>
        api.endpoints.transitionIntent.useMutation(),
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } }
      )
      act(() => {
        result.current[0]({
          action: Actions.One_Click_Optimize,
          data: [{ id: '11',
            displayStatus: DisplayStates.new,
            status: Statuses.new,
            metadata: {
              scheduledAt: '2023-11-17T11:45:00.000Z',
              wlans: [{ name: 'n1', ssid: 's1' }],
              preferences: {
                crrmFullOptimization: true
              }
            } }]
        }).unwrap()
      })

      await waitFor(() => {
        expect(result.current[1].data).toStrictEqual(resp)
      })
    })

    it('should mutation TransitionIntent(Actions.Optimize)', async () => {
      const resp = { t1: { success: true, errorMsg: '' , errorCode: '' } } as TransitionMutationResponse
      mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
      const { result } = renderHook(() =>
        api.endpoints.transitionIntent.useMutation(),
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } }
      )
      act(() => {
        result.current[0]({
          action: Actions.Optimize,
          data: [{ id: '11',
            displayStatus: DisplayStates.scheduled,
            status: Statuses.scheduled,
            metadata: {
              scheduledAt: '2023-11-17T11:45:00.000Z',
              wlans: [{ name: 'n1', ssid: 's1' }],
              preferences: {
                crrmFullOptimization: true
              }
            } }]
        }).unwrap()
      })

      await waitFor(() => {
        expect(result.current[1].data).toStrictEqual(resp)
      })
    })

    it('should mutation TransitionIntent(Actions.Revert)', async () => {
      const resp = { t1: { success: true, errorMsg: '' , errorCode: '' } } as TransitionMutationResponse
      mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
      const { result } = renderHook(() =>
        api.endpoints.transitionIntent.useMutation(),
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } }
      )
      act(() => {
        result.current[0]({
          action: Actions.Revert,
          data: [{
            id: '12',
            status: Statuses.active,
            displayStatus: DisplayStates.active,
            statusTrail: [
              { status: Statuses.active },
              { status: Statuses.revertScheduled }
            ],
            metadata: {
              scheduledAt: '2023-11-17T11:45:00.000Z'
            } }]
        }).unwrap()
      })

      await waitFor(() => {
        expect(result.current[1].data).toStrictEqual(resp)
      })
    })

    it('should mutation TransitionIntent(Actions.Pause)', async () => {
      const resp = { t1: { success: true, errorMsg: '' , errorCode: '' } } as TransitionMutationResponse
      mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
      const { result } = renderHook(() =>
        api.endpoints.transitionIntent.useMutation(),
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } }
      )
      act(() => {
        result.current[0]({
          action: Actions.Pause,
          data: [{
            id: '11',
            status: Statuses.applyScheduled,
            displayStatus: DisplayStates.applyScheduled,
            statusTrail: [
              { status: Statuses.applyScheduled },
              { status: Statuses.paused, statusReason: StatusReasons.fromActive }
            ] },
          {
            id: '12',
            status: Statuses.na,
            displayStatus: DisplayStates.naWaitingForEtl,
            statusTrail: [
              { status: Statuses.na, statusReason: StatusReasons.waitingForEtl },
              { status: Statuses.paused, statusReason: StatusReasons.fromInactive }
            ] }]
        }).unwrap()
      })
    })

    it('should mutation TransitionIntent(Actions.Cancel)', async () => {
      const resp = { t1: { success: true, errorMsg: '' , errorCode: '' } } as TransitionMutationResponse
      mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
      const { result } = renderHook(() =>
        api.endpoints.transitionIntent.useMutation(),
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } }
      )
      act(() => {
        result.current[0]({
          action: Actions.Cancel,
          data: [{
            id: '11',
            status: Statuses.scheduled,
            displayStatus: DisplayStates.scheduled,
            statusTrail: [
              { status: Statuses.scheduled },
              { status: Statuses.new }
            ]
          },{
            id: '12',
            status: Statuses.revertScheduled,
            displayStatus: DisplayStates.revertScheduled,
            statusTrail: [
              { status: Statuses.revertScheduled },
              { status: Statuses.applyScheduled }
            ],
            metadata: {
              scheduledAt: '2024-07-19T04:01:00.000Z',
              applyScheduledAt: '2024-07-19T04:01:00.000Z'
            }
          },{
            id: '13',
            status: Statuses.revertScheduled,
            displayStatus: DisplayStates.revertScheduled,
            statusTrail: [
              { status: Statuses.revertScheduled },
              { status: Statuses.applyScheduled }
            ],
            metadata: {
              scheduledAt: '2024-07-21T04:01:00.000Z',
              applyScheduledAt: '2024-07-21T04:01:00.000Z'
            }
          },{
            id: '14',
            status: Statuses.revertScheduled,
            displayStatus: DisplayStates.revertScheduled,
            statusTrail: [
              { status: Statuses.revertScheduled },
              { status: Statuses.paused, statusReason: StatusReasons.revertFailed }
            ]
          },{
            id: '15',
            status: Statuses.revertScheduled,
            displayStatus: DisplayStates.revertScheduled,
            statusTrail: [
              { status: Statuses.revertScheduled },
              { status: Statuses.active }
            ] }]
        }).unwrap()
      })

      await waitFor(() => {
        expect(result.current[1].data).toStrictEqual(resp)
      })
    })

    it('should mutation TransitionIntent(Actions.Resume)', async () => {
      const resp = { t1: { success: true, errorMsg: '' , errorCode: '' } } as TransitionMutationResponse
      mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
      const { result } = renderHook(() =>
        api.endpoints.transitionIntent.useMutation(),
      { wrapper: Provider, route: { params: { tenantId: 'tenant-id' } } }
      )
      act(() => {
        result.current[0]({
          action: Actions.Resume,
          data: [{
            id: '11',
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedReverted,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.reverted },
              { status: Statuses.revertScheduled }
            ]
          },{
            id: '12',
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedReverted,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.revertFailed },
              { status: Statuses.revertScheduled }
            ]
          },{
            id: '13',
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedFromInactive,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.fromInactive },
              { status: Statuses.na, statusReason: StatusReasons.waitingForEtl }
            ]
          } ,{
            id: '14',
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedFromInactive,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.fromInactive },
              { status: Statuses.na, statusReason: StatusReasons.verified }
            ],
            metadata: {
              scheduledAt: '2024-07-21T04:01:00.000Z',
              applyScheduledAt: '2024-07-21T04:01:00.000Z'
            }
          },{
            id: '15',
            status: Statuses.paused,
            displayStatus: DisplayStates.pausedFromInactive,
            statusTrail: [
              { status: Statuses.paused, statusReason: StatusReasons.fromInactive },
              { status: Statuses.na, statusReason: StatusReasons.verified }
            ],
            metadata: {
              scheduledAt: '2024-07-21T04:01:00.000Z',
              applyScheduledAt: '2024-07-21T04:01:00.000Z'
            }
          }]
        }).unwrap()
      })
      await waitFor(() => {
        expect(result.current[1].data).toStrictEqual(resp)
      })
    })
  })

  it('should return correct ap details', async () => {
    mockGraphqlQuery(intentAIUrl, 'GetAps', {
      data: {
        intent: {
          aps: mockedIntentAps
        }
      }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.getAps.initiate({
        code: 'c1',
        root: 'r1',
        sliceId: 's1',
        search: ''
      })
    )
    expect(status).toBe('fulfilled')
    expect(error).toBeUndefined()
    expect(data).toStrictEqual<IntentAP[]>([
      {
        name: 'RuckusAP',
        mac: '28:B3:71:27:38:E0',
        model: 'R650',
        version: 'Unknown'
      },
      {
        name: 'RuckusAP',
        mac: 'B4:79:C8:3E:7E:50',
        model: 'R550',
        version: 'Unknown'
      },
      {
        name: 'RuckusAP',
        mac: 'C8:84:8C:3E:46:B0',
        model: 'R560',
        version: 'Unknown'
      }
    ])
  })

  it('should return intentHighlight', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlights
    }, true)

    const { status, data, error } = await store.dispatch(
      api.endpoints.intentHighlight.initiate({
        startDate: '2023-06-10T00:00:00+08:00',
        endDate: '2023-06-17T00:00:00+08:00',
        range: DateRange.custom,
        path: defaultNetworkPath
      })
    )
    const expectedResult = {
      rrm: {
        new: 4,
        active: 8
      },
      probeflex: {
        new: 5,
        active: 10
      },
      ops: {
        new: 6,
        active: 12
      }
    }

    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
  })

  it('returns wlans', async () => {
    const wlans = [
      { name: 'wlan1', ssid: 'wlan1' },
      { name: 'wlan2', ssid: 'wlan2' },
      { name: 'wlan3', ssid: 'wlan3' }
    ]
    mockGraphqlQuery(intentAIUrl, 'Wlans', { data: { intent: { wlans } } })
    const { status, data, error } = await store.dispatch(
      api.endpoints.intentWlans.initiate({ code: 'c1', root: 'r1', sliceId: 's1' })
    )
    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(wlans)
  })
})
