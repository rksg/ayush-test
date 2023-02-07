import '@testing-library/jest-dom'
import { rest } from 'msw'

import { SwitchUrlsInfo }                                from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within } from '@acx-ui/test-utils'

import { poolData } from '../__tests__/fixtures'

import { AddPoolDrawer } from './AddPoolDrawer'


describe('AddPoolDrawer', () => {
  const params = {
    tenantId: ':tenantId',
    switchId: ':switchId',
    serialNumber: ':serialNumber',
    activeTab: 'dhcp',
    activeSubTab: 'pool'
  }
  beforeEach(() => {
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

    const addButton = await screen.findByRole('button', { name: 'Add Option' })
    fireEvent.click(addButton)

    const optionDialog = await screen.findByRole('dialog', { name: /Add DHCP Option/i })
    fireEvent.click(await within(optionDialog).findByRole('button', { name: 'Cancel' }))
  })

  it.skip('should render edit form correctly', async () => {
    render(<Provider><AddPoolDrawer visible={true} editPoolId={poolData.id} /></Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    const row = await screen.findByRole('row', { name: /Time Server/i })
    fireEvent.click(row)
    const editButton = screen.getByRole('button', { name: 'Edit' })
    fireEvent.click(editButton)

    const optionDialog = await screen.findByRole('dialog', { name: /Edit DHCP Option/i })

    const combobox = await within(optionDialog).findByLabelText('DHCP Option')
    fireEvent.change(combobox, { target: { value: '122' } })
    combobox.focus()
    fireEvent.click(await screen.findByText('CCC', { exact: false })) // option "122 CCC"

    const radio = await within(optionDialog).findByRole('radio', { name: 'HEX' })
    expect(radio).toBeEnabled()
    fireEvent.click(radio)

    const input = await within(optionDialog).findByLabelText('Option Value')
    fireEvent.change(input, { target: { value: 'abc' } })
    input.focus()

    fireEvent.click(await within(optionDialog).findByRole('button', { name: 'OK' }))

    fireEvent.click(await screen.findByRole('row', { name: /CCC/i }))
    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    fireEvent.click(deleteButton)
  })
})