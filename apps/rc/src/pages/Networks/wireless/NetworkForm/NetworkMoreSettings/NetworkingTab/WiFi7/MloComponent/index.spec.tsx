import React from 'react'

import { fireEvent } from '@testing-library/react'
import { Form }      from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { MloComponent } from '.'



describe('MloComponent', () => {
  it(`should render correctly when enableMlo is true
          enableWifi7 is true, initialValue is false and checked is false`,
  function () {
    const checked = false
    const initialValue = false
    const enableMlo = true
    const enableWifi7 = true
    const onEnableMLOChange = jest.fn()

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <MloComponent
            checked={checked}
            initialValue={initialValue}
            enableMlo={enableMlo}
            enableWifi7={enableWifi7}
            onEnableMLOChange={onEnableMLOChange}
          />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Enable Multi-Link operation (MLO)')).toBeInTheDocument()
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toBeEnabled()
    expect(switchElement).not.toBeChecked()
    expect(screen.queryByTestId('BandsCheckbox')).not.toBeInTheDocument()
  })

  it(`should render correctly when enableMlo is true
          enableWifi7 is true, initialValue is true and checked is true`,
  function () {
    const checked = true
    const initialValue = true
    const enableMlo = true
    const enableWifi7 = true
    const onEnableMLOChange = jest.fn()

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <MloComponent
            checked={checked}
            initialValue={initialValue}
            enableMlo={enableMlo}
            enableWifi7={enableWifi7}
            onEnableMLOChange={onEnableMLOChange}
          />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Enable Multi-Link operation (MLO)')).toBeInTheDocument()
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toBeEnabled()
    expect(switchElement).toBeChecked()
    expect(screen.getByText('Select 2 bands for MLO')).toBeInTheDocument()
  })

  it('should switch toggle correctly', function () {
    const checked = true
    const initialValue = false
    const enableMlo = false
    const enableWifi7 = true
    const onEnableMLOChange = jest.fn()

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <MloComponent
            checked={checked}
            initialValue={initialValue}
            enableMlo={enableMlo}
            enableWifi7={enableWifi7}
            onEnableMLOChange={onEnableMLOChange}
          />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Enable Multi-Link operation (MLO)')).toBeInTheDocument()
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).not.toBeChecked()
    expect(switchElement).toBeEnabled()
    fireEvent.click(switchElement)
    expect(onEnableMLOChange).toHaveBeenCalledTimes(1)
    expect(switchElement).toBeChecked()
    fireEvent.click(switchElement)
    expect(onEnableMLOChange).toHaveBeenCalledTimes(2)
    expect(switchElement).not.toBeChecked()
  })
})