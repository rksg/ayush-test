import '@testing-library/jest-dom'


import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }          from '@acx-ui/store'
import { render, screen }    from '@acx-ui/test-utils'
import { fireEvent, within } from '@acx-ui/test-utils'

import { AccessControlForm } from './AccessControlForm'



describe('AccessControlForm', () => {
  it('should render Access Control form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <AccessControlForm />
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })

  it('after click select seperate profiles', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <AccessControlForm />
        </Form>
      </Provider>, {
        route: { params }
      })

    const selectBtn = screen.getByText(/select access control profile/i)
    fireEvent.click(selectBtn)

    expect(screen.getByText(/access policy/i)).toBeVisible()
    expect(screen.getByText(/policy details/i)).toBeVisible()
    expect(screen.getByText(/select separate profiles/i)).toBeVisible()
  })

  it('after click client rate limit', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <AccessControlForm />
        </Form>
      </Provider>, {
        route: { params }
      })

    const view = screen.getByText(/client rate limit/i)
    await userEvent.click(await within(view).findByRole('switch'))
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

  xit('after click Select separate profiles', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <AccessControlForm />
        </Form>
      </Provider>, {
        route: { params }
      })

    const selectBtn = screen.getByText(/select separate profiles/i)
    fireEvent.click(selectBtn)

    expect(screen.getByText(/access policy/i)).toBeVisible()
    expect(screen.getByText(/policy details/i)).toBeVisible()
  })
})
