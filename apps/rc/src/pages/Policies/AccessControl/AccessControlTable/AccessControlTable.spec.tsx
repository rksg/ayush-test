import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import {
  AccessControlUrls,
  CommonUrlsInfo,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { enhancedAccessControlList } from '../__tests__/fixtures'

import AccessControlTable from './AccessControlTable'

const mockTableResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: '7217d467353744d9aac8493324501be3',
    name: 'My Access Control 1',
    type: 'Access Control',
    scope: '1'
  }]
}

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('AccessControlTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedAccessControlProfiles.url,
        (req, res, ctx) => res(ctx.json(enhancedAccessControlList))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <AccessControlTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetName = mockTableResult.data[0].name
    expect(await screen.findByRole('button', { name: /Add Access Control Set/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetName) })).toBeVisible()
  })

  // TODO Should implement this after API is ready
  it.todo('should delete selected row')

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <AccessControlTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getPolicyDetailsLink({
      type: PolicyType.ACCESS_CONTROL,
      oper: PolicyOperation.EDIT,
      policyId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })
})
