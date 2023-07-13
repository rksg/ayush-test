import {
  serviceGuardApi as api,
  serviceGuardApiURL
} from '@acx-ui/store'
import { Provider, store } from '@acx-ui/store'
import { render, screen }  from '@acx-ui/test-utils'
import {
  mockGraphqlQuery
} from '@acx-ui/test-utils'

import { mockResultForVirtualWirelessClient ,mockResultForVirtualClient } from '../../__tests__/fixtures'

import { Details } from '.'

describe('Details component', () => {
  beforeEach(() => store.dispatch(api.util.resetApiState()))
  const params = { testId: '1' }
  it('should render Details Page correctly for virtual client', async () => {
    const config = {
      pingAddress: null,
      tracerouteAddress: null,
      speedTestEnabled: false
    }
    mockGraphqlQuery(serviceGuardApiURL, 'ServiceGuardResults', {
      data: { serviceGuardTest: mockResultForVirtualClient({ ...config }) }
    })
    render(<Provider>
      <Details />
    </Provider>, { route: { params } })
    expect(await screen.findByText('AP MAC')).toBeVisible()
  })

  it('should render Details Page for virtual client with all config enabled', async () => {
    const config = {
      pingAddress: '8.8.8.8',
      tracerouteAddress: '8.8.8.8',
      speedTestEnabled: true
    }
    mockGraphqlQuery(serviceGuardApiURL, 'ServiceGuardResults', {
      data: { serviceGuardTest: mockResultForVirtualClient({ ...config }) }
    })
    render(<Provider>
      <Details />
    </Provider>, { route: { params } })
    expect(await screen.findByText('AP MAC')).toBeVisible()
  })
  it('should render Details Page correctly for virtual wireless client', async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'ServiceGuardResults', {
      data: { serviceGuardTest: mockResultForVirtualWirelessClient('success') }
    })
    render(<Provider>
      <Details />
    </Provider>, { route: { params } })
    expect(await screen.findByText('Traceroute')).toBeVisible()
  })
  it('should render Details correctly for virtual wireless client with n/a status', async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'ServiceGuardResults', {
      data: { serviceGuardTest: mockResultForVirtualWirelessClient('n/a') }
    })
    render(
      <Provider>
        <Details />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findAllByText('N/A')).not.toBeNull()
  })
  it('should render Details correctly for virtual wireless client with fail status', async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'ServiceGuardResults', {
      data: { serviceGuardTest: mockResultForVirtualWirelessClient('fail') }
    })
    render(
      <Provider>
        <Details />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findAllByText('Fail')).not.toBeNull()
  })

  it('should render Details for virtual wireless client with pending status', async () => {
    mockGraphqlQuery(serviceGuardApiURL, 'ServiceGuardResults', {
      data: { serviceGuardTest: mockResultForVirtualWirelessClient('pending') }
    })
    render(
      <Provider>
        <Details />
      </Provider>,
      { route: { params } }
    )
    expect(await screen.findAllByText('Pending')).not.toBeNull()
  })
})
