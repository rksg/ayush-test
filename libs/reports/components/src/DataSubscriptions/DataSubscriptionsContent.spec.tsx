import { get }            from '@acx-ui/config'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import DataSubscriptionsContent from './DataSubscriptionsContent'

const bannerTestId = 'banner-test'
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Banner: () => <div data-testid={bannerTestId} />
}))

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

const mockUseLocationValue = {
  pathname: '/services/list',
  search: '',
  hash: '',
  state: null
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue)
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useRaiR1HelpPageLink: () => ''
}))

describe('DataSubscriptionsContent', () => {
  it('should render DataSubscriptionsContent correct', async () => {
    jest.mocked(get).mockReturnValue('true')
    render(<DataSubscriptionsContent isRAI/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Data Subscriptions')).toBeVisible()
    expect(screen.getByTestId(bannerTestId)).toBeVisible()
  })
})