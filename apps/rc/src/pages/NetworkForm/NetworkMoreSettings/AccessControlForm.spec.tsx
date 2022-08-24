import '@testing-library/jest-dom'


import { Form } from 'antd'

import { Provider }       from '@acx-ui/store'
import { fireEvent }      from '@acx-ui/test-utils'
import { render, screen } from '@acx-ui/test-utils'

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
})
