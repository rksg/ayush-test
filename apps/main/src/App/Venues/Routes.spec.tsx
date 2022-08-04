import React from 'react'

import { CommonUrlsInfo }   from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'
import { render, cleanup }  from '@acx-ui/test-utils'
import { mockRestApiQuery } from '@acx-ui/test-utils'

import VenueRoutes from './Routes'

jest.mock('./App/Venues/Routes', () => () => {
  return <div data-testid='venues' />
},{ virtual: true })

describe('AllRoutes', () => {
  beforeEach(() => {
    mockRestApiQuery(CommonUrlsInfo.getDashboardOverview.url, 'get', {})
  })
  afterEach(cleanup)
  test('should navigate to venues list', async () => {
    render(<Provider><VenueRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/venues',
        wrapRoutes: false
      }
    })
  })
  test('should navigate to venues form', async () => {
    render(<Provider><VenueRoutes /></Provider>, {
      route: {
        path: '/t/tenantId/venues/add',
        wrapRoutes: false
      }
    })
  })
})
