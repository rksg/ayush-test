/* eslint-disable max-len */

import userEvent          from '@testing-library/user-event'
import { message, Modal } from 'antd'
import moment             from 'moment-timezone'
import { BrowserRouter }  from 'react-router-dom'

import { getUserName }                    from '@acx-ui/analytics/utils'
import { get }                            from '@acx-ui/config'
import { useIsSplitOn }                   from '@acx-ui/feature-toggle'
import { Provider, intentAIUrl }          from '@acx-ui/store'
import { act, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import {
  mockGraphqlMutation,
  screen,
  cleanup,
  within,
  waitFor,
  renderHook
}                                                               from '@acx-ui/test-utils'
import { getUserProfile as getUserProfileR1, setUserProfile } from '@acx-ui/user'

import { mockAIDrivenRow, mockEquiFlexRows } from './__tests__/fixtures'
import { AiFeatures, IntentListItem }        from './config'
import { TransitionMutationResponse }        from './services'
import { DisplayStates, Statuses }           from './states'
import { useIntentAIActions  }               from './useIntentAIActions'
import { Actions }                           from './utils'

const mockedTransitionIntent = jest.fn()
const mockedIntentWlansQuery = jest.fn()
const mockedVenueRadioActiveNetworksQuery = jest.fn()
const mockedVenueWifiRadioActiveNetworksQuery = jest.fn()

declare global {
  // eslint-disable-next-line no-var
  var originalLocation: Location
}

const raiWlans = [
  { name: 'n1', ssid: 's1' },
  { name: 'n2', ssid: 's2' },
  { name: 'n3', ssid: 's3' }]

const r1Wlans = [
  { id: 'i4', name: 'n4', ssid: 's4' },
  { id: 'i5', name: 'n5', ssid: 's5' },
  { id: 'i6', name: 'n6', ssid: 's6' }]

jest.mock('./services', () => ({
  ...jest.requireActual<typeof import('./services')>('./services'),
  useLazyIntentWlansQuery: () => [mockedIntentWlansQuery],
  useTransitionIntentMutation: () => [mockedTransitionIntent]
}))
jest.mock('@acx-ui/rc/utils', () => ({
  RadioTypeEnum: {
    _2_4_GHz: '2.4-GHz',
    _5_GHz: '5-GHz',
    _6_GHz: '6-GHz'
  }
}))
jest.mock('@acx-ui/rc/services', () => ({
  useLazyVenueRadioActiveNetworksQuery: () => [mockedVenueRadioActiveNetworksQuery],
  useLazyVenueWifiRadioActiveNetworksQuery: () => [mockedVenueWifiRadioActiveNetworksQuery]
}))
jest.mock('@acx-ui/config')
jest.spyOn(global.Date, 'now').mockImplementation(
  () => new Date('2024-07-20T04:01:00.000Z').getTime()
)

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  getUserName: jest.fn()
}))
const userNameRA = jest.mocked(getUserName)

const extractItem = {
  root: 'root',
  sliceId: 'sliceId',
  intent: 'Client Density vs. Throughput for 5 GHz radio',
  category: 'Wi-Fi Experience',
  scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
  status: 'new',
  statusLabel: 'New',
  statusTooltip: 'IntentAI is active and has successfully applied the changes to the zone-1.'
}

