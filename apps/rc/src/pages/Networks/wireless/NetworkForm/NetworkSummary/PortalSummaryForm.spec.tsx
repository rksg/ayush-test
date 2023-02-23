import '@testing-library/jest-dom'

import { Form } from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import {
  guestpassData,
  hostapprovalData,
  wisprDataNone,
  wisprDataWPA23,
  wisprDataWep,
  selfsignData,
  portalList,
  wisprDataWPA2,
  cloudPathDataNone
} from '../__tests__/fixtures'

import { PortalSummaryForm } from './PortalSummaryForm'

const portalData = portalList[0].content

describe('PortalSummaryForm', () => {
  it('should render host approval successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={hostapprovalData} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Host Domains')).toBeVisible()
  })

  it('should render guest pass successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={guestpassData} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('English')).toBeVisible()
  })

  it('should render self sign in successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={selfsignData} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Sign-in Option')).toBeVisible()
  })

  it('should render wispr none successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={wisprDataNone} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Portal Provider'))
      .toBeVisible()
  })

  it('should render wispr wpa23 successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={wisprDataWPA23} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Portal Provider'))
      .toBeVisible()
  })

  it('should render wispr wep successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={wisprDataWep} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Portal Provider'))
      .toBeVisible()
  })
  it('should render wispr wpa2 successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    portalData.componentDisplay.wifi4eu = true
    wisprDataWPA2.wlan.bypassCPUsingMacAddressAuthentication = false
    render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={wisprDataWPA2} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Portal Provider'))
      .toBeVisible()
  })
  it('should render cloudpath successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    portalData.componentDisplay.wifi4eu = true
    wisprDataWPA2.wlan.bypassCPUsingMacAddressAuthentication = false
    render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={cloudPathDataNone} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Enrollment Workflow URL'))
      .toBeVisible()
  })
})
