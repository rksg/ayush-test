import '@testing-library/jest-dom'

import { Form } from 'antd'

import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import {
  guestpassData,
  hostapprovalData,
  wisprDataNone,
  wisprDataWPA23,
  wisprDataWep,
  selfsignData,
  portalList
} from '../__tests__/fixtures'

import { PortalSummaryForm } from './PortalSummaryForm'

const portalData = portalList[0].demo

describe('PortalSummaryForm', () => {
  it('should render host approval successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const { asFragment } = render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={hostapprovalData} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render guest pass successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const { asFragment } = render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={guestpassData} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render self sign in successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const { asFragment } = render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={selfsignData} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render wispr none successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const { asFragment } = render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={wisprDataNone} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render wispr wpa23 successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const { asFragment } = render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={wisprDataWPA23} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render wispr wep successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    const { asFragment } = render(
      <Provider>
        <Form>
          <PortalSummaryForm summaryData={wisprDataWep} portalData={portalData}/>
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
