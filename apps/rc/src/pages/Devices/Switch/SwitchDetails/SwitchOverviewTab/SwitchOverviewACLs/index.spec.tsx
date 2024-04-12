import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { switchApi }       from '@acx-ui/rc/services'
import { SwitchUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  within
} from '@acx-ui/test-utils'

import { aclList } from '../__tests__/fixtures'

import { SwitchOverviewACLs } from '.'

describe('Switch Overview ACLs', () => {
  const params = {
    tenantId: 'tenant-id',
    switchId: 'switch-id',
    serialNumber: 'switch-serialNumber'
  }

  const mockServerQuery = () => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchAcls.url,
        (_, res, ctx) => res(ctx.json(aclList)))
    )
  }

  afterEach(()=>{
    Modal.destroyAll()
  })

  it('should click extended ACL table correctly', async () => {
    mockServerQuery()
    render(<Provider><SwitchOverviewACLs /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/acls'
      }
    })

    expect(await screen.findByText(/extended-acl/i)).toBeVisible()
    await userEvent.click(screen.getByText(/extended-acl/i))

    const drawer = await screen.findByRole('dialog')
    expect(await within(drawer).findByText(/View ACL/i)).toBeVisible()
    expect(await within(drawer).findByRole('columnheader', { name: 'Protocol' })).toBeVisible()
    expect(await within(drawer).findByText('Extended')).toBeVisible()
    await userEvent.click(within(drawer).getByRole('button', {
      name: /close/i
    }))
  })

  it('should click standard ACL correctly', async () => {
    mockServerQuery()
    render(<Provider><SwitchOverviewACLs /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/acls'
      }
    })

    expect(await screen.findByText(/standard-acl/i)).toBeVisible()
    await userEvent.click(screen.getByText(/standard-acl/i))

    const drawer = await screen.findByRole('dialog')
    expect(await within(drawer).findByText(/View ACL/i)).toBeVisible()
    expect(within(drawer).queryByRole('columnheader', { name: 'Protocol' })).toBeNull()
    await userEvent.click(within(drawer).getByRole('button', {
      name: /close/i
    }))
  })

  it('should click ipv6 ACL correctly', async () => {
    mockServerQuery()
    render(<Provider><SwitchOverviewACLs /></Provider>, {
      route: {
        params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/overview/acls'
      }
    })

    expect(await screen.findByText(/ipv6-acl/i)).toBeVisible()
    await userEvent.click(screen.getByText(/ipv6-acl/i))

    const drawer = await screen.findByRole('dialog')
    expect(await within(drawer).findByText(/View ACL/i)).toBeVisible()
    expect(await within(drawer).findByRole('columnheader', { name: 'Protocol' })).toBeVisible()
    expect(await within(drawer).findAllByText('IPv6')).toHaveLength(2)
    await userEvent.click(within(drawer).getByRole('button', {
      name: /close/i
    }))
  })
})
