/* eslint-disable max-len */

import userEvent       from '@testing-library/user-event'
import { MomentInput } from 'moment-timezone'
import { act }         from 'react-dom/test-utils'

import { get }                         from '@acx-ui/config'
import { useIsSplitOn }                from '@acx-ui/feature-toggle'
import { Provider, recommendationUrl } from '@acx-ui/store'
import {
  mockGraphqlMutation,
  screen,
  cleanup,
  within,
  waitFor,
  renderHook
}                                                               from '@acx-ui/test-utils'

import { ScheduleResponse } from '../Recommendations/services'

import { intentListResult }    from './__tests__/fixtures'
import { IntentListItem }      from './services'
import { useIntentAIActions  } from './useIntentAIActions'

const mockedUseSchedule = jest.fn()
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
  useScheduleRecommendationMutation: () => [mockedUseSchedule],
  useLazyRecommendationWlansQuery: () => [mockedRecommendationWlansQuery]
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
jest.mock('moment-timezone', () => {
  const moment = jest.requireActual<typeof import('moment-timezone')>('moment-timezone')
  return {
    __esModule: true,
    ...moment,
    default: (date: MomentInput) => date === '2023-11-17T11:45:00.000Z'
      ? moment(date)
      : moment('07-15-2023', 'MM-DD-YYYY').add(3, 'h')
  }
})

describe('useIntentAIActions', () => {
  beforeEach(() => {
    const resp = { schedule: { success: true, errorMsg: '' , errorCode: '' } } as ScheduleResponse
    mockedUseSchedule.mockReturnValue({ unwrap: () => Promise.resolve(resp) })
    mockedRecommendationWlansQuery.mockReturnValue({ unwrap: () => Promise.resolve(raiWlans) })
    mockedVenueRadioActiveNetworksQuery.mockReturnValue({ unwrap: () => Promise.resolve(r1Wlans) })
    mockGraphqlMutation(recommendationUrl, 'ScheduleRecommendation', { data: resp })
  })
  afterEach(() => {
    cleanup()
    jest.mocked(get).mockReturnValue('')
    jest.clearAllMocks()
  })
  describe('R1 - OneClickOptimize', () => {
    beforeEach(() => jest.mocked(useIsSplitOn).mockReturnValue(true))
    describe('r1 - crrm c-crrm-*', () => {
      it('should handle same day apply mutation correctly - single', async () => {
        const mockOK = jest.fn()
        const selectedRow = [{ ...intentListResult.intents[4], aiFeature: 'AI-Driven RRM' }] as IntentListItem[]
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
        const checkHour = await screen.findAllByText('00')
        await userEvent.click(checkHour[0])
        await userEvent.click((await screen.findAllByText('Apply'))[0])
        await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
        expect(mockedUseSchedule).toHaveBeenCalledWith({
          id: '15',
          isRecommendationRevertEnabled: true,
          scheduledAt: '2023-07-16T00:45:00.000Z',
          preferences: { crrmFullOptimization: true },
          type: 'Apply'
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })
    })

    describe('r1 - airflex c-probeflex-*', () => {
      it('should handle same day apply mutation correctly  - single', async () => {
        const selectedRow = [{ ...intentListResult.intents[5], aiFeature: 'AirFlexAI' }] as IntentListItem[]
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
        const checkHour = await screen.findAllByText('00')
        await userEvent.click(checkHour[0])
        await userEvent.click((await screen.findAllByText('Apply'))[0])
        await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
        expect(mockedUseSchedule).toHaveBeenCalledWith({
          id: '16',
          isRecommendationRevertEnabled: true,
          scheduledAt: '2023-07-16T00:45:00.000Z',
          type: 'Apply',
          wlans: [{ name: 'i4', ssid: 's4' },{ name: 'i5', ssid: 's5' },{ name: 'i6', ssid: 's6' }]
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })
    })

    it('should handle same day apply mutation correctly  - multiple', async () => {
      const selectedRows = [
        { ...intentListResult.intents[4], aiFeature: 'AI-Driven RRM' },
        { ...intentListResult.intents[6], aiFeature: 'AirFlexAI' }
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
      const checkHour = await screen.findAllByText('00')
      await userEvent.click(checkHour[0])
      await userEvent.click((await screen.findAllByText('Apply'))[0])
      await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
      expect(mockedUseSchedule).toHaveBeenCalledWith({
        id: '15',
        preferences: {
          crrmFullOptimization: true
        },
        isRecommendationRevertEnabled: true,
        scheduledAt: '2023-07-16T00:45:00.000Z',
        type: 'Apply'
      })
      expect(mockedUseSchedule).toHaveBeenCalledWith({
        id: '17',
        isRecommendationRevertEnabled: true,
        scheduledAt: '2023-07-16T00:45:00.000Z',
        type: 'Apply',
        wlans: [{ name: 'i4', ssid: 's4' },{ name: 'i5', ssid: 's5' },{ name: 'i6', ssid: 's6' }]
      })
      await waitFor(() => expect(mockOK).toBeCalledTimes(1))
    })
  })

  describe('RAI - OneClickOptimize', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      jest.mocked(get).mockReturnValue('true')
    })
    describe('rai - crrm c-crrm-*', () => {
      it('should handle same day apply mutation correctly - single', async () => {
        const mockOK = jest.fn()
        const selectedRow = [{ ...intentListResult.intents[4], aiFeature: 'AI-Driven RRM' }] as IntentListItem[]
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
        const checkHour = await screen.findAllByText('00')
        await userEvent.click(checkHour[0])
        await userEvent.click((await screen.findAllByText('Apply'))[0])
        await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
        expect(mockedUseSchedule).toHaveBeenCalledWith({
          id: '15',
          isRecommendationRevertEnabled: true,
          scheduledAt: '2023-07-16T00:45:00.000Z',
          preferences: { crrmFullOptimization: true },
          type: 'Apply'
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })
    })

    describe('rai - airflex c-probeflex-*', () => {
      it('should handle same day apply mutation correctly  - single', async () => {
        const selectedRow = [{ ...intentListResult.intents[5], aiFeature: 'AirFlexAI' }] as IntentListItem[]
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
        const checkHour = await screen.findAllByText('00')
        await userEvent.click(checkHour[0])
        await userEvent.click((await screen.findAllByText('Apply'))[0])
        await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
        expect(mockedUseSchedule).toHaveBeenCalledWith({
          id: '16',
          isRecommendationRevertEnabled: true,
          scheduledAt: '2023-07-16T00:45:00.000Z',
          type: 'Apply',
          wlans: [{ id: 'n1', name: 'n1', ssid: 's1' },{ id: 'n2', name: 'n2', ssid: 's2' },{ id: 'n3', name: 'n3', ssid: 's3' }]
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })

      it('should show error when apply same day  - single', async () => {
        const selectedRow = [{ ...intentListResult.intents[5], aiFeature: 'AirFlexAI' }] as IntentListItem[]
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
        const checkMin = await screen.findAllByText('15')
        await userEvent.click(checkMin[0])
        await userEvent.click((await screen.findAllByRole('time-picker-hours'))[0])
        const checkHour = await screen.findAllByText('00')
        await userEvent.click(checkHour[0])
        await userEvent.click((await screen.findAllByText('Apply'))[0])
        await userEvent.click((await screen.findAllByText('Yes, Optimize!'))[0])
        expect(await screen.findByText(/Scheduled time cannot be before/)).toBeVisible()
      })
    })
  })
})