describe('useIntentAIActions', () => {
  const now = new Date('2024-07-20T04:01:00.000Z').getTime()
  beforeEach(() => {
    const resp = { t1: { success: true, errorMsg: '' , errorCode: '' } } as TransitionMutationResponse
    mockedTransitionIntent.mockReturnValue(Promise.resolve({ data: resp }))
    mockedIntentWlansQuery.mockReturnValue({ unwrap: () => Promise.resolve(raiWlans) })
    mockedVenueWifiRadioActiveNetworksQuery.mockReturnValue({ unwrap: () => Promise.resolve(r1Wlans) })
    mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
    jest.spyOn(Date, 'now').mockReturnValue(now)
    userNameRA.mockReturnValue('FirstName RAI LastName-RAI')
    setUserProfile({
      allowedOperations: [],
      profile: { ...getUserProfileR1().profile, firstName: 'FirstName R1', lastName: 'LastName-R1' }
    })
  })
  afterEach(() => {
    jest.mocked(get).mockReturnValue('')
    jest.clearAllMocks()
    jest.restoreAllMocks()
    Modal.destroyAll()
  })
  describe('r1 - OneClickOptimize', () => {
    const mockOK = jest.fn()
    beforeEach(() => {
      mockOK.mockClear()
      jest.mocked(useIsSplitOn).mockReturnValue(true)
    })
    describe('r1 - AI-Driven', () => {
      it('should handle current time is less than 3 AM - single1', async () => {
        jest.mocked(Date.now).mockReturnValue(new Date('2024-07-21T00:01:00.000Z').getTime())
        const selectedRow = [{
          ...mockAIDrivenRow,
          aiFeature: AiFeatures.RRM,
          preferences: undefined,
          ...extractItem
        }] as unknown as IntentListItem[]
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
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
        expect(mockedTransitionIntent).toHaveBeenCalledWith({
          action: Actions.One_Click_Optimize,
          data: [{
            id: '15',
            displayStatus: DisplayStates.new,
            status: Statuses.new,
            metadata: {
              scheduledAt: '2024-07-21T00:45:00.000Z',
              changedByName: 'FirstName R1 LastName-R1',
              preferences: {
                crrmFullOptimization: true
              }
            }
          }]
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })

      it('should handle mutation correctly - single', async () => {
        const selectedRow = [{ ...mockAIDrivenRow, aiFeature: AiFeatures.RRM, ...extractItem }] as unknown as IntentListItem[]
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
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
        expect(mockedTransitionIntent).toHaveBeenCalledWith({
          action: Actions.One_Click_Optimize,
          data: [{
            id: '15',
            displayStatus: DisplayStates.new,
            status: Statuses.new,
            metadata: {
              scheduledAt: '2024-07-21T04:45:00.000Z',
              changedByName: 'FirstName R1 LastName-R1',
              preferences: {
                crrmFullOptimization: true
              }
            }
          }]
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })
    })

    describe('r1 - EquiFlex', () => {
      beforeEach(() => {
        jest.mocked(useIsSplitOn).mockReturnValue(true)
      })
      it('should handle mutation correctly  - single', async () => {
        const selectedRow = [{ ...mockEquiFlexRows[0], aiFeature: AiFeatures.EquiFlex, ...extractItem }] as unknown as IntentListItem[]
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
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
        expect(mockedTransitionIntent).toHaveBeenCalledWith({
          action: Actions.One_Click_Optimize,
          data: [{
            id: '16',
            displayStatus: DisplayStates.new,
            status: Statuses.new,
            metadata: {
              scheduledAt: '2024-07-21T04:45:00.000Z',
              changedByName: 'FirstName R1 LastName-R1',
              wlans: [{ name: 'i4', ssid: 's4' },{ name: 'i5', ssid: 's5' },{ name: 'i6', ssid: 's6' }]
            }
          }]
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })

      it('should handle fetchWlans correctly', async () => {
        const selectedRow = { ...mockEquiFlexRows[0], aiFeature: AiFeatures.EquiFlex, ...extractItem } as unknown as IntentListItem
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
        })
        const { fetchWlans } = result.current
        act(() => {
          fetchWlans(selectedRow)
        })
        await waitFor(() => expect(mockedVenueWifiRadioActiveNetworksQuery).toBeCalledTimes(1))
      })

      it('should handle fetchWlans correctly when FF is off', async () => {
        jest.mocked(useIsSplitOn).mockReturnValue(false)
        const selectedRow = { ...mockEquiFlexRows[0], aiFeature: AiFeatures.EquiFlex, ...extractItem } as unknown as IntentListItem
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
        })
        const { fetchWlans } = result.current
        act(() => {
          fetchWlans(selectedRow)
        })
        await waitFor(() => expect(mockedVenueRadioActiveNetworksQuery).toBeCalledTimes(1))
      })
    })

    it('should handle mutation correctly (OPTIMIZE_TYPES.1_2) - multiple', async () => {
      const selectedRows = [
        { ...mockEquiFlexRows[1], aiFeature: AiFeatures.EquiFlex, ...extractItem },
        { ...mockEquiFlexRows[2], aiFeature: AiFeatures.EquiFlex, ...extractItem }
      ] as unknown as IntentListItem[]
      const { result } = renderHook(() => useIntentAIActions(), {
        wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
      })
      const { showOneClickOptimize } = result.current
      act(() => {
        showOneClickOptimize(selectedRows, mockOK)
      })
      const dialog = await screen.findByRole('dialog')
      expect(await within(dialog).findByText(/feature for/)).toBeVisible()
      expect(await within(dialog).findByText(/selected/)).toBeVisible()
      expect(await within(dialog).findByText(/3AM local time/)).toBeVisible()
      await userEvent.click((await within(dialog).findByText('Cancel')))
      await waitFor(() => expect(screen.queryByText('dialog')).toBeNull())
    })

    it('should handle mutation correctly (OPTIMIZE_TYPES.2_1) - multiple', async () => {
      const { sliceValue } = mockAIDrivenRow
      const selectedRows = [
        { ...mockAIDrivenRow, aiFeature: AiFeatures.RRM, ...extractItem },
        { ...mockEquiFlexRows[1], aiFeature: AiFeatures.EquiFlex, sliceValue, ...extractItem }
      ] as unknown as IntentListItem[]
      const mockOK = jest.fn()
      const { result } = renderHook(() => useIntentAIActions(), {
        wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
      })
      const { showOneClickOptimize } = result.current
      act(() => {
        showOneClickOptimize(selectedRows, mockOK)
      })
      const dialog = await screen.findByRole('dialog')
      expect(await within(dialog).findByText(/features for/)).toBeVisible()
      expect(await within(dialog).findByText(/3AM local time/)).toBeVisible()
      expect(await within(dialog).findByText(/Change time/)).toBeVisible()
      await userEvent.click((await within(dialog).findByText('Cancel')))
      await waitFor(() => expect(screen.queryByText('dialog')).toBeNull())
    })

    it('should handle mutation correctly (OPTIMIZE_TYPES.2_2)  - multiple', async () => {
      const selectedRows = [
        { ...mockAIDrivenRow, aiFeature: AiFeatures.RRM, ...extractItem },
        { ...mockEquiFlexRows[1], aiFeature: AiFeatures.EquiFlex, ...extractItem }
      ] as unknown as IntentListItem[]
      const { result } = renderHook(() => useIntentAIActions(), {
        wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
      })
      const { showOneClickOptimize } = result.current
      act(() => {
        showOneClickOptimize(selectedRows, mockOK)
      })
      const dialog = await screen.findByRole('dialog')
      expect(await within(dialog).findByText(/features across/)).toBeVisible()
      expect(await within(dialog).findByText(/selected/)).toBeVisible()
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
      expect(mockedTransitionIntent).toHaveBeenCalledWith({
        action: Actions.One_Click_Optimize,
        data: [{
          id: '15',
          displayStatus: DisplayStates.new,
          status: Statuses.new,
          metadata: {
            scheduledAt: '2024-07-21T04:45:00.000Z',
            changedByName: 'FirstName R1 LastName-R1',
            preferences: {
              crrmFullOptimization: true
            }
          }
        },{
          id: '17',
          displayStatus: DisplayStates.new,
          status: Statuses.new,
          metadata: {
            scheduledAt: '2024-07-21T04:45:00.000Z',
            changedByName: 'FirstName R1 LastName-R1',
            wlans: [{ name: 'i4', ssid: 's4' },{ name: 'i5', ssid: 's5' },{ name: 'i6', ssid: 's6' }]
          }
        }]

      })
      await waitFor(() => expect(mockOK).toBeCalledTimes(1))
    })
  })

  describe('rai - OneClickOptimize', () => {
    const mockOK = jest.fn()
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      jest.mocked(get).mockReturnValue('true')
      mockOK.mockClear()
    })
    afterEach(() => {
      cleanup()
    })
    describe('rai - AI-Driven', () => {
      it('should handle mutation correctly - single', async () => {
        const selectedRow = [{ ...mockAIDrivenRow, aiFeature: AiFeatures.RRM, ...extractItem }] as unknown as IntentListItem[]
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
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
        expect(mockedTransitionIntent).toHaveBeenCalledWith({
          action: Actions.One_Click_Optimize,
          data: [{
            id: '15',
            displayStatus: DisplayStates.new,
            status: Statuses.new,
            metadata: {
              scheduledAt: '2024-07-21T04:45:00.000Z',
              changedByName: 'FirstName RAI LastName-RAI',
              preferences: {
                crrmFullOptimization: true
              }
            }
          }]
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })
    })

    describe('rai - EquiFlex', () => {
      it('should handle mutation correctly  - single', async () => {
        const selectedRow = [{ ...mockEquiFlexRows[0], aiFeature: AiFeatures.EquiFlex, ...extractItem }] as unknown as IntentListItem[]
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
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
        expect(mockedTransitionIntent).toHaveBeenCalledWith({
          action: Actions.One_Click_Optimize,
          data: [{
            id: '16',
            displayStatus: DisplayStates.new,
            status: Statuses.new,
            metadata: {
              scheduledAt: '2024-07-21T04:45:00.000Z',
              changedByName: 'FirstName RAI LastName-RAI',
              wlans: [{ name: 'n1', ssid: 's1' },{ name: 'n2', ssid: 's2' },{ name: 'n3', ssid: 's3' }]
            }
          }]
        })
        await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      })

      it('should show error when date time before  - single', async () => {
        const selectedRow = [{ ...mockEquiFlexRows[0], aiFeature: AiFeatures.EquiFlex, ...extractItem }] as unknown as IntentListItem[]
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
        })
        const { showOneClickOptimize } = result.current
        act(() => {
          showOneClickOptimize(selectedRow, mockOK)
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
        const selectedRow = { ...mockEquiFlexRows[0], aiFeature: AiFeatures.EquiFlex, ...extractItem } as unknown as IntentListItem
        const { result } = renderHook(() => useIntentAIActions(), {
          wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
        })
        const { fetchWlans } = result.current
        act(() => {
          fetchWlans(selectedRow)
        })
        await waitFor(() => expect(mockedIntentWlansQuery).toBeCalledTimes(1))
        expect(mockedIntentWlansQuery).toHaveBeenCalledWith(selectedRow)
      })
    })

    it('should show error toast when mutation fail - single', async () => {
      const resp = {
        t1: { success: false, errorMsg: 'mutation fail' , errorCode: '' },
        t2: { success: true, errorMsg: '' , errorCode: '' }
      } as TransitionMutationResponse
      mockedTransitionIntent.mockReturnValue(Promise.resolve({ data: resp }))
      mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
      const selectedRow = [{ ...mockEquiFlexRows[0], aiFeature: AiFeatures.EquiFlex, ...extractItem }] as unknown as IntentListItem[]
      const { result } = renderHook(() => useIntentAIActions(), {
        wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
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
      await waitFor(() => expect(mockedTransitionIntent).toBeCalledTimes(1))
      expect(await screen.findByText(/mutation fail/)).toBeVisible()
    })
  })

  describe('Other Actions', () => {
    const mockOK = jest.fn()
    beforeEach((done) => {
      global.originalLocation = window.location
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      jest.mocked(get).mockReturnValue('true')
      mockOK.mockClear()
      const toast = screen.queryAllByRole('img', { name: 'close' })
      toast.forEach((t) => {
        if (t) {
          waitForElementToBeRemoved(toast).then(done)
          message.destroy()
        } else {
          done()
        }
      })
    })
    it('should handle handleTransitionIntent', async () => {
      const statusTrail = [ { status: 'new' }]
      const selectedRows = [
        {
          ...mockAIDrivenRow,
          aiFeature: AiFeatures.RRM,
          ...extractItem,
          displayStatus: DisplayStates.active,
          status: Statuses.active,
          statusTrail
        }, {
          ...mockEquiFlexRows[1],
          aiFeature: AiFeatures.EquiFlex,
          ...extractItem,
          displayStatus: DisplayStates.active,
          status: Statuses.active,
          statusTrail
        }
      ] as unknown as IntentListItem[]
      const { result } = renderHook(() => useIntentAIActions(), {
        wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
      })
      const { handleTransitionIntent } = result.current
      act(() => {
        handleTransitionIntent(Actions.Pause, selectedRows, mockOK)
      })
      expect(mockedTransitionIntent).toHaveBeenCalledWith({
        action: Actions.Pause,
        data: [{
          id: '15',
          displayStatus: DisplayStates.active,
          status: Statuses.active,
          statusTrail,
          metadata: {
            ...mockAIDrivenRow.metadata,
            changedByName: 'FirstName RAI LastName-RAI'
          }
        },{
          id: '17',
          displayStatus: DisplayStates.active,
          status: Statuses.active,
          statusTrail,
          metadata: {
            changedByName: 'FirstName RAI LastName-RAI'
          }
        }]
      })
      await waitFor(() => expect(mockOK).toBeCalledTimes(1))

      expect(await screen.findByText(/The selected intents has been updated/)).toBeVisible()
      const viewElement = await screen.findByText('View')
      await userEvent.click(viewElement)
      expect(window.location.href).toContain('?intentTableFilters=%257B%2522statusLabel%2522%253A%255B%2522')
      expect(window.location.href).toContain('paused-from-inactive')
      expect(window.location.href).toContain('paused-from-active')
      expect(window.location.href).toContain('paused-by-default')
    })

    it('should handle revert', async () => {
      const statusTrail = [ { status: 'new' }]
      const selectedRows = [
        {
          ...mockAIDrivenRow, aiFeature: AiFeatures.RRM,
          ...extractItem,
          displayStatus: DisplayStates.active,
          status: Statuses.active,
          statusTrail
        },
        {
          ...mockEquiFlexRows[1], aiFeature: AiFeatures.EquiFlex,
          ...extractItem,
          displayStatus: DisplayStates.active,
          status: Statuses.active,
          statusTrail
        }
      ] as unknown as IntentListItem[]
      const { result } = renderHook(() => useIntentAIActions(), {
        wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
      })
      const { revert } = result.current
      act(() => {
        revert(moment('2024-07-21T04:45:00.000Z'), selectedRows, mockOK)
      })
      expect(mockedTransitionIntent).toHaveBeenCalledWith({
        action: Actions.Revert,
        data: [{
          id: '15',
          displayStatus: DisplayStates.active,
          status: Statuses.active,
          metadata: { scheduledAt: '2024-07-21T04:45:00.000Z',
            changedByName: 'FirstName RAI LastName-RAI' }
        },{
          id: '17',
          displayStatus: DisplayStates.active,
          status: Statuses.active,
          metadata: { scheduledAt: '2024-07-21T04:45:00.000Z',
            changedByName: 'FirstName RAI LastName-RAI' }
        }]
      })
      await waitFor(() => expect(mockOK).toBeCalledTimes(1))
      expect(await screen.findByText(/The selected intents has been updated/)).toBeVisible()
      const link =
      '?intentTableFilters=%257B%2522statusLabel%2522%253A%255B%2522revertscheduled%2522%255D%257D'
      const viewElement = await screen.findByText('View')
      await userEvent.click(viewElement)
      expect(window.location.href).toContain(link)
    })

    it('should show error toast when revert fail - single', async () => {
      const resp = {
        t1: { success: false, errorMsg: 'revert fail' , errorCode: '' },
        t2: { success: true, errorMsg: '' , errorCode: '' }
      } as TransitionMutationResponse
      mockedTransitionIntent.mockReturnValue(Promise.resolve({ data: resp }))
      mockGraphqlMutation(intentAIUrl, 'TransitionIntent', { data: resp })
      const selectedRows = [{ ...mockEquiFlexRows[0], aiFeature: AiFeatures.EquiFlex, ...extractItem }] as unknown as IntentListItem[]
      const { result } = renderHook(() => useIntentAIActions(), {
        wrapper: ({ children }) => <BrowserRouter><Provider children={children} /></BrowserRouter>
      })
      const { revert } = result.current
      act(() => {
        revert(moment('2020-07-21T04:45:00.000Z'), selectedRows, mockOK)
      })
      expect(await screen.findByText(/Revert Scheduled time cannot be before/)).toBeVisible()
    })
  })
})
