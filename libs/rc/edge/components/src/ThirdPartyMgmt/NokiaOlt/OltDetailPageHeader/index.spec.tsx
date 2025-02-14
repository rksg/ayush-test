import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeNokiaOltData, EdgeOltFixtures, EdgeTnmServiceUrls } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { screen, render, mockServer }                            from '@acx-ui/test-utils'

import { EdgeNokiaOltDetailsPageHeader } from '.'
const { mockOlt, mockOltCageList, mockOfflineOlt } = EdgeOltFixtures

jest.mock( './DetailsDrawer', () => ({
  // eslint-disable-next-line max-len
  OltDetailsDrawer: (props: { visible: boolean, setVisible: () => void, currentOlt?: EdgeNokiaOltData }) =>
    props.visible && <div data-testid='OltDetailsDrawer'>{JSON.stringify(props.currentOlt)}</div>
}))

describe('EdgeNokiaOltDetailsPageHeader', () => {
  const params = { tenantId: 'mock-tenant-id', oltId: 'mock-olt-id' }
  const mockPath = '/:tenantId/devices/optical/:oltId/details'
  const mockGetCagesReq = jest.fn()

  const props = {
    currentOlt: mockOlt as EdgeNokiaOltData
  }

  beforeEach(() => {
    mockGetCagesReq.mockClear()

    mockServer.use(
      rest.get(
        EdgeTnmServiceUrls.getEdgeCageList.url,
        (_, res, ctx) => {
          mockGetCagesReq()
          return res(ctx.json(mockOltCageList))
        })
    )
  })

  it('test component renders with expected elements', () => {
    render(<Provider>
      <EdgeNokiaOltDetailsPageHeader {...props} />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByText('TestOlt')).toBeInTheDocument()
    expect(screen.getByText('Device Details')).toBeInTheDocument()
  })

  it('should show detail drawer when button is clicked', async () => {
    render(<Provider>
      <EdgeNokiaOltDetailsPageHeader {...props} />
    </Provider>, { route: { params, path: mockPath } })
    const button = screen.getByText('Device Details')
    await userEvent.click(button)
    expect(await screen.findByTestId('OltDetailsDrawer')).toBeVisible()
  })

  it('test component renders with expected text', () => {
    render(<Provider>
      <EdgeNokiaOltDetailsPageHeader {...props} />
    </Provider>, { route: { params, path: mockPath } })
    expect(screen.getByText('Status')).toBeVisible()
    expect(screen.getByText('Cages')).toBeVisible()
  })

  it('should not trigger getCages API when OLT is offline', async () => {
    render(<Provider>
      <EdgeNokiaOltDetailsPageHeader currentOlt={mockOfflineOlt} />
    </Provider>, { route: { params, path: mockPath } })

    const button = screen.getByText('Device Details')
    expect(mockGetCagesReq).not.toBeCalled()
    await userEvent.click(button)
    expect(await screen.findByTestId('OltDetailsDrawer')).toBeVisible()
  })
})