import '@testing-library/jest-dom'
import { rest }    from 'msw'
import * as router from 'react-router-dom'

import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { mockServer, render, screen, fireEvent } from '@acx-ui/test-utils'

import { ApAnalyticsTab } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useParams: jest.fn()
}))

const list = {
  totalCount: 1,
  page: 1,
  data: [
    {
      serialNumber: '000000000001',
      name: 'mock-ap-1',
      model: 'R510',
      fwVersion: '6.2.0.103.261',
      venueId: '01d74a2c947346a1a963a310ee8c9f6f',
      venueName: 'Mock-Venue',
      deviceStatus: '2_00_Operational',
      IP: '10.00.000.101',
      apMac: '00:00:00:00:00:01',
      apStatusData: {
        APRadio: [
          {
            txPower: null,
            channel: 10,
            band: '2.4G',
            Rssi: null,
            radioId: 0
          },
          {
            txPower: null,
            channel: 120,
            band: '5G',
            Rssi: null,
            radioId: 1
          }
        ]
      },
      meshRole: 'DISABLED',
      deviceGroupId: '4fe4e02d7ef440c4affd28c620f93073',
      tags: '',
      deviceGroupName: ''
    }
  ]
}
describe('ApAnalyticsTab', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset()
  })
  it('should handle default tab', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(
      () => ({ tenantId: 't1', serialNumber: '000000000001' })
    )
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json(list))
      )
    )
    render(<Provider>
      <ApAnalyticsTab />
    </Provider>, {
      route: {
        params: { tenantId: 't1', serialNumber: '000000000001' },
        path: '/t/:tenantId/devices/wifi/:serialNumber/details/analytics'
      }
    })
    fireEvent.click(await screen.findByText('Health'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t/t1/devices/wifi/000000000001/details/analytics/health/overview'
    )
  })
})
