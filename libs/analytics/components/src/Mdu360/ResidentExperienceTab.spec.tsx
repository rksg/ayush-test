
import { Provider } from '@acx-ui/store'

import ResidentExperienceTab from './ResidentExperienceTab'

const mockNavigate = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useParams: jest.fn().mockReturnValue({ activeTab: 'networkOverview' }),
  useNavigate: () => mockNavigate,
  useTenantLink: jest.fn().mockReturnValue({ pathname: '/t1/v/mdu360' })
}))

describe('ResidentExperienceTab', () => {

  it('renders ResidentExperienceTab correct', () => {
    // please remove MatchSnapshot test when the component is added widget
    expect(<Provider>
      <ResidentExperienceTab
        startDate='2023-02-01T00:00:00.000Z'
        endDate='2023-02-01T00:00:00.000Z' />
    </Provider>).toMatchSnapshot()
  })

})