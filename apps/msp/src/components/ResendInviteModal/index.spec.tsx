import '@testing-library/jest-dom'

import { Form } from 'antd'

import { Provider }                          from '@acx-ui/store'
import { render, screen, fireEvent, within } from '@acx-ui/test-utils'

// import { ResendInviteModal } from '../ResendInviteModal'
// import { DnsProxyContext } from './ServicesForm'

// let dnsProxyList = []
// const setVisible = jest.fn()
const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

describe('ResendInviteModal', () => {
  it('should render Resend Invitaion successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <Form>
          {/* <ResendInviteModal value={{ visible, setVisible }} /> */}
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
    fireEvent.click(screen.getByRole('button', { name: 'Resend Invitaion' }))

    // const dialog = await screen.findByRole('dialog')
    // expect(await screen.findByText('DNS Proxy')).toBeVisible()
    expect(await screen.findByText('Domain')).toBeVisible()
    // fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
  })

  it('should add rule in ResendInviteModal', async () => {
    render(
      <Provider>
        <Form>
          {/* <ResendInviteModal /> */}
        </Form>
      </Provider>, {
        route: { params }
      })

    fireEvent.click(screen.getByRole('button', { name: 'Resend Invitaion' }))
    fireEvent.click(screen.getByText('Add Rule'))
    const dialog = await screen.findAllByRole('dialog')
    // expect(await screen.findByText('Add DNS Proxy Rule')).toBeVisible()
    // expect(await screen.findByText('No IP Addresses')).toBeVisible()
    const nameInput = screen.getByLabelText('Domain Name')
    // const ipInput = screen.getByLabelText('IP Addresses')
    const addBtn = within(dialog[1]).getByRole('button', { name: 'Add' })

    fireEvent.change(nameInput, { target: { value: 'aaa.com' } })
    // fireEvent.change(ipInput, { target: { value: '1.1.1.1' } })
    fireEvent.click(addBtn)
    // fireEvent.change(nameInput, { target: { value: 'bbb.com' } })
    // fireEvent.change(ipInput, { target: { value: '1.1.1.1' } })
    // await (async () => { fireEvent.blur(ipInput) })
    fireEvent.click(addBtn)
    fireEvent.click(screen.getByRole('deleteBtn'))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  })

})

