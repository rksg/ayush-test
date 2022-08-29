import '@testing-library/jest-dom'


import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }          from '@acx-ui/store'
import { fireEvent, within } from '@acx-ui/test-utils'
import { render, screen }    from '@acx-ui/test-utils'

import { LoadControlForm } from './LoadControlForm'


describe('LoadControlForm', () => {
  it('should render More settings form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <LoadControlForm />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })

  it('should visible VLAN pooling', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <LoadControlForm />
        </Form>
      </Provider>,
      { route: { params } })

    await userEvent.click(await screen.findByRole('combobox'))
    const perAp = screen.getByText('Per AP')
    fireEvent.click(perAp)
    expect(screen.getByText(/upload limit/i)).toBeVisible()
    expect(screen.getByText(/download limit/i)).toBeVisible()

    const uploadLimit = screen.getByText(/upload limit/i)
    await userEvent.click(within(uploadLimit).getByRole('checkbox'))
    expect(screen.getByText(/200 mbps/i)).toBeVisible()
    await userEvent.click(within(uploadLimit).getByRole('checkbox'))

    const downloadLimit = screen.getByText(/download limit/i)
    await userEvent.click(within(downloadLimit).getByRole('checkbox'))
    expect(screen.getByText(/200 mbps/i)).toBeVisible()
    await userEvent.click(within(downloadLimit).getByRole('checkbox'))
  })


})
