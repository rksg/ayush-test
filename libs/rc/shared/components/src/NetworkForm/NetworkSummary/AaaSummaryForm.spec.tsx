import '@testing-library/jest-dom'

import { Form } from 'antd'

import { WlanSecurityEnum, PassphraseFormatEnum, PassphraseExpirationEnum } from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { render, screen }                                                   from '@acx-ui/test-utils'

import { AaaSummaryForm } from './AaaSummaryForm'

const mockSummary = {
  name: 'test',
  type: 'aaa',
  isCloudpathEnabled: false,
  venues: [
    {
      venueId: '6cf550cdb67641d798d804793aaa82db',
      name: 'My-Venue'
    }
  ],
  wlanSecurity: WlanSecurityEnum.WPA2Enterprise,
  passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
  passphraseLength: 18,
  expiration: PassphraseExpirationEnum.UNLIMITED,
  enableAccountingService: false,
  enableAuthProxy: true,
  authRadius: {
    primary: {
      ip: '1.1.1.1',
      port: 1812,
      sharedSecret: 'xxxxxxxx'
    },
    secondary: {
      ip: '2.2.2.2',
      port: 1812,
      sharedSecret: 'xxxxxxxx'
    }
  },
  accountingRadius: {
    primary: {
      ip: '1.1.1.1',
      port: 1813,
      sharedSecret: 'xxxxxxxx'
    },
    secondary: {
      ip: '2.2.2.2',
      port: 1813,
      sharedSecret: 'xxxxxxxx'
    }
  }
}

describe('AaaSummaryForm', () => {
  it('should render AAA summary form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <AaaSummaryForm summaryData={mockSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Primary Server')).toBeVisible()
  })
  it('should render AAA summary with accounting enabled', async () => {
    mockSummary.enableAccountingService = true
    mockSummary.enableAuthProxy = false
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <AaaSummaryForm summaryData={mockSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect((await screen.findAllByText('Primary Server'))[1]).toBeVisible()
  })
})
