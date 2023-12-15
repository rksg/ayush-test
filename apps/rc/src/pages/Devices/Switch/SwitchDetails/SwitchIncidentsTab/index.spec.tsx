import '@testing-library/jest-dom'

import { rest } from 'msw'

import { CommonUrlsInfo, SwitchUrlsInfo }                                 from '@acx-ui/rc/utils'
import { dataApiURL, Provider }                                           from '@acx-ui/store'
import { render, screen, mockRestApiQuery, mockGraphqlQuery, mockServer } from '@acx-ui/test-utils'
import type { AnalyticsFilter }                                           from '@acx-ui/utils'

import {
  networkApGroup,
  switchDetailData
} from '../__tests__/fixtures'

import { SwitchIncidentsTab } from '.'

jest.mock('@acx-ui/analytics/components', () => ({
  IncidentTabContent: (props: { filters: AnalyticsFilter }) => JSON.stringify(props.filters)
}))

const params = {
  tenantId: 'tenantId',
  switchId: 'switchId',
  serialNumber: 'serialNumber'
}

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchIncidentsTab', () => {
  beforeEach(() => {
    mockRestApiQuery(SwitchUrlsInfo.getSwitchDetailHeader.url, 'get', switchDetailData)
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: [] } } }
    })
    mockServer.use(
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(networkApGroup))
      )
    )
  })

  it('should render mocked Incident tab in devices', async () => {
    render(<Provider><SwitchIncidentsTab /></Provider>, { route: { params } })
    expect(await screen.findByText(/C0:C5:20:98:B9:67/)).toBeInTheDocument()
  })
})
