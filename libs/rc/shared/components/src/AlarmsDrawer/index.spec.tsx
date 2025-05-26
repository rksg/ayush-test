import { waitFor } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import {
  Alarm,
  CommonRbacUrlsInfo,
  CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { venuelist } from '../ApGroupEdit/__tests__/fixtures'

import { AlarmsDrawer } from '.'

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

const mockedUseGetAlarmsListQuery = jest.fn()

describe('AlarmsDrawer', () => {
  const requestMetasSpy = jest.fn()
  const deleteByVenue = jest.fn()
  const deleteAll = jest.fn()
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json(venuelist))
      ),
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (_, res, ctx) => {
          mockedUseGetAlarmsListQuery()
          return res(ctx.json(alarmList))
        }
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
          deleteAll()
          return res(ctx.json({}))}
      )
    )
  })


  it('should show alarms drawer', async () => {
    await render(
      <Provider>
        <AlarmsDrawer visible={true} setVisible={jest.fn()}/>
      </Provider>, {
        route: { params: {
          tenantId: 'tenant-id'
        } }
      }
    )

    await fireEvent(document.body, new CustomEvent('showAlarmDrawer',
      { detail: { data: { name: 'all' } } }))

    expect(await screen.findByText('Some_Switch')).toBeVisible()

    await waitFor(() => expect(mockedUseGetAlarmsListQuery).toBeCalled())
    expect(await screen.findByText('Clear all alarms')).not.toBeDisabled()

    await userEvent.click((await screen.findByText('Clear all alarms')))

    expect(deleteAll).toBeCalled()

    const cancelButton = await screen.findByRole('button', { name: 'Close' })
    await userEvent.click(cancelButton)
  })
})
