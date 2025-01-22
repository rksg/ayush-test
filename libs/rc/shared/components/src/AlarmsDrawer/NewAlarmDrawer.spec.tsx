import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { eventAlarmApi, networkApi } from '@acx-ui/rc/services'
import {
  Alarm,
  CommonRbacUrlsInfo,
  CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                              from '@acx-ui/store'
import {  mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

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
  ] as Alarm[]
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
      egdeName: 'Some_Edge',
      id: 'FEK3224R08Q_edge_status'
    }
  ],
  fields: [
    'venueName',
    'apName',
    'switchName',
    'edgeName'
  ]
}
const services = require('@acx-ui/rc/services')

describe('NewAlarmsDrawer', () => {
  const requestMetasSpy = jest.fn()
  const deleteByVenue = jest.fn()
  const deleteAlarm = jest.fn()
  beforeEach(async () => {
    store.dispatch(eventAlarmApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    jest.spyOn(services, 'useAlarmsListQuery')
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json(venuelist))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (_, res, ctx) => res(ctx.json(alarmList))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsListMeta.url,
        (_, res, ctx) => {
          requestMetasSpy()
          return res(ctx.json(alarmListMeta))}
      ),
      rest.delete(
        CommonRbacUrlsInfo.clearAlarmByVenue.url,
        (_, res, ctx) => {
          deleteByVenue()
          return res(ctx.json({}))}
      ),
      rest.patch(
        CommonUrlsInfo.clearAlarm.url,
        (_, res, ctx) => {
          deleteAlarm()
          return res(ctx.json({}))}
      )
    )
    requestMetasSpy.mockClear()
    deleteByVenue.mockClear()
    deleteAlarm.mockClear()
  })
  afterEach(() => {
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
    await waitFor(() => expect(requestMetasSpy).toBeCalledTimes(2))

    expect(await screen.findByRole('tab', { name: 'New Alarms' })).toBeVisible()
    expect(await screen.findByRole('tab', { name: 'Cleared Alarms' })).toBeVisible()
    expect(await screen.findByText('All Severities')).toBeVisible()
    expect(await screen.findByText('Products')).toBeVisible()
    expect(await screen.findByText('Some_Switch')).toBeVisible()

    await userEvent.click((await screen.findByText('Clear all alarms')))

    await waitFor(() => expect(deleteByVenue).toBeCalled())
    const cancelButton = await screen.findByRole('button', { name: 'Close' })
    await userEvent.click(cancelButton)
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
    await waitFor(() => expect(requestMetasSpy).toBeCalledTimes(3))

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
  it('should clear alarm correctly', async () => {
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

    await userEvent.click(screen.getByRole('button', { name: 'Clear all alarms' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = screen.getByRole('table').querySelector('tbody')!
    expect(tbody).toBeVisible()
    const clearBtn = await within(tbody).findAllByRole('button')
    await userEvent.click(clearBtn[0])

    await waitFor(() => expect(deleteAlarm).toBeCalled())
    await waitFor(() => expect(screen.queryByTestId('Some_Switch')).toBeNull())
  })
})
