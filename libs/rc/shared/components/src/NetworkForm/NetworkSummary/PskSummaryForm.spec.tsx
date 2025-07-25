import '@testing-library/jest-dom'

import { Form } from 'antd'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  WlanSecurityEnum,
  PassphraseFormatEnum,
  PassphraseExpirationEnum,
  NetworkSaveData,
  NetworkTypeEnum, NetworkVenue
} from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { PskSummaryForm } from './PskSummaryForm'

const mockSummary = {
  name: 'test',
  type: 'dpsk' as NetworkTypeEnum,
  isCloudpathEnabled: false,
  venues: [
    {
      venueId: '6cf550cdb67641d798d804793aaa82db',
      name: 'My-Venue'
    }
  ] as NetworkVenue[],
  wlanSecurity: WlanSecurityEnum.WPA2Enterprise,
  passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
  passphraseLength: 18,
  expiration: PassphraseExpirationEnum.UNLIMITED,
  enableAccountingService: true,
  radiusAccounting: {
    accountingService: 'test',
    accountingServer: 'test',
    accountingServerPort: 1812,
    accountingServerSecret: 'test',
    accountingServerSecretFormat: PassphraseFormatEnum.MOST_SECURED
  }
} as NetworkSaveData

describe('PskSummaryForm', () => {
  it('should render cloudpath enabled successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    mockSummary.isCloudpathEnabled = true
    const { asFragment } = render(
      <Provider>
        <Form>
          <PskSummaryForm summaryData={mockSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render Psk summary form successfully with accounting FF enabled', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    jest.mocked(useIsSplitOn).mockImplementation(
      ff => ff === Features.WIFI_NETWORK_RADIUS_ACCOUNTING_TOGGLE
    )
    render(
      <Provider>
        <Form>
          <PskSummaryForm summaryData={mockSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )
    expect(await screen.findByText('Primary Server')).toBeVisible()

    expect(screen.getByText('Accounting Service')).toBeInTheDocument()
  })
})
