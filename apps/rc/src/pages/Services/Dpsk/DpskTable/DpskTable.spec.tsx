import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CommonUrlsInfo,
  DpskUrls,
  getServiceDetailsLink,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Path }     from '@acx-ui/react-router-dom'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'
import { RolesEnum }                      from '@acx-ui/types'
import { getUserProfile, setUserProfile } from '@acx-ui/user'

import { mockedDpskList, mockedDpskListWithPersona } from './__tests__/fixtures'
import DpskTable                                     from './DpskTable'


const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

export const AllowedNetworkList = {
  fields: ['name', 'id', 'defaultGuestCountry'],
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'guest pass wlan1',
      id: 'tenant-id',
      defaultGuestCountry: 'United States'
    },
    {
      name: 'guest pass wlan2',
      id: 'dasjk12359552a9d041813131d007aca',
      defaultGuestCountry: 'United States'
    }
  ]
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

function setRole (role: RolesEnum) {
  const profile = getUserProfile()
  setUserProfile({ ...profile, profile: { ...profile.profile, roles: [role] } })
}

describe('DpskTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        DpskUrls.getEnhancedDpskList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskList }))
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url, (req, res, ctx) =>
        res(ctx.json(AllowedNetworkList))
      )
    )
  })

  it('should render the table', async () => {
    render(
      <Provider>
        <DpskTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetDpsk = mockedDpskList.data[0]
    expect(await screen.findByRole('button', { name: /Add DPSK Service/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetDpsk.name) })).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <DpskTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        DpskUrls.deleteDpsk.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <DpskTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetDpsk = mockedDpskList.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(targetDpsk.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + targetDpsk.name + '"?')).toBeVisible()
    const deleteServiceButton = await screen.findByRole('button', { name: /Delete DPSK Service/i })
    await userEvent.click(deleteServiceButton)

    await waitFor(() => expect(deleteFn).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should not delete the selected row when it is mapped to Identity or Network', async () => {
    mockServer.use(
      rest.post(
        DpskUrls.getEnhancedDpskList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskListWithPersona }))
      )
    )

    render(
      <Provider>
        <DpskTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetDpsk = mockedDpskListWithPersona.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(targetDpsk.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    // eslint-disable-next-line max-len
    expect(await screen.findByText('You are unable to delete this record due to its usage in Identity,Network')).toBeVisible()
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <DpskTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetDpsk = mockedDpskList.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(targetDpsk.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const dpskEditPath = getServiceDetailsLink({
      type: ServiceType.DPSK,
      oper: ServiceOperation.EDIT,
      serviceId: targetDpsk.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${dpskEditPath}`
    })
  })

  it('should render dpsk management title', async () => {
    render(
      <Provider>
        <DpskTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    setRole(RolesEnum.DPSK_ADMIN)

    expect(await screen.findByRole('button', { name: /Add DPSK Service/i })).toBeVisible()
    expect(await screen.findAllByText('DPSK Management')).toHaveLength(1)
  })
})
