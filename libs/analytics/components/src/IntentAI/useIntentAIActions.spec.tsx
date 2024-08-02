/* eslint-disable max-len */

import userEvent from '@testing-library/user-event'
import { act }   from 'react-dom/test-utils'

import { get }                   from '@acx-ui/config'
import { useIsSplitOn }          from '@acx-ui/feature-toggle'
import { Provider, intentAIUrl } from '@acx-ui/store'
import {
  mockGraphqlMutation,
  screen,
  cleanup,
  within,
  waitFor,
  renderHook
}                                                               from '@acx-ui/test-utils'

import { intentListResult }                            from './__tests__/fixtures'
import { IntentListItem, OptimizeAllMutationResponse } from './services'
import { useIntentAIActions  }                         from './useIntentAIActions'

const mockedOptimizeAllIntent = jest.fn()
const mockedRecommendationWlansQuery = jest.fn()
const mockedVenueRadioActiveNetworksQuery = jest.fn()

const raiWlans = [
  { id: 'i1', name: 'n1', ssid: 's1' },
  { id: 'i2', name: 'n2', ssid: 's2' },
  { id: 'i3', name: 'n3', ssid: 's3' }]

const r1Wlans = [
  { id: 'i4', name: 'n4', ssid: 's4' },
  { id: 'i5', name: 'n5', ssid: 's5' },
  { id: 'i6', name: 'n6', ssid: 's6' }]

jest.mock('../Recommendations/services', () => ({
  ...jest.requireActual<typeof import('../Recommendations/services')>('../Recommendations/services'),
  useLazyRecommendationWlansQuery: () => [mockedRecommendationWlansQuery]
}))
jest.mock('./services', () => ({
  ...jest.requireActual<typeof import('./services')>('./services'),
  useOptimizeAllIntentMutation: () => [mockedOptimizeAllIntent]
}))
jest.mock('@acx-ui/rc/utils', () => ({
  RadioTypeEnum: {
    _2_4_GHz: '2.4-GHz',
    _5_GHz: '5-GHz',
    _6_GHz: '6-GHz'
  }
}))
jest.mock('@acx-ui/rc/services', () => ({
  useLazyVenueRadioActiveNetworksQuery: () => [mockedVenueRadioActiveNetworksQuery]
}))
jest.mock('@acx-ui/config')
jest.spyOn(global.Date, 'now').mockImplementation(
  () => new Date('2024-07-20T04:01:00.000Z').getTime()
)

const extractItem = {
  intent: 'Client Density vs. Throughput for 5 GHz radio',
  category: 'Wi-Fi Experience',
  scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
  status: 'Active',
  statusTooltip: 'IntentAI is active and has successfully applied the changes to the zone-1.'
}

