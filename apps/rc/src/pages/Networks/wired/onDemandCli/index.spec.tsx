import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { SwitchUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { OnDemandCliTab } from '.'

const cliList = {
  data: [
    {
      applyLater: true,
      cli: 'clock timezone us Pacific\nclock summer-time',
      id: '36e4d1dd8ab04cfb958aad3105e93aee',
      name: 'cli-test',
      reload: false
    },
    {
      applyLater: true,
      cli: 'test cli',
      id: '36e4d1dd8ab04cfb958aad3105e93ae2',
      name: 'cli-test2',
      reload: false,
      variables: [{ name: 'test', type: 'RANGE', value: '5:6' }],
      venueSwitches: [{
        id: '92db943606a046b5b2cd9b30624c833b',
        switches: ['c0:c5:20:aa:24:0f'],
        venueId: 'e99dfe45ce6b41828be94eaff2a268ff'
      }]
    }
  ],
  fields: [
    'name',
    'id',
    'venueSwitches'
  ],
  page: 1,
  totalCount: 1,
  totalPages: 1
}

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Wired', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.getCliTemplates.url,
        (_, res, ctx) => res(ctx.json(cliList))),
      rest.delete(SwitchUrlsInfo.deleteCliTemplates.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' })))
    )
  })

  it('should render onDemandCli correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'onDemandCli'
    }
    render(<Provider><OnDemandCliTab /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('Add CLI Template')).toBeVisible()
    expect(await screen.findByText('cli-test')).toBeVisible()
  })


  it('should delete onDemandCli correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'onDemandCli'
    }
    render(<Provider><OnDemandCliTab /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('cli-test')).toBeVisible()
    await userEvent.click(await screen.findByText('cli-test'))
    await userEvent.click(await screen.findByText('Delete'))
    await userEvent.click(await screen.findByText('Delete CLI template'))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    await waitFor(async () => {
      expect(screen.queryAllByRole('dialog')).toHaveLength(0)
    })
    expect(dialog).not.toBeVisible()
  })

  it('should delete multi onDemandCli correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'onDemandCli'
    }
    render(<Provider><OnDemandCliTab /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('cli-test')).toBeVisible()
    await userEvent.click(await screen.findByText('cli-test'))
    await userEvent.click(await screen.findByText('cli-test2'))
    await userEvent.click(await screen.findByText('Delete'))
    await userEvent.click(await screen.findByText('Delete "2 CLI templates"?'))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    await waitFor(async () => {
      expect(screen.queryAllByRole('dialog')).toHaveLength(0)
    })
    expect(dialog).not.toBeVisible()
  })

  it('should edit onDemandCli correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'onDemandCli'
    }
    render(<Provider><OnDemandCliTab /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('cli-test')).toBeVisible()
    await userEvent.click(await screen.findByText('cli-test'))
    await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith(
      '36e4d1dd8ab04cfb958aad3105e93aee/edit', { replace: false }
    )
  })

  it('should add onDemandCli correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      activeTab: 'onDemandCli'
    }
    render(<Provider><OnDemandCliTab /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:activeTab' }
    })

    expect(await screen.findByText('cli-test')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add CLI Template' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith('add', { replace: false })
  })
})
