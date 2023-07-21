/* eslint-disable max-len */
import '@testing-library/jest-dom'

import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  AccessControlUrls,
  CommonUrlsInfo,
  NetworkSaveData,
  NetworkTypeEnum,
  WlanSecurityEnum,
  BasicServiceSetPriorityEnum,
  OpenWlanAdvancedCustomization,
  DpskWlanAdvancedCustomization,
  TunnelProfileUrls } from '@acx-ui/rc/utils'
import { Provider }                                               from '@acx-ui/store'
import { mockServer, within, render, screen, cleanup, fireEvent } from '@acx-ui/test-utils'

import { mockedTunnelProfileViewData }                                     from '../../../../Policies/TunnelProfile/__tests__/fixtures'
import { devicePolicyListResponse, externalProviders, policyListResponse } from '../__tests__/fixtures'
import NetworkFormContext, { NetworkFormContextType }                      from '../NetworkFormContext'
import { hasVxLanTunnelProfile }                                           from '../utils'

import { MoreSettingsForm, NetworkMoreSettingsForm } from './NetworkMoreSettingsForm'

const mockWlanData = {
  name: 'test',
  type: 'open',
  isCloudpathEnabled: false,
  venues: [],
  wlan: {
    advancedCustomization: {
      bssPriority: BasicServiceSetPriorityEnum.LOW
    } as OpenWlanAdvancedCustomization
  }
} as NetworkSaveData


describe('NetworkMoreSettingsForm', () => {

  // beforeEach(() => {
  // })

  it('after click Multicast Rate Limiting', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    // eslint-disable-next-line testing-library/no-render-in-setup
    render(
      <Provider>
        <Form>
          <MoreSettingsForm wlanData={mockWlanData} />
        </Form>
      </Provider>,
      { route: { params } })

    const multicastRateLimitSwitch = screen.getByText(/Multicast Rate Limiting/i)
    await userEvent.click(within(multicastRateLimitSwitch).getByRole('switch'))
    expect(await screen.findByTestId('enableMulticastUpLimit')).toBeVisible()
    expect(await screen.findByTestId('enableMulticastDownLimit')).toBeVisible()
    expect(await screen.findByTestId('enableMulticastUpLimit6G')).toBeVisible()
    expect(await screen.findByTestId('enableMulticastDownLimit6G')).toBeVisible()
  })
})