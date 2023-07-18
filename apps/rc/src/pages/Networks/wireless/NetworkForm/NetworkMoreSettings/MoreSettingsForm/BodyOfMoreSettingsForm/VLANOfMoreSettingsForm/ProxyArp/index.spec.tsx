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
          <ProxyArp disabledOfSwitch={false} />
        </Form>
      </Provider>
    )

    expect(screen.getByText(/Proxy ARP/i)).toBeInTheDocument()
    expect(screen.getByTestId('ProxyArp')).toBeInTheDocument()
    expect(screen.getByTestId('ProxyArp-Switch')).toBeInTheDocument()
  })

  it('switch should be enabled when disabledOfSwitch is false', () => {
    render(
      <Provider>
        <Form>
          <ProxyArp disabledOfSwitch={false} />
        </Form>
      </Provider>
    )

    expect(screen.getByRole('switch')).toBeEnabled()
  })

  it('switch should be disabled when disabledOfSwitch is true', () => {
    render(
      <Provider>
        <Form>
          <ProxyArp disabledOfSwitch={true} />
        </Form>
      </Provider>
    )

    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('initial value of switch should be false', () => {
    render(
      <Provider>
        <Form>
          <ProxyArp disabledOfSwitch={false} />
        </Form>
      </Provider>
    )

    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('switch toggles correctly', () => {
    render(
      <Provider>
        <Form>
          <ProxyArp disabledOfSwitch={false}/>
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
