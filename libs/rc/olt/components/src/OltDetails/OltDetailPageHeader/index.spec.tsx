import userEvent from '@testing-library/user-event'

import { Olt, OltFixtures } from '@acx-ui/olt/utils'
import { Provider }         from '@acx-ui/store'
import { render, screen }   from '@acx-ui/test-utils'

import { OltDetailPageHeader } from '.'

const { mockOlt } = OltFixtures

const mockOltActions = {
  showDeleteOlt: jest.fn(),
  showRebootOlt: jest.fn(),
  showRebootLineCard: jest.fn(),
  showRebootOnt: jest.fn(),
  doSyncData: jest.fn()
}
const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  RangePicker: () => <div data-testid='RangePicker' />
}))
jest.mock('../useOltActions', () => ({
  useOltActions: () => mockOltActions
}))
jest.mock('../../OltStatus', () => ({
  OltStatus: () => <div data-testid='OltStatus' />
}))
jest.mock('../OltTabs', () => ({
  OltTabs: () => <div data-testid='OltTabs' />
}))

describe('OltDetailPageHeader', () => { //TODO
  const params = {
    tenantId: 'tenant-id', oltId: 'olt-id', venueId: 'venue-id',
    activeTab: 'overview', activeSubTab: 'panel'
  }
  const mockPath = '/:tenantId/devices/optical/:venueId/:oltId/details/:activeTab/:activeSubTab'

  it('should render correctly', async () => {
    render(<Provider>
      <OltDetailPageHeader oltDetails={mockOlt as Olt} />
    </Provider>, { route: { params, path: mockPath } })

    expect(screen.getByText('TestOlt')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'More Actions' })).toBeInTheDocument()
    expect(screen.getByTestId('OltTabs')).toBeInTheDocument()
    expect(screen.getByTestId('RangePicker')).toBeInTheDocument()
  })

  it('should render without data correctly', async () => {
    render(<Provider>
      <OltDetailPageHeader oltDetails={{} as Olt} />
    </Provider>, { route: { params: { ...params, activeTab: 'onts' }, path: mockPath } })

    expect(screen.queryByRole('button', { name: 'More Actions' })).toBeNull()
    expect(screen.queryByTestId('RangePicker')).toBeNull()
  })
  it('should navigate to config page correctly', async () => {
    render(<Provider>
      <OltDetailPageHeader oltDetails={mockOlt as Olt} />
    </Provider>, {
      route: { params, path: '/:tenantId/devices/optical/:venueId/:oltId/details/:activeTab' }
    })
    expect(screen.getByText('TestOlt')).toBeInTheDocument()
    expect(screen.getByTestId('RangePicker')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Configure/ }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: '/tenant-id/t/devices/optical/venue-id/olt-id/edit',
      search: '',
      hash: ''
    }, {
      state: {
        from: expect.any(Object)
      }
    })
  })

  it('should reboot olt correctly', async () => {
    render(<Provider>
      <OltDetailPageHeader oltDetails={mockOlt as Olt} />
    </Provider>, {
      route: { params, path: '/:tenantId/devices/optical/:venueId/:oltId/details' }
    })
    expect(screen.getByText('TestOlt')).toBeInTheDocument()
    expect(screen.getByTestId('RangePicker')).toBeInTheDocument()
    await userEvent.click(screen.getByText(/More/))
    await userEvent.click(screen.getByText(/Reboot OLT/))
    expect(mockOltActions.showRebootOlt).toHaveBeenCalled()
  })

  it('should reboot line card correctly', async () => {
    render(<Provider>
      <OltDetailPageHeader oltDetails={mockOlt as Olt} />
    </Provider>, {
      route: { params }
    })
    expect(screen.getByText('TestOlt')).toBeInTheDocument()
    await userEvent.click(screen.getByText(/More/))
    await userEvent.click(screen.getByText(/Reboot Line Card/))
    expect(mockOltActions.showRebootLineCard).toHaveBeenCalled()
  })

  it('should reboot ont correctly', async () => {
    render(<Provider>
      <OltDetailPageHeader oltDetails={mockOlt as Olt} />
    </Provider>, {
      route: { params }
    })
    expect(screen.getByText('TestOlt')).toBeInTheDocument()
    await userEvent.click(screen.getByText(/More/))
    await userEvent.click(screen.getByText(/Reboot ONT/))
    expect(mockOltActions.showRebootOnt).toHaveBeenCalled()
  })

  it('should delete olt correctly', async () => {
    render(<Provider>
      <OltDetailPageHeader oltDetails={mockOlt as Olt} />
    </Provider>, {
      route: { params }
    })
    expect(screen.getByText('TestOlt')).toBeInTheDocument()
    await userEvent.click(screen.getByText(/More/))
    await userEvent.click(screen.getByText(/Delete OLT/))
    expect(mockOltActions.showDeleteOlt).toHaveBeenCalled()
  })

})