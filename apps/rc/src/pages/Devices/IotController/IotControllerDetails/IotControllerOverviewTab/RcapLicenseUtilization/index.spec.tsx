import { rest } from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { IotUrlsInfo }            from '@acx-ui/rc/utils'
import { Provider  }              from '@acx-ui/store'
import { render,
  mockServer,
  screen,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { data, noData } from './__tests__/fixtures'

import { RcapLicenseUtilization } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('RcapLicenseUtilization Widget', () => {
  let params: {
    tenantId: string,
    iotId: string,
    activeTab: string
  }
  jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.IOT_PHASE_2_TOGGLE)
  it('should render donut chart', async () => {
    mockServer.use(
      rest.get(IotUrlsInfo.getIotControllerLicenseStatus.url,
        (req, res, ctx) => res(ctx.json(data)))
    )

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      iotId: '1',
      activeTab: 'overview'
    }

    const { asFragment } = render(
      <Provider>
        <RcapLicenseUtilization />
      </Provider>,
      { route: { params, path: '/:tenantId/t/devices/iotController/:iotId/details/:activeTab' } }
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('RCAP License Utilization')
    expect(asFragment().querySelector('svg')).toBeDefined()
  })

  it('should render "No RCAP License Utilization" when no data exist', async () => {
    mockServer.use(
      rest.get(IotUrlsInfo.getIotControllerLicenseStatus.url,
        (req, res, ctx) => res(ctx.json(noData)))
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      iotId: '1',
      activeTab: 'overview'
    }

    render(
      <Provider>
        <RcapLicenseUtilization />
      </Provider>,
      { route: { params, path: '/:tenantId/t/devices/iotController/:iotId/details/:activeTab' } }
    )
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('No RCAP License Utilization')).toBeVisible()
  })
})
