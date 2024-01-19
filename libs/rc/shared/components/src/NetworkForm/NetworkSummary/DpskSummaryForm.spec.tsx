import '@testing-library/jest-dom'

import { Form } from 'antd'
import { rest } from 'msw'

import {
  WlanSecurityEnum,
  NetworkTypeEnum,
  RadioEnum,
  DpskUrls
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { DpskSummaryForm } from './DpskSummaryForm'

export const dpskListResponse = {
  content: [
    {
      id: '123456789',
      name: 'DPSK Service 1',
      passphraseLength: 18,
      passphraseFormat: 'MOST_SECURED',
      expirationType: null
    }
  ],
  totalElements: 1,
  totalPages: 1,
  pageable: {
    pageNumber: 0,
    pageSize: 10
  },
  sort: []
}

const targetDpsk = dpskListResponse.content[0]

const mockSummary = {
  name: 'test',
  type: NetworkTypeEnum.DPSK,
  isCloudpathEnabled: false,
  venues: [
    {
      venueId: '6cf550cdb67641d798d804793aaa82db',
      name: 'My-Venue',
      allApGroupsRadio: RadioEnum.Both
    }
  ],
  wlanSecurity: WlanSecurityEnum.WPA2Enterprise,
  dpskServiceProfileId: targetDpsk.id
}

describe('DpskSummaryForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(DpskUrls.getDpskList.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(dpskListResponse)))
    )
  })
  it('should render DPSK service summary', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <DpskSummaryForm summaryData={mockSummary} />
        </Form>
      </Provider>,
      {
        route: { params }
      }
    )

    expect(await screen.findByText(targetDpsk.name)).toBeVisible()
  })
})
