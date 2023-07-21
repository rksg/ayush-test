import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { switchApi }                                   from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                              from '@acx-ui/rc/utils'
import { Provider, store }                             from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { poolData, switchDetailData } from '../__tests__/fixtures'

import { SwitchDhcpPoolTable } from './SwitchDhcpPoolTable'

type MockDrawerProps = React.PropsWithChildren<{
  visible: boolean
  onSavePool: () => void
  onClose: () => void
}>
jest.mock('./AddPoolDrawer', () => ({
  AddPoolDrawer: ({ onSavePool, onClose, visible }: MockDrawerProps) =>
    visible && <div data-testid={'AddPoolDrawer'}>
      <button onClick={(e)=>{
        e.preventDefault()
        onSavePool()
      }}>Save</button>
      <button onClick={(e)=>{
        e.preventDefault()
        onClose()
      }}>Cancel</button>
    </div>
}))

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
        (_, res, ctx) => res(ctx.json(switchDetailData))
      ),
      rest.post( SwitchUrlsInfo.getDhcpPools.url,
        (_, res, ctx) => res(ctx.json({
          page: 1, totalCount: 1, data: [poolData]
        }))
      ),
      rest.get( SwitchUrlsInfo.getDhcpServer.url,
        (_, res, ctx) => res(ctx.json(poolData))
      ),
      rest.put( SwitchUrlsInfo.updateDhcpServer.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.delete( SwitchUrlsInfo.deleteDhcpServers.url,
        (_, res, ctx) => res(ctx.json({}))
      )
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

    await userEvent.click(await within(row).findByRole('checkbox'))
    const editButton = await screen.findByRole('button', { name: 'Edit' })
    await userEvent.click(editButton)

    const dialog = await screen.findByTestId('AddPoolDrawer')
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should do deleting by action bar', async () => {
    render(<Provider><SwitchDhcpPoolTable /></Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    const row = await screen.findByRole('row', { name: /poolA/i })
    await userEvent.click(await within(row).findByRole('checkbox'))
    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    await userEvent.click(deleteButton)

    const deleteDialog = await screen.findByRole('dialog')
    await userEvent.click(await within(deleteDialog).findByRole('button', { name: /Delete Pool/i }))
    await waitFor(() => expect(deleteDialog).not.toBeVisible())
  })

  it('should do adding by Add button', async () => {
    render(<Provider><SwitchDhcpPoolTable /></Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    const addButton = await screen.findByRole('button', { name: 'Add Pool' })
    await userEvent.click(addButton)

    const poolDialog = await screen.findByTestId('AddPoolDrawer')
    await userEvent.click(await within(poolDialog).findByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(poolDialog).not.toBeVisible())
  })
})
