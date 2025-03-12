import userEvent from '@testing-library/user-event'

import { eventAlarmApi, getAggregatedList, networkApi } from '@acx-ui/rc/services'
import {
  Alarm,
  AlarmMeta
} from '@acx-ui/rc/utils'
import { Provider, store }                             from '@acx-ui/store'
import {  fireEvent, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { venuelist } from '../ApGroupEdit/__tests__/fixtures'

import { NewAlarmsDrawer } from './NewAlarmDrawer'

const alarmList = {
  data: [
    {
      severity: 'Critical',
      serialNumber: 'FEK3230S0A2',
      entityType: 'SWITCH',
      venueName: 'Test-Venue',
      switchMacAddress: '58:fb:96:0e:81:b2',
      startTime: 1659948103000,
      entityId: 'FEK3230S0A2',
      id: 'FEK3230S0A2_switch_status',
      message: '{ "message_template": "@@switchName update failed." }'
    },
    {
      severity: 'Major',
      serialNumber: 'FEK3224R08J',
      entityType: 'AP',
      venueName: 'My-Venue',
      startTime: 1657686000000,
      entityId: 'FEK3224R08J',
      id: 'FEK3224R08J_ap_status',
      message: '{ "message_template": "@@apName disconnected." }'
    },
    {
      severity: 'Major',
      serialNumber: 'FEK3224R08J',
      entityType: 'EDGE',
      startTime: 1657686000000,
      entityId: 'FEK3224R08Q',
      id: 'FEK3224R08Q_edge_status',
      message: '{ "message_template": "@@edgeName disconnected." }'
    }
  ] as Alarm[],
  page: 1,
  totalCount: 3
}

const alarmListMeta = {
  data: [
    {
      switchName: 'Some_Switch',
      id: 'FEK3230S0A2_switch_status',
      isSwitchExists: true
    },
    {
      apName: 'Some_AP',
      id: 'FEK3224R08J_ap_status'
    },
    {
      edgeName: 'Some_Edge',
      id: 'FEK3224R08Q_edge_status',
      isSwitchExists: false,
      switchName: '',
      apName: ''
    }
  ] as AlarmMeta[],
  page: 1,
  totalCount: 3
}
const alarmResult = getAggregatedList(alarmList, alarmListMeta)
const services = require('@acx-ui/rc/services')
const mockClearAlarmMutation = jest.fn().mockImplementation(() => Promise.resolve())
const mockClearAlarmByVenueMutation = jest.fn().mockImplementation(() => Promise.resolve())
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useClearAlarmMutation: () => ([ mockClearAlarmMutation, { isLoading: false } ]),
  useClearAlarmByVenueMutation: () => ([ mockClearAlarmByVenueMutation, { isLoading: false } ])
}))

