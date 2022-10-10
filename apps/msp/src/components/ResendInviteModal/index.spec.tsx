import '@testing-library/jest-dom'

// import { Form } from 'antd'

import { Provider }                          from '@acx-ui/store'
import { render, screen, fireEvent, within } from '@acx-ui/test-utils'

import { ResendInviteModal } from '.'

// import { ResendInviteModal } from '../ResendInviteModal'
// import { DnsProxyContext } from './ServicesForm'

// let dnsProxyList = []
const setVisible = jest.fn()
let visible = true
const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

describe('ResendInviteModal', () => {
  it('should render Resend Invitaion successfully', async () => {
    const { asFragment } = render(
      <Provider>
        {/* <ResendInviteModal value={{ visible, setVisible }} /> */}
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
    fireEvent.click(screen.getByRole('button', { name: 'Resend Invitation' }))

    // const dialog = await screen.findByRole('dialog')
    // expect(await screen.findByText('DNS Proxy')).toBeVisible()
    // expect(await screen.findByText('Domain')).toBeVisible()
    // fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
  })

})

