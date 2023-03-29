import { BrowserRouter as Router }     from '@acx-ui/react-router-dom'
import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render, screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { sessionResponse } from './__tests__/fixtures'
import { api }             from './services'

import { SessionTable } from './index'

describe('SessionTable', () => {

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'Sessions', {
      data: { client: { sessions: [] } }
    })
    render(<Router><Provider><SessionTable/></Provider></Router>)
    expect(screen.getAllByRole('img', { name: 'loader' })).toBeTruthy()
  })

  it('should render table with valid input', async () => {
    mockGraphqlQuery(dataApiURL, 'Sessions', {
      data: sessionResponse
    })

    render(<Provider><SessionTable/></Provider>, {
      route: {
        path: '/tenantId/t/users/wifi/clients/clientId/details/timeline/sessions',
        wrapRoutes: false
      }
    })

    await waitForElementToBeRemoved(screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findAllByText('AP-R350-11-29')).toHaveLength(2)
  })

})
