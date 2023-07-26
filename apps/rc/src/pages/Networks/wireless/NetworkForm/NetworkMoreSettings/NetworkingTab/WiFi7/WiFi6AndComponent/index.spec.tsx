

import React from 'react'

import { Form } from 'antd'

import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import Wifi6And7Component from '.'


describe('Wifi6And7Component', () => {
  it('should render correctly', function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const checked = true
    const initialValue = true
    const onEnableWiFiChange = jest.fn()

    render(
      <Provider>
        <Form>
          <Wifi6And7Component
            checked={checked}
            initialValue={initialValue}
            onEnableWiFiChange={onEnableWiFiChange}
          />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Enable WiFi 6/ 7')).toBeInTheDocument()
    const questionInfoElement = screen.getByTestId('QuestionMarkCircleOutlined')
    expect(questionInfoElement).toBeInTheDocument()
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toBeChecked()
    expect(screen.queryByTestId('Description')).not.toBeInTheDocument()
  })

  it('should show Description correctly when initialValue is false', function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const checked = false
    const initialValue = false
    const onEnableWiFiChange = jest.fn()

    render(
      <Provider>
        <Form>
          <Wifi6And7Component
            checked={checked}
            initialValue={initialValue}
            onEnableWiFiChange={onEnableWiFiChange}
          />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Enable WiFi 6/ 7')).toBeInTheDocument()
    expect(screen.getByTestId('QuestionMarkCircleOutlined')).toBeInTheDocument()
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).not.toBeChecked()
    expect(screen.getByTestId('Description')).toBeInTheDocument()
  })

  it('should switch toggle button correctly', function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const checked = true
    const initialValue = true
    const onEnableWiFiChange = jest.fn()

    render(
      <Provider>
        <Form>
          <Wifi6And7Component
            checked={checked}
            initialValue={initialValue}
            onEnableWiFiChange={onEnableWiFiChange}
          />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toBeChecked()
    fireEvent.click(switchElement)
    expect(onEnableWiFiChange).toHaveBeenCalledTimes(1)
    expect(switchElement).not.toBeChecked()
    fireEvent.click(switchElement)
    expect(onEnableWiFiChange).toHaveBeenCalledTimes(2)
    expect(switchElement).toBeChecked()
  })
})