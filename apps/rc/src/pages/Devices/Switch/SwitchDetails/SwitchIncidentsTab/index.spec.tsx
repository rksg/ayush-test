import '@testing-library/jest-dom'

import { dataApiURL }                                         from '@acx-ui/analytics/services'
import { SwitchUrlsInfo }                                     from '@acx-ui/rc/utils'
import { Provider }                                           from '@acx-ui/store'
import { render, screen, mockRestApiQuery, mockGraphqlQuery } from '@acx-ui/test-utils'

import {
  switchDetailData
} from '../__tests__/fixtures'

import { SwitchIncidentsTab } from '.'


const params = {
  tenantId: 'tenantId',
  switchId: 'switchId',
  serialNumber: 'serialNumber'
}

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  useAnalyticsFilter: () => ({
    filters: { path: [{ type: 'network', name: 'Network' }] },
    getNetworkFilter: jest
      .fn()
      .mockReturnValueOnce({
        networkFilter: { path: [{ type: 'network', name: 'Network' }] }
      })
  })
}))

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('SwitchIncidentsTab', () => {
  beforeEach(() => {
    mockRestApiQuery(SwitchUrlsInfo.getSwitchDetailHeader.url, 'get', { data: switchDetailData })
    mockGraphqlQuery(dataApiURL, 'IncidentTableWidget', {
      data: { network: { hierarchyNode: { incidents: [] } } }
    })
  })

  it('should render mocked Incident tab in devices', async () => {
    render(<Provider><SwitchIncidentsTab /></Provider>, { route: { params } })
    expect(await screen.findByPlaceholderText('Search Description, Scope')).toBeInTheDocument()
  })
})