import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }               from '@acx-ui/store'
import { screen, render, within } from '@acx-ui/test-utils'

import ProxyArp from '.'

describe('ProxyArp', () => {
  it('renders without errors', () => {
    render(
      <Provider>
        <Form>
          <ProxyArp enableVxLan={false} />
        </Form>
      </Provider>
    )

    expect(screen.getByTestId('ProxyArp')).toBeInTheDocument()
    expect(screen.getByText(/Proxy ARP:/i)).toBeVisible()
    expect(screen.getByTestId('ProxyArp-Switch')).toBeInTheDocument()
  })

  it('switch is enabled when enableVxLan is false', () => {
    render(
      <Provider>
        <Form>
          <ProxyArp enableVxLan={false} />
        </Form>
      </Provider>
    )

    expect(screen.getByTestId('ProxyArp-Switch')).toBeEnabled()
  })

  it('switch toggles correctly', async () => {
    render(
      <Provider>
        <Form>
          <ProxyArp enableVxLan={false}/>
        </Form>
      </Provider>
    )

    expect(screen.getByTestId('ProxyArp-Switch')).toBeEnabled()
    const view = screen.getByText(/Proxy ARP:/i)
    await userEvent.click(within(view).getByRole('switch'))
    expect(screen.getByTestId('ProxyArp-Switch')).toBeDisabled()
  })
})
