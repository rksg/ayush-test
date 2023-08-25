/* eslint-disable max-len */
import '@testing-library/jest-dom'

import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { QosMapSetForm } from './QosMapSetForm'

describe('QosMapSetFrom', () => {
  it('Test case for Qos Map Set Enabled', async ()=> {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    // eslint-disable-next-line testing-library/no-render-in-setup
    render(
      <Provider>
        <Form>
          <QosMapSetForm/>
        </Form>
      </Provider>,
      { route: { params } })

    expect(await screen.findByTestId('qos-map-set-enabled')).toBeVisible()
  })

  it('After click Qos Map Set should render Qos Map Set option table', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    // eslint-disable-next-line testing-library/no-render-in-setup
    render(
      <Provider>
        <Form>
          <QosMapSetForm/>
        </Form>
      </Provider>,
      { route: { params } })

    await userEvent.click(await screen.findByRole('switch'))
    expect(await screen.findByTestId('qos-map-set-option-table')).toBeVisible()
  })
})