import '@testing-library/jest-dom'
import React from 'react'

import { fireEvent } from '@testing-library/react'
import { Form }      from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'


import DynamicVLAN from '.'


describe('DynamicVLAN', () => {
  it('should render DynamicVLAN Field correctly', function () {
    render(
      <Provider>
        <Form>
          <DynamicVLAN disabledSwitch={true} />
        </Form>
      </Provider>
    )

    expect(screen.getByText(/Dynamic VLAN/i)).toBeInTheDocument()
    expect(screen.getByTestId('DynamicVLAN')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('should be enabled when disabledSwitch is false', function () {
    render(
      <Provider>
        <Form>
          <DynamicVLAN disabledSwitch={false} />
        </Form>
      </Provider>
    )

    expect(screen.getByRole('switch')).toBeEnabled()
  })

  it('should be disabled when disabledSwitch is true', function () {
    render(
      <Provider>
        <Form>
          <DynamicVLAN disabledSwitch={true} />
        </Form>
      </Provider>
    )

    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('initial value of switch should be checked', () => {
    render(
      <Provider>
        <Form>
          <DynamicVLAN disabledSwitch={false} />
        </Form>
      </Provider>
    )

    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('switch toggles correctly', () => {
    render(
      <Provider>
        <Form>
          <DynamicVLAN disabledSwitch={false} />
        </Form>
      </Provider>
    )

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeChecked()

    fireEvent.click(switchElement)
    expect(switchElement).not.toBeChecked()

    fireEvent.click(switchElement)
    expect(switchElement).toBeChecked()
  })
})
