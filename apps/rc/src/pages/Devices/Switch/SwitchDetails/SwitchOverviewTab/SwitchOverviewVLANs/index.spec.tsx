import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  render,
  screen,
  mockServer
} from '@acx-ui/test-utils'

import { vlanList } from './__tests__/fixtures'

import { SwitchOverviewVLANs } from '.'

describe('Switch Overview VLAN', () => {
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id',
    serialNumber: 'switch-serialNumber'
  }

  beforeEach(()=>{
    mockServer.use(
      rest.post(SwitchUrlsInfo.getVlanListBySwitchLevel.url,
        (req, res, ctx) => res(ctx.json(vlanList)))
    )
  })

  it('should render vlan table correctly', async () => {
    render(<Provider><SwitchOverviewVLANs /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/vlans'
      }
    })

    expect(await screen.findByText(/111/i)).toBeVisible()
    await userEvent.click(screen.getByText(/111/i))
    expect(await screen.findByText(/View VLAN/i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', {
      name: /close/i
    }))
    await userEvent.click(await screen.findByText(/666/i))
    expect(await screen.findByText(/View VLAN/i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', {
      name: /close/i
    }))
    await userEvent.click(await screen.findByText(/222/i))
    expect(await screen.findByText(/View VLAN/i)).toBeVisible()
  })

})
