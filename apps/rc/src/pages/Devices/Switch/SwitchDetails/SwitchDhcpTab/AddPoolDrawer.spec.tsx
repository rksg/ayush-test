import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { switchApi }                                   from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                              from '@acx-ui/rc/utils'
import { Provider, store }                             from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { poolData } from '../__tests__/fixtures'

import { AddPoolDrawer } from './AddPoolDrawer'

describe('AddPoolDrawer', () => {
  const saveSpy = jest.fn()
  const params = {
    tenantId: 'tenantId',
    switchId: 'switchId',
    serialNumber: 'serialNumber',
    activeTab: 'dhcp',
    activeSubTab: 'pool'
  }
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    saveSpy.mockClear()
    mockServer.use(
      rest.get( SwitchUrlsInfo.getDhcpServer.url,
        (_, res, ctx) => res(ctx.json(poolData)))
    )
  })

  it('should render correctly', async () => {
    render(<Provider><AddPoolDrawer visible={true} /></Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    expect(await screen.findByText('Add DHCP Pool')).toBeVisible()
    const addButton = await screen.findByRole('button', { name: 'Add Option' })
    await userEvent.click(addButton)

    const optionDialog = await screen.findByTestId('dhcp-option-modal')
    await userEvent.click(await within(optionDialog).findByRole('button', { name: 'Cancel' }))
    await waitFor(async () =>
      expect(within(optionDialog).queryByRole('button', { name: 'Cancel' })).toBeNull()
    )
  })

  it('should save drawer correctly', async () => {
    render(<Provider>
      <AddPoolDrawer
        visible={true}
        editPoolId={poolData.id}
        onSavePool={saveSpy}
      />
    </Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    expect(await screen.findByText('Edit DHCP Pool')).toBeVisible()
    await waitFor(async () => {
      expect(await screen.findByLabelText(/Pool Name/)).toHaveValue('poolA')
    })

    await userEvent.type(await screen.findByLabelText(/Pool Name/), 'B')

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
    await waitFor(() => expect(saveSpy).toBeCalledWith({
      ...poolData,
      poolName: 'poolab'
    }))
  })

  it('should add DHCP options correctly', async () => {
    render(<Provider>
      <AddPoolDrawer visible={true} editPoolId={poolData.id} onSavePool={saveSpy}/>
    </Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    expect(await screen.findByText('Edit DHCP Pool')).toBeVisible()
    await waitFor(async () => {
      expect(await screen.findByLabelText(/Pool Name/)).toHaveValue('poolA')
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Add Option' }))
    const dialog = await screen.findByTestId('dhcp-option-modal')
    await userEvent.click(await within(dialog).findByRole('combobox'))
    await userEvent.click(await screen.findByText(/Time Offset/))
    await userEvent.type(await screen.findByLabelText(/Option Value/), '1')
    await userEvent.click(await within(dialog).findByRole('button', { name: 'OK' }))
    await waitFor(async () =>
      expect(within(dialog).queryByRole('button', { name: 'Cancel' })).toBeNull()
    )

    expect(await screen.findByRole('row', { name: /Time Offset/i })).toBeVisible()
  })

  it('should edit DHCP options correctly', async () => {
    render(<Provider>
      <AddPoolDrawer visible={true} editPoolId={poolData.id} onSavePool={saveSpy}/>
    </Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    expect(await screen.findByText('Edit DHCP Pool')).toBeVisible()
    await waitFor(async () => {
      expect(await screen.findByLabelText(/Pool Name/)).toHaveValue('poolA')
    })

    const row = await screen.findByRole('row', { name: /Time Server/i })
    await userEvent.click(row)
    const editButton = await screen.findByRole('button', { name: 'Edit' })
    await userEvent.click(editButton)

    const optionDialog = await screen.findByTestId('dhcp-option-modal')
    await userEvent.click(await within(optionDialog).findByRole('button', { name: 'OK' }))
    await waitFor(async () =>
      expect(within(optionDialog).queryByRole('button', { name: 'Cancel' })).toBeNull()
    )

    await userEvent.click(await screen.findByRole('row', { name: /CCC/i }))
    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    await userEvent.click(deleteButton)
    await waitFor(() =>
      expect(screen.queryByRole('row', { name: /CCC/i })).not.toBeInTheDocument()
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
    await waitFor(() => expect(saveSpy).toBeCalledWith({
      ...poolData,
      dhcpOptions: [
        poolData.dhcpOptions?.[0]
      ]
    }))
  })
})
