import userEvent from '@testing-library/user-event'

import { OltFixtures }    from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { CageDetailPageHeader } from './CageDetailPageHeader'
import { CageDetailsProvider }  from './cageDetailsState'

const { mockOlt, mockOltCageList } = OltFixtures

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('@acx-ui/olt/components', () => ({
  OltStatus: () => <div data-testid='OltStatus' />,
  ManageOntsDrawer: () => <div data-testid='ManageOntsDrawer' />
}))

describe('CageDetailPageHeader', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  it('should render correctly', async () => {
    render(<Provider>
      <CageDetailsProvider
        cageDetails={mockOltCageList[3]}
        initialTab='overview'
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

  it('should render ManageOntsDrawer after clicking manage ONTs button', async () => {
    render(<Provider>
      <CageDetailsProvider
        cageDetails={mockOltCageList[3]}
        initialTab='overview'
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
  })
})
