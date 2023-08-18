import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { ApContextProvider } from '../ApContextProvider'

import { mockedAp } from './__tests__/fixtures'

import { ApNeighborsTab } from '.'


jest.mock('./ApLldpNeighbors', () => () => {
  return <div data-testid='ap-lldp-neighbors' />
})

jest.mock('./ApRfNeighbors', () => () => {
  return <div data-testid='ap-rf-neighbors' />
})

const wrapper = (props: { children: JSX.Element }) => <Provider>
  <ApContextProvider {...props} />
</Provider>

describe('ApNeighborsTab', () => {
  const tabPath = '/:tenantId/t/devices/wifi/:apId/details/neighbors/:activeSubTab'
  const params = {
    tenantId: 'TENANT_ID',
    apId: mockedAp.data[0].serialNumber,
    activeSubTab: 'lldp'
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ ...mockedAp }))
      ),
      rest.patch(
        WifiUrlsInfo.detectApNeighbors.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123456789' }))
      )
    )
  })

  it('should render Neighbors tab', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<ApNeighborsTab />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await userEvent.click(await screen.findByRole('tab', { name: /RF Neighbors/ }))
    expect(await screen.findByTestId('ap-rf-neighbors')).toBeVisible()
  })

  it('should not render Neighbors tab when the FF is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(<ApNeighborsTab />, {
      wrapper,
      route: { params, path: tabPath }
    })

    await waitFor(() => {
      expect(screen.queryByTestId('ap-lldp-neighbors')).not.toBeInTheDocument()
    })
  })

  it('should navigate to the default tab when there is no activeSubTab param', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<ApNeighborsTab />, {
      wrapper,
      route: {
        params: { tenantId: 'TENANT_ID', apId: 'APID' },
        path: '/:tenantId/t/devices/wifi/:apId/details/neighbors'
      }
    })

    expect(await screen.findByTestId('ap-lldp-neighbors')).toBeVisible()
  })
})
