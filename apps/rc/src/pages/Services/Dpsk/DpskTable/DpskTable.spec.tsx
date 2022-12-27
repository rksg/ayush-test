import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
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

import { mockedDpskList } from './__tests__/fixtures'
import DpskTable          from './DpskTable'

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

describe('DpskTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        DpskUrls.getDpskList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedDpskList }))
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

    const targetDpsk = mockedDpskList.content[0]
    expect(await screen.findByRole('button', { name: /Add DPSK Service/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetDpsk.name) })).toBeVisible()
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

    const targetDpsk = mockedDpskList.content[0]
    const row = await screen.findByRole('row', { name: new RegExp(targetDpsk.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + targetDpsk.name + '"?')).toBeVisible()
    const deleteServiceButton = await screen.findByRole('button', { name: /Delete DPSK Service/i })
    await userEvent.click(deleteServiceButton)

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <DpskTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetDpsk = mockedDpskList.content[0]
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
})
