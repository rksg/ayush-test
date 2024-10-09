// import userEvent from '@testing-library/user-event'
// import { rest }  from 'msw'

import {
  PolicyOperation,
  PolicyType,
  getPolicyListRoutePath,
  getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import FlexibleAuthenticationTable from '.'

// const tenantId = 'tenant-id'
const mockedUsedNavigate = jest.fn()

const mockUseLocationValue = {
  pathname: getPolicyListRoutePath(),
  search: '',
  hash: '',
  state: null
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: jest.fn().mockImplementation(() => mockUseLocationValue)
}))

// const mockedSingleDeleteApi = jest.fn()
describe('FlexibleAuthenticationTable', ()=>{

  let params: { tenantId: string }
  const tablePath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.FLEX_AUTH,
    oper: PolicyOperation.LIST
  })

  beforeEach(() => {
  })
  it('should render correctly', async () => {
    render(
      <Provider>
        <FlexibleAuthenticationTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
  })

})
