

import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import { mockServer, render } from '@acx-ui/test-utils'

import { AlarmsTable } from '../../Alarms/Table'


const params = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  venueId: 'f892848466d047798430de7ac234e940'
}

const alarmsList = {
  data: [],
  subsequentQueries: [
    {
      fields: [
        'venueName',
        'apName',
        'switchName'
      ],
      url: '/api/eventalarmapi/6a7c7d6df1e14cbea702d8fab27aeb54/alarm/meta'
    }
  ],
  totalCount: 0,
  fields: [
    'startTime',
    'severity',
    'message',
    'id',
    'serialNumber',
    'entityType',
    'entityId',
    'sourceType',
    'switchMacAddress'
  ]
}
describe('MeshNetwork', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        CommonUrlsInfo.getAlarmsList.url,
        (_, res, ctx) => res(ctx.json(alarmsList)))
    )
  })
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><AlarmsTable /></Provider>, { route: { params } })

    expect(asFragment()).toMatchSnapshot()
  })
})
