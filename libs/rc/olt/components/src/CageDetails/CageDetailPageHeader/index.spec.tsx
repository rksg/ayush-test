import userEvent from '@testing-library/user-event'

import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { CageDetailsProvider } from '../cageDetailsState'

import { CageDetailPageHeader } from './index'

const { mockOlt, mockOltCageList } = OltFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('../OltStatus', () => ({
  OltStatus: () => <div data-testid='OltStatus' />
}))
jest.mock('./ManageOntsDrawer', () => ({
  ManageOntsDrawer: ({ visible, onClose }: { visible: boolean, onClose: () => void }) =>
    visible ? <div data-testid='ManageOntsDrawer' onClick={onClose} /> : null
}))

describe('CageDetailPageHeader', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <CageDetailsProvider
        cageDetails={mockOltCageList[3]}
        initialTab='Panel'
      >
        <CageDetailPageHeader
          oltDetails={mockOlt}
          cageDetails={mockOltCageList[3]}
        />
      </CageDetailsProvider>
    </Provider>, {
      route: { params }
    })

    expect(screen.getByText('S1/4')).toBeInTheDocument()
    expect(screen.getByTestId('OltStatus')).toBeInTheDocument()
    expect(screen.getByText('Manage ONTs')).toBeInTheDocument()
  })

  it('should render without cage data correctly', async () => {
    render(<Provider>
      <CageDetailsProvider
        cageDetails={{}}
      >
        <CageDetailPageHeader
          oltDetails={mockOlt}
          cageDetails={{}}
        />
      </CageDetailsProvider>
    </Provider>, {
      route: { params }
    })

    expect(screen.getByText('--')).toBeInTheDocument()
    expect(screen.getByTestId('OltStatus')).toBeInTheDocument()
    expect(screen.getByText('Manage ONTs')).toBeInTheDocument()
  })

  it('should render ManageOntsDrawer after clicking manage ONTs button', async () => {
    render(<Provider>
      <CageDetailsProvider
        cageDetails={mockOltCageList[3]}
        initialTab='Panel'
      >
        <CageDetailPageHeader
          oltDetails={mockOlt}
          cageDetails={mockOltCageList[3]}
        />
      </CageDetailsProvider>
    </Provider>, {
      route: { params }
    })

    const manageOntsButton = screen.getByText('Manage ONTs')
    expect(manageOntsButton).toBeInTheDocument()
    await userEvent.click(manageOntsButton)
    expect(screen.getByTestId('ManageOntsDrawer')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('ManageOntsDrawer'))
    expect(screen.queryByTestId('ManageOntsDrawer')).toBeNull()
  })

  it('should throw error when not wrapped by CageDetailsProvider correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<Provider>
        <CageDetailPageHeader
          oltDetails={mockOlt}
          cageDetails={mockOltCageList[3]}
        />
      </Provider>, {
        route: { params }
      })
    }).toThrow('useCageDetails must be used within a CageDetailsProvider')

    consoleSpy.mockRestore()
  })
})
