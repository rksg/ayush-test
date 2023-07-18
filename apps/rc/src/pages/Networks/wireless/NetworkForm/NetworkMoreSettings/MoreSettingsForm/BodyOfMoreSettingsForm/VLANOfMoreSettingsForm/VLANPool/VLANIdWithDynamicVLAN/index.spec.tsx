import '@testing-library/jest-dom'
import React from 'react'

import { Form } from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'


import VLANIdWithDynamicVLAN from '.'


describe('VLANIdWithDynamicVLAN', () => {
  it('should render correctly', function () {
    // GIVEN
    const enableVxLan = false
    const isPortalDefaultVLANId = false
    const showDynamicWlan = false

    // WHEN
    render(
      <Provider>
        <Form>
          <VLANIdWithDynamicVLAN
            enableVxLan={enableVxLan}
            isPortalDefaultVLANId={isPortalDefaultVLANId}
            showDynamicWlan={showDynamicWlan}
          />
        </Form>
      </Provider>
    )

    // THEN
    expect(screen.getByText(/VLAN ID/i)).toBeInTheDocument()
    expect(screen.getByTestId('VLANIdWithDynamicVLAN')).toBeInTheDocument()
    expect(screen.getByTestId('VLANIdWithDynamicVLAN-InputNumber')).toBeInTheDocument()
  })

  it('the initial value of input should be 1', function () {
    // GIVEN
    const enableVxLan = false
    const isPortalDefaultVLANId = false
    const showDynamicWlan = false

    // WHEN
    render(
      <Provider>
        <Form>
          <VLANIdWithDynamicVLAN
            enableVxLan={enableVxLan}
            isPortalDefaultVLANId={isPortalDefaultVLANId}
            showDynamicWlan={showDynamicWlan}
          />
        </Form>
      </Provider>
    )

    // THEN
    expect(screen.getByTestId('VLANIdWithDynamicVLAN-InputNumber')).toHaveValue('1')
  })

  it(
    'input should be disabled when isPortalDefaultVLANId is false and enableVxLan is true',
    function () {
    // GIVEN
      const enableVxLan = true
      const isPortalDefaultVLANId = false
      const showDynamicWlan = false

      // WHEN
      render(
        <Provider>
          <Form>
            <VLANIdWithDynamicVLAN
              enableVxLan={enableVxLan}
              isPortalDefaultVLANId={isPortalDefaultVLANId}
              showDynamicWlan={showDynamicWlan}
            />
          </Form>
        </Provider>
      )

      // THEN
      expect(screen.getByTestId('VLANIdWithDynamicVLAN-InputNumber')).toBeDisabled()
    })

  it(
    'input should be disabled when isPortalDefaultVLANId is true and enableVxLan is false',
    function () {
      // GIVEN
      const enableVxLan = false
      const isPortalDefaultVLANId = true
      const showDynamicWlan = false

      // WHEN
      render(
        <Provider>
          <Form>
            <VLANIdWithDynamicVLAN
              enableVxLan={enableVxLan}
              isPortalDefaultVLANId={isPortalDefaultVLANId}
              showDynamicWlan={showDynamicWlan}
            />
          </Form>
        </Provider>
      )

      // THEN
      expect(screen.getByTestId('VLANIdWithDynamicVLAN-InputNumber')).toBeDisabled()
    })

  it(
    'input should be disabled when isPortalDefaultVLANId is true and enableVxLan is true',
    function () {
      // GIVEN
      const enableVxLan = true
      const isPortalDefaultVLANId = true
      const showDynamicWlan = false

      // WHEN
      render(
        <Provider>
          <Form>
            <VLANIdWithDynamicVLAN
              enableVxLan={enableVxLan}
              isPortalDefaultVLANId={isPortalDefaultVLANId}
              showDynamicWlan={showDynamicWlan}
            />
          </Form>
        </Provider>
      )

      // THEN
      expect(screen.getByTestId('VLANIdWithDynamicVLAN-InputNumber')).toBeDisabled()
    })

  it(
    'input should be enabled when isPortalDefaultVLANId is false and enableVxLan is false',
    function () {
      // GIVEN
      const enableVxLan = false
      const isPortalDefaultVLANId = false
      const showDynamicWlan = false

      // WHEN
      render(
        <Provider>
          <Form>
            <VLANIdWithDynamicVLAN
              enableVxLan={enableVxLan}
              isPortalDefaultVLANId={isPortalDefaultVLANId}
              showDynamicWlan={showDynamicWlan}
            />
          </Form>
        </Provider>
      )

      // THEN
      expect(screen.getByTestId('VLANIdWithDynamicVLAN-InputNumber')).toBeEnabled()
    })

  it('should show DynamicWlan when showDynamicWlan is true', function () {
    // GIVEN
    const enableVxLan = false
    const isPortalDefaultVLANId = false
    const showDynamicWlan = true

    // WHEN
    render(
      <Provider>
        <Form>
          <VLANIdWithDynamicVLAN
            enableVxLan={enableVxLan}
            isPortalDefaultVLANId={isPortalDefaultVLANId}
            showDynamicWlan={showDynamicWlan}
          />
        </Form>
      </Provider>
    )

    // THEN
    expect(screen.getByTestId('DynamicVLAN')).toBeInTheDocument()
  })

  it('should not show DynamicWlan when showDynamicWlan is false', function () {
    // GIVEN
    const enableVxLan = false
    const isPortalDefaultVLANId = false
    const showDynamicWlan = false

    // WHEN
    render(
      <Provider>
        <Form>
          <VLANIdWithDynamicVLAN
            enableVxLan={enableVxLan}
            isPortalDefaultVLANId={isPortalDefaultVLANId}
            showDynamicWlan={showDynamicWlan}
          />
        </Form>
      </Provider>
    )

    // THEN
    expect(screen.queryByTestId('DynamicVLAN')).not.toBeInTheDocument()
  })
})
