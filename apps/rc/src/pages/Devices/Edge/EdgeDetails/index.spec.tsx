import { rest } from 'msw'

import { EdgeUrlsInfo }               from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockEdgeList } from '../__tests__/fixtures'

import EdgeDetails from '.'

jest.mock('../EdgeStatusLight', () => ({
  EdgeStatusLight: () => <div data-testid={'rc-EdgeStatusLight'} title='EdgeStatusLight' />
}))


describe('EdgeDetails', () => {
  const currentEdge = mockEdgeList.data[0]
  let params: { tenantId: string, serialNumber: string, activeTab: string } =
  {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serialNumber: currentEdge.serialNumber,
    activeTab: 'overview'
  }


  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json({ data: [currentEdge] }))
      )
    )
  })

  it('should display overview tab correctly', async () => {
    render(<Provider>
      <EdgeDetails />
    </Provider>, {
      route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
    })

    const tab = await screen.findByText('Overview')
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should display troubleshooting tab correctly', async () => {
    params['activeTab'] = 'troubleshooting'

    render(<Provider>
      <EdgeDetails />
    </Provider>, {
      route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
    })

    const tab = await screen.findByRole('tab', { name: 'Troubleshooting' })
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should display service tab correctly', async () => {
    params['activeTab'] = 'services'

    render(<Provider>
      <EdgeDetails />
    </Provider>, {
      route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
    })

    const tab = await screen.findByText('Services (0)')
    expect(tab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('should display timeline tab correctly', async () => {
    params['activeTab'] = 'timeline'

    const { asFragment }= render(<Provider>
      <EdgeDetails />
    </Provider>, {
      route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
    })


    const target = asFragment().querySelector('[role=tab][aria-controls*=timeline]')
    expect(target).not.toBeNull()
    expect(target?.getAttribute('aria-selected')).toBeTruthy()
  })
})