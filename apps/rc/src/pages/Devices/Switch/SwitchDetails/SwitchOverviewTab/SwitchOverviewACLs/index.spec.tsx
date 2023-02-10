import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import {
  render,
  screen,
  mockServer
} from '@acx-ui/test-utils'

import { aclList } from '../__tests__/fixtures'

import { SwitchOverviewACLs } from '.'

describe('Switch Overview ACLs', () => {
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id',
    serialNumber: 'switch-serialNumber'
  }

  beforeEach(()=>{
    mockServer.use(
      rest.get(SwitchUrlsInfo.getSwitchAcls.url,
        (_, res, ctx) => res(ctx.json(aclList)))
    )
  })

  it('should click extended ACL table correctly', async () => {
    render(<Provider><SwitchOverviewACLs /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/acls'
      }
    })

    expect(await screen.findByText(/extended-acl/i)).toBeVisible()
    await userEvent.click(screen.getByText(/extended-acl/i))
    expect(await screen.findByText(/View ACL/i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', {
      name: /close/i
    }))
  })

  it('should click standard ACL correctly', async () => {
    render(<Provider><SwitchOverviewACLs /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/acls'
      }
    })

    expect(await screen.findByText(/standard-acl/i)).toBeVisible()
    await userEvent.click(screen.getByText(/standard-acl/i))
    expect(await screen.findByText(/View ACL/i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', {
      name: /close/i
    }))
  })

})
