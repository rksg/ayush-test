import '@testing-library/jest-dom'

import { Form } from 'antd'

import { Provider }                          from '@acx-ui/store'
import { render, screen, fireEvent, within } from '@acx-ui/test-utils'

import { DnsProxyModal }   from './DnsProxyModal'
import { DnsProxyContext } from './ServicesForm'

let dnsProxyList = []
const setDnsProxyList = jest.fn()
const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

describe('DnsProxyModal', () => {
  it('should render Dns Proxy Modal successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <Form>
          <DnsProxyContext.Provider value={{ dnsProxyList, setDnsProxyList }}>
            <DnsProxyModal />
          </DnsProxyContext.Provider>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
    fireEvent.click(screen.getByRole('button', { name: 'Manage' }))

    const dialog = await screen.findByRole('dialog')
    expect(await screen.findByText('DNS Proxy')).toBeVisible()
    expect(await screen.findByText('Domain')).toBeVisible()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
  })

  it('should add rule in DnsProxyRuleModal', async () => {
    render(
      <Provider>
        <Form>
          <DnsProxyContext.Provider value={{ dnsProxyList, setDnsProxyList }}>
            <DnsProxyModal />
          </DnsProxyContext.Provider>
        </Form>
      </Provider>, {
        route: { params }
      })

    fireEvent.click(screen.getByRole('button', { name: 'Manage' }))
    fireEvent.click(screen.getByText('Add Rule'))
    const dialog = await screen.findAllByRole('dialog')
    expect(await screen.findByText('Add DNS Proxy Rule')).toBeVisible()
    expect(await screen.findByText('No IP Addresses')).toBeVisible()
    const nameInput = screen.getByLabelText('Domain Name')
    const ipInput = screen.getByLabelText('IP Addresses')
    const addBtn = within(dialog[1]).getByRole('button', { name: 'Add' })

    fireEvent.change(nameInput, { target: { value: 'aaa.com' } })
    fireEvent.change(ipInput, { target: { value: '1.1.1.1' } })
    fireEvent.click(addBtn)
    fireEvent.change(nameInput, { target: { value: 'bbb.com' } })
    fireEvent.change(ipInput, { target: { value: '1.1.1.1' } })
    fireEvent.click(addBtn)
    fireEvent.click(screen.getByRole('deleteBtn'))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
  })

  it('should edie/delete rule in DnsProxyRuleModal', async () => {
    dnsProxyList = [{
      domainName: 'aaa.com', ipList: ['1.1.1.1']
    }, {
      domainName: 'bbb.com', ipList: ['1.1.1.1', '1.1.1.2']
    }, {
      domainName: 'ccc.com', ipList: ['1.1.1.1']
    }]
    render(
      <Provider>
        <Form>
          <DnsProxyContext.Provider value={{ dnsProxyList, setDnsProxyList }}>
            <DnsProxyModal />
          </DnsProxyContext.Provider>
        </Form>
      </Provider>, {
        route: { params }
      })

    fireEvent.click(screen.getByRole('button', { name: 'Manage' }))
    expect(await screen.findByText('aaa.com')).toBeVisible()

    const row = await screen.findByRole('row', { name: /ccc.com/i })
    fireEvent.click(within(row).getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    const row2 = await screen.findByRole('row', { name: /aaa.com/i })
    fireEvent.click(within(row2).getByRole('checkbox'))
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))    

    expect(await screen.findByText('Edit DNS Proxy Rule')).toBeVisible()
    fireEvent.change(screen.getByLabelText('Domain Name'), { target: { value: 'bbb.com' } })
    fireEvent.change(screen.getByLabelText('Domain Name'), { target: { value: 'test.edit.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
  })
})