describe('NewAlarmsDrawer', () => {
  beforeEach(async () => {
    store.dispatch(eventAlarmApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    services.useAlarmsListQuery = jest.fn().mockImplementation((arg) => {
      let result = alarmResult
      if (arg.payload?.filters?.venueId) {
        const venueName = venuelist.data.find(v =>
          arg.payload?.filters?.venueId.includes(v.id))?.name ?? ''
        const data = result.data?.filter(a => a.venueName === venueName)
        result.data = data
      }
      if (arg.payload?.filters?.serialNumber) {
        const data = result.data?.filter(a =>
          arg.payload?.filters?.serialNumber.includes(a.serialNumber))
        result.data = data
      }
      return { data: result }
    })
    services.useGetVenuesQuery = jest.fn().mockImplementation(() => {
      return { data: venuelist }
    })
  })
  it('should show alarms drawer', async () => {
    render(
      <Provider>
        <NewAlarmsDrawer visible={true} setVisible={jest.fn()}/>
      </Provider>, {
        route: { params: {
          tenantId: 'tenant-id'
        } }
      }
    )

    window.dispatchEvent(new CustomEvent('showAlarmDrawer',
      { detail: { data: { name: 'all' } } }
    ))

    await waitFor(() => expect(screen.getByText('Some_Switch')).toBeVisible())

    expect(await screen.findByRole('tab', { name: 'New Alarms' })).toBeVisible()
    expect(await screen.findByRole('tab', { name: 'Cleared Alarms' })).toBeVisible()
    expect(await screen.findByText('All Severities')).toBeVisible()
    expect(await screen.findByText('Products')).toBeVisible()
    expect(await screen.findByText('Some_Switch')).toBeVisible()

    const cancelButton = await screen.findByRole('button', { name: 'Close' })
    await userEvent.click(cancelButton)
  })
  it('should clear alarms correctly', async () => {
    render(
      <Provider>
        <NewAlarmsDrawer visible={true} setVisible={jest.fn()}/>
      </Provider>, {
        route: { params: {
          tenantId: 'tenant-id'
        } }
      }
    )

    window.dispatchEvent(new CustomEvent('showAlarmDrawer',
      { detail: { data: { name: 'all' } } }
    ))

    expect(await screen.findByText('Some_Switch')).toBeVisible()
    expect(await screen.findByText('Some_AP')).toBeVisible()
    expect(await screen.findByText('Some_Edge')).toBeVisible()

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()
    const clearBtn = await within(tbody).findAllByRole('button')
    fireEvent.click(clearBtn[0])
    await waitFor(() => expect(mockClearAlarmMutation).toBeCalled())

    fireEvent.click(await screen.findByRole('button', { name: 'Clear all alarms' }))
    await waitFor(() => expect(mockClearAlarmByVenueMutation).toBeCalled())
  })
  it('should set selected filters in alarms drawer correctly', async () => {
    render(
      <Provider>
        <NewAlarmsDrawer visible={true} setVisible={jest.fn()}/>
      </Provider>, {
        route: { params: {
          tenantId: 'tenant-id'
        } }
      }
    )

    window.dispatchEvent(new CustomEvent('showAlarmDrawer',
      { detail: { data: { name: 'Major', product: 'WIFI' } } }
    ))

    await waitFor(() => expect(screen.getByText('Major')).toBeVisible())

    expect(await screen.findByText('Some_Switch')).toBeVisible()
    expect(await screen.findAllByRole('combobox')).toHaveLength(2)
    expect(await screen.findByText('Major')).toBeVisible()
    expect(await screen.findAllByText('Wi-Fi')).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: 'Clear Filters' }))
    expect(screen.queryByText('Major')).toBeNull()
    expect(screen.getByText('Wi-Fi')).toBeVisible()

    await userEvent.click(screen.getByRole('tab', { name: 'Cleared Alarms' }))
    expect(await screen.findByText('Cleared By')).toBeVisible()
    expect(await screen.findByText('Major')).toBeVisible()
    expect(await screen.findAllByText('Wi-Fi')).toHaveLength(2)
    await userEvent.click(screen.getByRole('button', { name: 'Clear Filters' }))
    expect(screen.queryByText('Major')).toBeNull()
    expect(screen.getByText('Wi-Fi')).toBeVisible()
  })
  it('should filter data correctly', async () => {
    render(
      <Provider>
        <NewAlarmsDrawer visible={true} setVisible={jest.fn()}/>
      </Provider>, {
        route: { params: {
          tenantId: 'tenant-id'
        } }
      }
    )

    window.dispatchEvent(new CustomEvent('showAlarmDrawer',
      { detail: { data:
        { venueId: '908c47ee1cd445838c3bf71d4addccdf', serialNumber: 'FEK3230S0A2' } } }
    ))

    await waitFor(() => expect(screen.queryByText('Some_AP')).toBeNull())
    await waitFor(() => expect(screen.queryByText('Some_Edge')).toBeNull())
    expect(await screen.findByText('Some_Switch')).toBeVisible()
  })
})
