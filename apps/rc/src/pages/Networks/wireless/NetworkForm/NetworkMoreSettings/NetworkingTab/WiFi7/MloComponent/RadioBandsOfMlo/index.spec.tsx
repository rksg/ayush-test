
import React from 'react'

import { Form } from 'antd'

import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import RadioBandsOfMlo, { isSelectTwoRadioBands } from '.'


describe('RadioBandsOfMlo', () => {
  it('should render correctly', function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <RadioBandsOfMlo />
        </Form>
      </Provider>, {
        route: { params }
      }
    )

    expect(screen.getByText('Select 2 bands for MLO')).toBeInTheDocument()
    const checkboxElements = screen.getAllByRole('checkbox')
    expect(checkboxElements).toHaveLength(3)
    expect(checkboxElements[0]).toBeChecked()
    expect(checkboxElements[1]).toBeChecked()
    expect(checkboxElements[2]).not.toBeChecked()
    expect(checkboxElements[0]).toBeEnabled()
    expect(checkboxElements[1]).toBeEnabled()
    expect(checkboxElements[2]).toBeDisabled()
  })

  it('should show error text', function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <RadioBandsOfMlo />
        </Form>
      </Provider>, {
        route: { params }
      }
    )
    const checkboxElements = screen.getAllByRole('checkbox')
    expect(checkboxElements).toHaveLength(3)
    fireEvent.click(checkboxElements[0])
    expect(screen.getByText('At least 2 bands are selected')).toBeInTheDocument()
  })
})


describe('test isSelectTwoRadioBands function', () => {
  it('should return true', function () {
    const options = [
      // eslint-disable-next-line max-len
      { index: 1, name: 'option1', label: 'Option 1', value: 'value1', checked: true, disabled: false },
      // eslint-disable-next-line max-len
      { index: 2, name: 'option2', label: 'Option 2', value: 'value2', checked: true, disabled: false },
      // eslint-disable-next-line max-len
      { index: 3, name: 'option3', label: 'Option 3', value: 'value3', checked: false, disabled: true }
    ]
    expect(isSelectTwoRadioBands(options)).toBe(true)
  })

  it('should return false', function () {
    const options = [
      // eslint-disable-next-line max-len
      { index: 1, name: 'option1', label: 'Option 1', value: 'value1', checked: true, disabled: false },
      // eslint-disable-next-line max-len
      { index: 2, name: 'option2', label: 'Option 2', value: 'value2', checked: false, disabled: false },
      // eslint-disable-next-line max-len
      { index: 3, name: 'option3', label: 'Option 3', value: 'value3', checked: false, disabled: true }
    ]
    expect(isSelectTwoRadioBands(options)).toBe(false)
  })

  it('should disabled unchecked options', function () {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <RadioBandsOfMlo />
        </Form>
      </Provider>, {
        route: { params }
      }
    )
    const checkboxElements = screen.getAllByRole('checkbox')
    expect(checkboxElements).toHaveLength(3)
    fireEvent.click(checkboxElements[0])
    expect(checkboxElements[0]).not.toBeChecked()
    fireEvent.click(checkboxElements[0])
    expect(checkboxElements[0]).toBeChecked()
    expect(checkboxElements[0]).toBeEnabled()
    expect(checkboxElements[1]).toBeEnabled()
    expect(checkboxElements[2]).toBeDisabled()
  })
})