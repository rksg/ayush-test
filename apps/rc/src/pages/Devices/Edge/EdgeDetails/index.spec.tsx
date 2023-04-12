import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo }               from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockEdgeList } from '../__tests__/fixtures'

import EdgeDetails from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeStatusLight: () => <div data-testid={'rc-EdgeStatusLight'} title='EdgeStatusLight' />
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
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: currentEdge.serialNumber,
      activeTab: 'overview'
    }

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
    expect(tab.getAttribute('aria-selected')).toBe('true')
  })

  // Troubleshooting TBD
  // it('should display troubleshooting tab correctly', async () => {
  //   params['activeTab'] = 'troubleshooting'

  //   render(<Provider>
  //     <EdgeDetails />
  //   </Provider>, {
  //     route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
  //   })

  //   const tab = await screen.findByRole('tab', { name: 'Troubleshooting' })
  //   expect(tab.getAttribute('aria-selected')).toBe('true')
  // })

  it('should display service tab correctly', async () => {
    params['activeTab'] = 'services'

    render(<Provider>
      <EdgeDetails />
    </Provider>, {
      route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
    })

    const tab = await screen.findByText('Services (0)')
    expect(tab.getAttribute('aria-selected')).toBe('true')
  })

  it('should display dhcp tab correctly', async () => {
    params['activeTab'] = 'dhcp'

    render(<Provider>
      <EdgeDetails />
    </Provider>, {
      route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
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
      route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
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
      route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
    })

    await user.click(screen.getByRole('tab', { name: 'Services (0)' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/edge/${params.serialNumber}/edge-details/services`,
      hash: '',
      search: ''
    })
    await user.click(screen.getByRole('tab', { name: 'DHCP' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/edge/${params.serialNumber}/edge-details/dhcp/pools`,
      hash: '',
      search: ''
    })
    await user.click(screen.getByRole('tab', { name: 'Timeline' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/t/${params.tenantId}/devices/edge/${params.serialNumber}/edge-details/timeline`,
      hash: '',
      search: ''
    })
  })
})