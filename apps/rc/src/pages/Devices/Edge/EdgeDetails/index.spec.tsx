import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }               from '@acx-ui/feature-toggle'
import { EdgeUrlsInfo }               from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockEdgeList, mockedEdgeServiceList } from '../__tests__/fixtures'

import EdgeDetails from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeStatusLight: () => <div data-testid={'rc-EdgeStatusLight'} title='EdgeStatusLight' />
}))
jest.mock('./EdgeTroubleshooting', () => ({
  EdgeTroubleshooting: () => <div data-testid='EdgeTroubleshooting' />
}))
jest.mock('./EdgeDhcp', () => ({
  EdgeDhcp: () => <div data-testid='EdgeDhcp' />
}))
jest.mock('./EdgeOverview', () => ({
  EdgeOverview: () => <div data-testid='EdgeOverview' />
}))
jest.mock('./EdgeServices', () => ({
  EdgeDhcp: () => <div data-testid='EdgeServices' />
}))
jest.mock('./EdgeTimeline', () => ({
  EdgeDhcp: () => <div data-testid='EdgeTimeline' />
}))
const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('EdgeDetails', () => {
  const currentEdge = mockEdgeList.data[0]
  let params: { tenantId: string, serialNumber: string, activeTab: string }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: currentEdge.serialNumber,
      activeTab: 'overview'
    }

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json({ data: [currentEdge] }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeServiceList.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeServiceList))
      )
    )
  })

  it('should display overview tab correctly', async () => {
    render(<Provider>
      <EdgeDetails />
    </Provider>, {
      route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/details/:activeTab' }
    })

    const tab = await screen.findByText('Overview')
    expect(tab.getAttribute('aria-selected')).toBe('true')
  })

  it('should display troubleshooting tab correctly', async () => {
    params['activeTab'] = 'troubleshooting'

    render(<Provider>
      <EdgeDetails />
    </Provider>, {
      route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
    })

    const tab = await screen.findByRole('tab', { name: 'Troubleshooting' })
    expect(tab.getAttribute('aria-selected')).toBe('true')
  })

  it('should display service tab correctly', async () => {
    params['activeTab'] = 'services'

    render(<Provider>
      <EdgeDetails />
    </Provider>, {
      route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/details/:activeTab' }
    })

    const tab = await screen.findByText('Services (3)')
    expect(tab.getAttribute('aria-selected')).toBe('true')
  })

  it('should display dhcp tab correctly', async () => {
    params['activeTab'] = 'dhcp'

    render(<Provider>
      <EdgeDetails />
    </Provider>, {
      route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/details/:activeTab' }
    })

    const target = await screen.findByRole('tab', { name: 'DHCP' })
    expect(target).not.toBeNull()
    expect(target?.getAttribute('aria-selected')).toBe('true')
  })

  it('should display timeline tab correctly', async () => {
    params['activeTab'] = 'timeline'

    render(<Provider>
      <EdgeDetails />
    </Provider>, {
      route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/details/:activeTab' }
    })

    const target = await screen.findByRole('tab', { name: 'Timeline' })
    expect(target).not.toBeNull()
    expect(target?.getAttribute('aria-selected')).toBe('true')
  })

  it('test switch tab', async () => {
    const user = userEvent.setup()
    render(<Provider>
      <EdgeDetails />
    </Provider>, {
      route: { params, path: '/:tenantId/t/devices/edge/:serialNumber/details/:activeTab' }
    })

    await user.click(screen.getByRole('tab', { name: 'Services (3)' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge/${params.serialNumber}/details/services`,
      hash: '',
      search: ''
    })
    await user.click(screen.getByRole('tab', { name: 'DHCP' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge/${params.serialNumber}/details/dhcp/pools`,
      hash: '',
      search: ''
    })
    await user.click(screen.getByRole('tab', { name: 'Timeline' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/devices/edge/${params.serialNumber}/details/timeline`,
      hash: '',
      search: ''
    })
  })
})