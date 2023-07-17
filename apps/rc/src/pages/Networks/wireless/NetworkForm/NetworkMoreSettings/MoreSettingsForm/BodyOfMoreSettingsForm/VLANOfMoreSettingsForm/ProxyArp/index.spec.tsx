import React from 'react'

import { fireEvent } from '@testing-library/react'
import { Form }      from 'antd'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

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

    expect(screen.getByRole('switch')).toBeEnabled()
  })

  it('switch is disabled when enableVxLan is true', () => {
    render(
      <Provider>
        <Form>
          <ProxyArp enableVxLan={true} />
        </Form>
      </Provider>
    )

    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('switch initial value is false', () => {
    render(
      <Provider>
        <Form>
          <ProxyArp enableVxLan={false} />
        </Form>
      </Provider>
    )

    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('switch toggles correctly', () => {
    render(
      <Provider>
        <Form>
          <ProxyArp enableVxLan={false}/>
        </Form>
      </Provider>
    )

    const switchElement = screen.getByRole('switch')
    expect(switchElement).not.toBeChecked()

    fireEvent.click(switchElement)
    expect(switchElement).toBeChecked()

    fireEvent.click(switchElement)
    expect(switchElement).not.toBeChecked()
  })
})
