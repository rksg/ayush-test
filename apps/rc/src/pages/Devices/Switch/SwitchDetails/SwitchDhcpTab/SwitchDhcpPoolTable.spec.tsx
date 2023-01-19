import '@testing-library/jest-dom'
import { rest } from 'msw'

import { switchApi }                                     from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                                from '@acx-ui/rc/utils'
import { Provider, store }                               from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within } from '@acx-ui/test-utils'

import { poolData, switchDetailData } from '../__tests__/fixtures'

import { SwitchDhcpPoolTable } from './SwitchDhcpPoolTable'

describe('SwitchDhcpPoolTable', () => {
  const params = {
    tenantId: ':tenantId',
    switchId: ':switchId',
    serialNumber: ':serialNumber',
    activeTab: 'dhcp',
    activeSubTab: 'pool'
  }

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.get( SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetailData))),
      rest.post( SwitchUrlsInfo.getDhcpPools.url,
        (_, res, ctx) => res(ctx.json({
          page: 1, totalCount: 1, data: [poolData]
        }))),
      rest.get( SwitchUrlsInfo.getDhcpServer.url,
        (_, res, ctx) => res(ctx.json(poolData)))
    )
  })

  it('should render correctly', async () => {
    render(<Provider><SwitchDhcpPoolTable /></Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    const row = await screen.findByRole('row', { name: /poolA/i })
    expect(row).toHaveTextContent('1 day 2 mins')

    fireEvent.click(row)
    const editButton = screen.getByRole('button', { name: 'Edit' })
    fireEvent.click(editButton)

    fireEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should do deleting by action bar', async () => {
    render(<Provider><SwitchDhcpPoolTable /></Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    const row = await screen.findByRole('row', { name: /poolA/i })
    fireEvent.click(row)
    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    fireEvent.click(deleteButton)

    const deleteDialog = await screen.findByRole('dialog')
    fireEvent.click(within(deleteDialog).getByRole('button', { name: /Delete Pool/i }))
  })

  it('should do adding by Add button', async () => {
    render(<Provider><SwitchDhcpPoolTable /></Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    const addButton = await screen.findByRole('button', { name: 'Add Pool' })
    fireEvent.click(addButton)

    const poolDialog = await screen.findByRole('dialog')

    fireEvent.click(within(poolDialog).getByRole('button', { name: 'Cancel' }))
  })
})