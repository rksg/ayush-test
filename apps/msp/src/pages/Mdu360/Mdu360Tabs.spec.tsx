
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import Mdu360Tabs from './Mdu360Tabs'

const mockNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useParams: jest.fn().mockReturnValue({ activeTab: 'networkOverview' }),
  useNavigate: () => mockNavigate,
  useTenantLink: jest.fn().mockReturnValue({ pathname: '/t1/v/mdu360' })
}))

const route = {
  params: { activeTab: 'networkOverview', tenantId: 't1' },
  path: '/:tenantId/v/mdu360/residentExperience'
}

describe('Mdu360', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  const renderComponent = () => {
    render(
      <Provider>
        <Mdu360Tabs startDate='2023-02-01T00:00:00.000Z' endDate='2023-02-01T00:00:00.000Z' />
      </Provider>, {
        route
      })
  }

  it('renders tabs with correct', async () => {
    renderComponent()
    await screen.findByText('Network Overview')
    await screen.findByText('Resident Experience')
    fireEvent.click(await screen.findByText('Resident Experience'))
    expect(mockNavigate).toBeCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith({ pathname: '/t1/v/mdu360/residentExperience' })
  })

})