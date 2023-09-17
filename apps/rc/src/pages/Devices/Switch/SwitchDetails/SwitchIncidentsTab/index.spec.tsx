import '@testing-library/jest-dom'

import { SwitchUrlsInfo }                                     from '@acx-ui/rc/utils'
import { dataApiURL, Provider }                               from '@acx-ui/store'
import { render, screen, mockRestApiQuery, mockGraphqlQuery } from '@acx-ui/test-utils'
import type { AnalyticsFilter }                               from '@acx-ui/utils'

import {
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
  })

  it('should render mocked Incident tab in devices', async () => {
    render(<Provider><SwitchIncidentsTab /></Provider>, { route: { params } })
    expect(await screen.findByText(/C0:C5:20:98:B9:67/)).toBeInTheDocument()
  })
})