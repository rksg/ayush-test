import '@testing-library/jest-dom'
import { rest } from 'msw'

import { DHCP_OPTION_TYPE, SwitchDhcpOption, SwitchUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }                                               from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { poolData } from '../__tests__/fixtures'

import { AddPoolDrawer } from './AddPoolDrawer'

const mockOptionData = {
  seq: 122,
  type: DHCP_OPTION_TYPE.HEX,
  value: 'abc'
}
type MockDrawerProps = React.PropsWithChildren<{
  open: boolean
  onSave: (values: SwitchDhcpOption) => void
  onCancel: () => void
}>
jest.mock('./DhcpOptionModal', () => ({
  DhcpOptionModal: ({ onSave, onCancel, open }: MockDrawerProps) =>
    open && <div data-testid={'DhcpOptionModal'}>
      <button onClick={(e)=>{
        e.preventDefault()
        onSave(mockOptionData)
      }}>OK</button>
      <button onClick={(e)=>{
        e.preventDefault()
        onCancel()
      }}>Cancel</button>
    </div>
}))

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

    const optionDialog = await screen.findByTestId('DhcpOptionModal')
    fireEvent.click(await within(optionDialog).findByRole('button', { name: 'OK' }))
    await waitFor(() => expect(optionDialog).not.toBeVisible())
  })

  it('should render edit form correctly', async () => {
    render(<Provider><AddPoolDrawer visible={true} editPoolId={poolData.id} /></Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })

    const row = await screen.findByRole('row', { name: /Time Server/i })
    fireEvent.click(row)
    const editButton = await screen.findByRole('button', { name: 'Edit' })
    fireEvent.click(editButton)

    const optionDialog = await screen.findByTestId('DhcpOptionModal')
    fireEvent.click(await within(optionDialog).findByRole('button', { name: 'OK' }))

    fireEvent.click(await screen.findByRole('row', { name: /CCC/i }))

    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    fireEvent.click(deleteButton)

    await waitFor(() =>
      expect(screen.queryByRole('row', { name: /CCC/i })).not.toBeInTheDocument())
  })
})
