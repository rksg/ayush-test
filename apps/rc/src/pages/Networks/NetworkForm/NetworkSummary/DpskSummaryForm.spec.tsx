import '@testing-library/jest-dom'

import { Form } from 'antd'

import { WlanSecurityEnum, PassphraseFormatEnum, PassphraseExpirationEnum } from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { render }                                                           from '@acx-ui/test-utils'

import { DpskSummaryForm } from './DpskSummaryForm'

const mockSummary = {
  name: 'test',
  type: 'dpsk',
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
  expiration: PassphraseExpirationEnum.UNLIMITED
}

describe('DpskSummaryForm', () => {
  it('should render cloudpath enabled successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    mockSummary.isCloudpathEnabled = true
    const { asFragment } = render(
      <Provider>
        <Form>
          <DpskSummaryForm summaryData={mockSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
