import React from 'react'

import { Form } from 'antd'

import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import MloComponent from '.'



describe('MloComponent', () => {
  // eslint-disable-next-line max-len
  it('should render correctly when isDisableMlo is false, initialValue is false and checked is false',
    function () {
      const checked = false
      const initialValue = false
      const isDisableMlo = false
      const onEnableMLOChange = jest.fn()

      const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

      render(
        <Provider>
          <Form>
            <MloComponent
              checked={checked}
              initialValue={initialValue}
              isDisableMlo={isDisableMlo}
              onEnableMloChange={onEnableMLOChange}
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
    })

  // eslint-disable-next-line max-len
  it('should render correctly when isDisableMlo is false, initialValue is true and checked is true',
    function () {
      const checked = true
      const initialValue = true
      const isDisableMlo = false
      const onEnableMLOChange = jest.fn()

      const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

      render(
        <Provider>
          <Form>
            <MloComponent
              initialValue={initialValue}
              checked={checked}
              isDisableMlo={isDisableMlo}
              onEnableMloChange={onEnableMLOChange}
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
      expect(screen.getByTitle('Select 2 bands for MLO:')).toBeInTheDocument()
    })

  it('onEnableMLOChange',
    function () {
      const checked = true
      const initialValue = true
      const isDisableMlo = false
      const onEnableMLOChange = jest.fn()

      jest.mock('antd/lib/form/Form', () => ({
        useFormInstance: () => ({
          setFieldValue: jest.fn()
        })
      }))

      const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

      render(
        <Provider>
          <Form>
            <MloComponent
              initialValue={initialValue}
              checked={checked}
              isDisableMlo={isDisableMlo}
              onEnableMloChange={onEnableMLOChange}
            />
          </Form>
        </Provider>, {
          route: { params }
        }
      )

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeInTheDocument()
      expect(switchElement).toBeEnabled()
      expect(switchElement).toBeChecked()
      fireEvent.click(switchElement)
      expect(switchElement).not.toBeChecked()
    })
})