describe('useIntentAIActions', () => {
  const now = new Date('2024-07-20T04:01:00.000Z').getTime()
  beforeEach(() => {
    const resp = { optimizeAll: [{ success: true, errorMsg: '' , errorCode: '' }] } as OptimizeAllMutationResponse
    mockedOptimizeAllIntent.mockReturnValue(Promise.resolve(resp))
    mockedRecommendationWlansQuery.mockReturnValue({ unwrap: () => Promise.resolve(raiWlans) })
    mockedVenueRadioActiveNetworksQuery.mockReturnValue({ unwrap: () => Promise.resolve(r1Wlans) })
    mockGraphqlMutation(intentAIUrl, 'OptimizeAll', { data: resp })
    jest.spyOn(Date, 'now').mockReturnValue(now)
  })
  afterEach(() => {
    cleanup()
    jest.mocked(get).mockReturnValue('')
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })
  describe('r1 - OneClickOptimize', () => {
    beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))
    describe('r1 - AI-Driven', () => {
      it('should handle current time is less than 3 AM - single1', async () => {
        jest.mocked(Date.now).mockReturnValue(new Date('2024-07-21T00:01:00.000Z').getTime())
        const mockOK = jest.fn()
        const selectedRow = [{ ...intentListResult.intents[4], aiFeature: 'AI-Driven RRM', ...extractItem }] as IntentListItem[]
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <Provider children={children} />
        })
        const { showOneClickOptimize } = result.current
        act(() => {
          showOneClickOptimize(selectedRow, mockOK)
        })
        const dialog = await screen.findByRole('dialog')
        expect(await within(dialog).findByText(/3AM local time/)).toBeVisible()
        expect(await within(dialog).findByText(/zone-1/)).toBeVisible()
        expect(await within(dialog).findByText(/Change time/)).toBeVisible()
        userEvent.click(await within(dialog).findByText(/Change time/))
        await userEvent.click((await screen.findAllByRole('time-picker-hours'))[0])
        const checkHour = await screen.findAllByText('00')
        await userEvent.click(checkHour[0])
        await userEvent.click((await screen.findAllByRole('time-picker-minutes'))[0])
        const checkMin = await screen.findAllByText('45')
        await userEvent.click(checkMin[0])
        await userEvent.click((await screen.findAllByText('Apply'))[0])
        await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
        expect(mockedOptimizeAllIntent).toHaveBeenCalledWith({
          optimizeList: [{
            id: '15',
            metadata: {
              scheduledAt: '2024-07-21T00:45:00.000Z' ,
              preferences: {
                crrmFullOptimization: true
              }
            }
          }]
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })

      it('should handle mutation correctly - single', async () => {
        const mockOK = jest.fn()
        const selectedRow = [{ ...intentListResult.intents[4], aiFeature: 'AI-Driven RRM', ...extractItem }] as IntentListItem[]
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <Provider children={children} />
        })
        const { showOneClickOptimize } = result.current
        act(() => {
          showOneClickOptimize(selectedRow, mockOK)
        })
        const dialog = await screen.findByRole('dialog')
        expect(await within(dialog).findByText(/3AM local time/)).toBeVisible()
        expect(await within(dialog).findByText(/zone-1/)).toBeVisible()
        expect(await within(dialog).findByText(/Change time/)).toBeVisible()
        userEvent.click(await within(dialog).findByText(/Change time/))
        await userEvent.click((await screen.findAllByRole('time-picker-minutes'))[0])
        const checkMin = await screen.findAllByText('45')
        await userEvent.click(checkMin[0])
        await userEvent.click((await screen.findAllByRole('time-picker-hours'))[0])
        const checkHour = await screen.findAllByText('04')
        await userEvent.click(checkHour[0])
        await userEvent.click((await screen.findAllByText('Apply'))[0])
        await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
        expect(mockedOptimizeAllIntent).toHaveBeenCalledWith({
          optimizeList: [{
            id: '15',
            metadata: {
              scheduledAt: '2024-07-21T04:45:00.000Z',
              preferences: {
                crrmFullOptimization: true
              }
            }
          }]
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })
    })

    describe('r1 - AirFlexAI', () => {
      it('should handle mutation correctly  - single', async () => {
        const selectedRow = [{ ...intentListResult.intents[5], aiFeature: 'AirFlexAI', ...extractItem }] as IntentListItem[]
        const mockOK = jest.fn()
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <Provider children={children} />
        })
        const { showOneClickOptimize } = result.current
        act(() => {
          showOneClickOptimize(selectedRow, mockOK)
        })
        const dialog = await screen.findByRole('dialog')
        expect(await within(dialog).findByText(/zone-1/)).toBeVisible()
        expect(await within(dialog).findByText(/3AM local time/)).toBeVisible()
        expect(await within(dialog).findByText(/Change time/)).toBeVisible()
        userEvent.click(await within(dialog).findByText(/Change time/))
        await userEvent.click((await screen.findAllByRole('time-picker-minutes'))[0])
        const checkMin = await screen.findAllByText('45')
        await userEvent.click(checkMin[0])
        await userEvent.click((await screen.findAllByRole('time-picker-hours'))[0])
        const checkHour = await screen.findAllByText('04')
        await userEvent.click(checkHour[0])
        await userEvent.click((await screen.findAllByText('Apply'))[0])
        await userEvent.click((await screen.findByText('Yes, Optimize!')))
        expect(mockedOptimizeAllIntent).toHaveBeenCalledWith({
          optimizeList: [{
            id: '16',
            metadata: {
              scheduledAt: '2024-07-21T04:45:00.000Z',
              wlans: [{ name: 'i4', ssid: 's4' },{ name: 'i5', ssid: 's5' },{ name: 'i6', ssid: 's6' }]
            }
          }]
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })

      it('should handle fetchWlans correctly', async () => {
        const selectedRow = [{ ...intentListResult.intents[5], aiFeature: 'AirFlexAI', ...extractItem }] as IntentListItem[]
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <Provider children={children} />
        })
        const { fetchWlans } = result.current
        act(() => {
          fetchWlans(selectedRow[0].id, selectedRow[0].code, selectedRow[0].path)
        })
        await waitFor(() => expect(mockedVenueRadioActiveNetworksQuery).toBeCalledTimes(1))
      })
    })

    it('should handle mutation correctly (OPTIMIZE_TYPES.1_2) - multiple', async () => {
      const selectedRows = [
        { ...intentListResult.intents[6], aiFeature: 'AirFlexAI', ...extractItem },
        { ...intentListResult.intents[7], aiFeature: 'AirFlexAI', ...extractItem }
      ] as IntentListItem[]
      const mockOK = jest.fn()
      const { result } = renderHook(() => useIntentAIActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { showOneClickOptimize } = result.current
      act(() => {
        showOneClickOptimize(selectedRows, mockOK)
      })
      const dialog = await screen.findByRole('dialog')
      expect(await within(dialog).findByText(/feature for/)).toBeVisible()
      expect(await within(dialog).findByText(/selected Zones/)).toBeVisible()
      expect(await within(dialog).findByText(/3AM local time/)).toBeVisible()
      await userEvent.click((await within(dialog).findByText('Cancel')))
      await waitFor(() => expect(screen.queryByText('dialog')).toBeNull())
    })

    it('should handle mutation correctly (OPTIMIZE_TYPES.2_1) - multiple', async () => {
      const { sliceValue } = intentListResult.intents[4]
      const selectedRows = [
        { ...intentListResult.intents[4], aiFeature: 'AI-Driven RRM', ...extractItem },
        { ...intentListResult.intents[6], aiFeature: 'AirFlexAI', sliceValue, ...extractItem }
      ] as IntentListItem[]
      const mockOK = jest.fn()
      const { result } = renderHook(() => useIntentAIActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { showOneClickOptimize } = result.current
      act(() => {
        showOneClickOptimize(selectedRows, mockOK)
      })
      const dialog = await screen.findByRole('dialog')
      expect(await within(dialog).findByText(/features for Zone/)).toBeVisible()
      expect(await within(dialog).findByText(/3AM local time/)).toBeVisible()
      expect(await within(dialog).findByText(/Change time/)).toBeVisible()
      await userEvent.click((await within(dialog).findByText('Cancel')))
      await waitFor(() => expect(screen.queryByText('dialog')).toBeNull())
    })

    it('should handle mutation correctly (OPTIMIZE_TYPES.2_2)  - multiple', async () => {
      const selectedRows = [
        { ...intentListResult.intents[4], aiFeature: 'AI-Driven RRM', ...extractItem },
        { ...intentListResult.intents[6], aiFeature: 'AirFlexAI', ...extractItem }
      ] as IntentListItem[]
      const mockOK = jest.fn()
      const { result } = renderHook(() => useIntentAIActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { showOneClickOptimize } = result.current
      act(() => {
        showOneClickOptimize(selectedRows, mockOK)
      })
      const dialog = await screen.findByRole('dialog')
      expect(await within(dialog).findByText(/features across/)).toBeVisible()
      expect(await within(dialog).findByText(/selected Zones/)).toBeVisible()
      expect(await within(dialog).findByText(/3AM local time/)).toBeVisible()
      expect(await within(dialog).findByText(/Change time/)).toBeVisible()
      userEvent.click(await within(dialog).findByText(/Change time/))
      await userEvent.click((await screen.findAllByRole('time-picker-minutes'))[0])
      const checkMin = await screen.findAllByText('45')
      await userEvent.click(checkMin[0])
      await userEvent.click((await screen.findAllByRole('time-picker-hours'))[0])
      const checkHour = await screen.findAllByText('04')
      await userEvent.click(checkHour[0])
      await userEvent.click((await screen.findAllByText('Apply'))[0])
      await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
      expect(mockedOptimizeAllIntent).toHaveBeenCalledWith({
        optimizeList: [{
          id: '15',
          metadata: {
            scheduledAt: '2024-07-21T04:45:00.000Z',
            preferences: {
              crrmFullOptimization: true
            }
          }
        },{
          id: '17',
          metadata: {
            scheduledAt: '2024-07-21T04:45:00.000Z',
            wlans: [{ name: 'i4', ssid: 's4' },{ name: 'i5', ssid: 's5' },{ name: 'i6', ssid: 's6' }]
          }
        }]

      })
      await waitFor(() => expect(mockOK).toBeCalledTimes(1))
    })
  })

  describe('rai - OneClickOptimize', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      jest.mocked(get).mockReturnValue('true')
    })
    describe('rai - AI-Driven', () => {
      it('should handle mutation correctly - single', async () => {
        const mockOK = jest.fn()
        const selectedRow = [{ ...intentListResult.intents[4], aiFeature: 'AI-Driven RRM', ...extractItem }] as IntentListItem[]
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <Provider children={children} />
        })
        const { showOneClickOptimize } = result.current
        act(() => {
          showOneClickOptimize(selectedRow, mockOK)
        })
        const dialog = await screen.findByRole('dialog')
        expect(await within(dialog).findByText(/zone-1/)).toBeVisible()
        expect(await within(dialog).findByText(/3AM local time/)).toBeVisible()
        expect(await within(dialog).findByText(/Change time/)).toBeVisible()
        userEvent.click(await within(dialog).findByText(/Change time/))
        await userEvent.click((await screen.findAllByRole('time-picker-minutes'))[0])
        const checkMin = await screen.findAllByText('45')
        await userEvent.click(checkMin[0])
        await userEvent.click((await screen.findAllByRole('time-picker-hours'))[0])
        const checkHour = await screen.findAllByText('04')
        await userEvent.click(checkHour[0])
        await userEvent.click((await screen.findAllByText('Apply'))[0])
        await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
        expect(mockedOptimizeAllIntent).toHaveBeenCalledWith({
          optimizeList: [{
            id: '15',
            metadata: {
              scheduledAt: '2024-07-21T04:45:00.000Z',
              preferences: {
                crrmFullOptimization: true
              }
            }
          }]
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })
    })

    describe('rai - AirFlexAI', () => {
      it('should handle mutation correctly  - single', async () => {
        const selectedRow = [{ ...intentListResult.intents[5], aiFeature: 'AirFlexAI', ...extractItem }] as IntentListItem[]
        const mockOK = jest.fn()
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <Provider children={children} />
        })
        const { showOneClickOptimize } = result.current
        act(() => {
          showOneClickOptimize(selectedRow, mockOK)
        })
        const dialog = await screen.findByRole('dialog')
        expect(await within(dialog).findByText(/3AM local time/)).toBeVisible()
        expect(await within(dialog).findByText(/zone-1/)).toBeVisible()
        expect(await within(dialog).findByText(/Change time/)).toBeVisible()
        userEvent.click(await within(dialog).findByText(/Change time/))
        await userEvent.click((await screen.findAllByRole('time-picker-minutes'))[0])
        const checkMin = await screen.findAllByText('45')
        await userEvent.click(checkMin[0])
        await userEvent.click((await screen.findAllByRole('time-picker-hours'))[0])
        const checkHour = await screen.findAllByText('04')
        await userEvent.click(checkHour[0])
        await userEvent.click((await screen.findAllByText('Apply'))[0])
        await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
        expect(mockedOptimizeAllIntent).toHaveBeenCalledWith({
          optimizeList: [{
            id: '16',
            metadata: {
              scheduledAt: '2024-07-21T04:45:00.000Z',
              wlans: [{ id: 'n1', name: 'n1', ssid: 's1' },{ id: 'n2', name: 'n2', ssid: 's2' },{ id: 'n3', name: 'n3', ssid: 's3' }]
            }
          }]
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })

      it('should show error when date time before  - single', async () => {
        const selectedRow = [{ ...intentListResult.intents[5], aiFeature: 'AirFlexAI', ...extractItem }] as IntentListItem[]
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <Provider children={children} />
        })
        const { showOneClickOptimize } = result.current
        act(() => {
          showOneClickOptimize(selectedRow)
        })
        const dialog = await screen.findByRole('dialog')
        expect(await within(dialog).findByText(/3AM local time/)).toBeVisible()
        expect(await within(dialog).findByText(/zone-1/)).toBeVisible()
        expect(await within(dialog).findByText(/Change time/)).toBeVisible()
        jest.mocked(Date.now).mockReturnValue(new Date('2024-07-22T04:01:00.000Z').getTime())
        userEvent.click(await within(dialog).findByText(/Change time/))
        await userEvent.click((await screen.findAllByRole('time-picker-hours'))[0])
        const checkHour = await screen.findAllByText('00')
        await userEvent.click(checkHour[0])
        await userEvent.click((await screen.findAllByRole('time-picker-minutes'))[0])
        const checkMin = await screen.findAllByText('15')
        await userEvent.click(checkMin[0])
        await userEvent.click((await screen.findAllByText('Apply'))[0])
        await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
        expect(await screen.findByText(/Scheduled time cannot be before/)).toBeVisible()
      })

      it('should handle fetchWlans correctly', async () => {
        const selectedRow = [{ ...intentListResult.intents[5], aiFeature: 'AirFlexAI', ...extractItem }] as IntentListItem[]
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <Provider children={children} />
        })
        const { fetchWlans } = result.current
        act(() => {
          fetchWlans(selectedRow[0].id, selectedRow[0].code, selectedRow[0].path)
        })
        await waitFor(() => expect(mockedRecommendationWlansQuery).toBeCalledTimes(1))
      })
    })

    it('should show error toast when mutation fail - single', async () => {
      const resp = { optimizeAll: [
        { success: false, errorMsg: 'mutation fail' , errorCode: '' },
        { success: true, errorMsg: '' , errorCode: '' }
      ]
      } as OptimizeAllMutationResponse
      mockedOptimizeAllIntent.mockReturnValue(Promise.resolve({ data: resp }))
      mockGraphqlMutation(intentAIUrl, 'OptimizeAll', { data: resp })
      const selectedRow = [{ ...intentListResult.intents[5], aiFeature: 'AirFlexAI', ...extractItem }] as IntentListItem[]
      const { result } = renderHook(() => useIntentAIActions(), {
        wrapper: ({ children }) => <Provider children={children} />
      })
      const { showOneClickOptimize } = result.current
      act(() => {
        showOneClickOptimize(selectedRow)
      })
      const dialog = await screen.findByRole('dialog')
      expect(await within(dialog).findByText(/3AM local time/)).toBeVisible()
      expect(await within(dialog).findByText(/zone-1/)).toBeVisible()
      expect(await within(dialog).findByText(/Change time/)).toBeVisible()
      userEvent.click(await within(dialog).findByText(/Change time/))
      await userEvent.click((await screen.findAllByRole('time-picker-minutes'))[0])
      const checkMin = await screen.findAllByText('45')
      await userEvent.click(checkMin[0])
      await userEvent.click((await screen.findAllByRole('time-picker-hours'))[0])
      const checkHour = await screen.findAllByText('04')
      await userEvent.click(checkHour[0])
      await userEvent.click((await screen.findAllByText('Apply'))[0])
      await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
      await waitFor(() => expect(mockedOptimizeAllIntent).toBeCalledTimes(1))
      expect(await screen.findByText(/mutation fail/)).toBeVisible()
    })
  })
})