import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  getServiceDetailsLink,
  getServiceRoutePath,
  PropertyUrlsInfo,
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

import { mockedDetailedResidentPortalList, mockedResidentPortalList } from '../__tests__/fixtures'

import ResidentPortalTable from './ResidentPortalTable'

// import { mockedDpskList, mockedDpskListWithPersona } from './__tests__/fixtures'
// import DpskTable                                     from './DpskTable'

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

describe('ResidentPortalTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  const tablePath =
    '/:tenantId/'
    + getServiceRoutePath({ type: ServiceType.RESIDENT_PORTAL, oper: ServiceOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        PropertyUrlsInfo.getResidentPortalsQuery.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDetailedResidentPortalList }))
      )
    )
  })

  it('should render the table', async () => {
    render(
      <Provider>
        <ResidentPortalTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetResidentPortal = mockedResidentPortalList.content[0]
    expect(await screen.findByRole('button', { name: /Add Resident Portal/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetResidentPortal.name) }))
      .toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <ResidentPortalTable />
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
        PropertyUrlsInfo.deleteResidentPortals.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <ResidentPortalTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetPortal = mockedDetailedResidentPortalList.content[1]
    const row = await screen.findByRole('row', { name: new RegExp(targetPortal.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + targetPortal.name + '"?')).toBeVisible()
    const deleteServiceButton =
      await screen.findByRole('button', { name: /Delete Resident Portal/i })

    await userEvent.click(deleteServiceButton)

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).toBeNull()
    )
  })

  it('should not delete the selected row when it is mapped to Venue', async () => {

    render(
      <Provider>
        <ResidentPortalTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetPortal = mockedDetailedResidentPortalList.content[0]
    const row = await screen.findByRole('row', { name: new RegExp(targetPortal.name) })
    await userEvent.click(within(row).getByRole('radio'))

    expect(screen.queryByRole('button', { name: /Delete/ })).toBeNull()
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <ResidentPortalTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetPortal = mockedDetailedResidentPortalList.content[0]
    const row = await screen.findByRole('row', { name: new RegExp(targetPortal.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const portalEditPath = getServiceDetailsLink({
      type: ServiceType.RESIDENT_PORTAL,
      oper: ServiceOperation.EDIT,
      serviceId: targetPortal.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${portalEditPath}`
    })
  })
})
