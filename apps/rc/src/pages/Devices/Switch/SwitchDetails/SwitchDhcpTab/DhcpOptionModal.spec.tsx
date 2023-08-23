import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { DHCP_OPTION_TYPE } from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'
import { render, screen }   from '@acx-ui/test-utils'

import { DhcpOptionModal } from './DhcpOptionModal'

const mockOptionData = {
  seq: 4,
  type: DHCP_OPTION_TYPE.IP,
  value: '1.2.3.4'
}

const mockOption6Data = {
  seq: 6,
  type: DHCP_OPTION_TYPE.IP,
  value: '1.2.3.4 4.5.6.7'
}

describe('DhcpOptionModal', () => {
  const params = {
    tenantId: ':tenantId',
    switchId: ':switchId',
    serialNumber: ':serialNumber',
    activeTab: 'dhcp',
    activeSubTab: 'pool'
  }
  it('should render correctly', async () => {
    render(<Provider><DhcpOptionModal open={true} editRecord={mockOptionData}/></Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })
    await screen.findByDisplayValue('1.2.3.4')

    const combobox = await screen.findByLabelText('DHCP Option')
    await userEvent.type(combobox, '122')
    combobox.focus()
    await userEvent.click(await screen.findByText('CCC', { exact: false })) // option "122 CCC"

    const radio = await screen.findByRole('radio', { name: 'HEX' })
    expect(radio).toBeEnabled()
    await userEvent.click(radio)

    const input = await screen.findByLabelText('Option Value')
    await userEvent.type(input, 'abc')
    input.focus()

    expect(await screen.findByDisplayValue('abc')).toBeVisible()
  })

  it('should validate IP correctly with error message', async () => {
    render(<Provider><DhcpOptionModal open={true} editRecord={mockOption6Data}/></Provider>, {
      route: { params,
        path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
      }
    })
    await screen.findByDisplayValue('1.2.3.4 4.5.6.7')

    const radio = await screen.findByRole('radio', { name: 'IP' })
    expect(radio).toBeEnabled()

    const input = await screen.findByLabelText('Option Value')
    await userEvent.type(input, '1.2.3.4 4.5.6.')
    input.focus()

    expect(await screen.findByDisplayValue('1.2.3.4 4.5.6.')).toBeVisible()
    const invalidMessage = await screen.findByRole('alert', {
      name: (_, el) => el.textContent === 'Please enter a valid IP address'
    })
    expect(invalidMessage).toBeVisible()
  })
})
