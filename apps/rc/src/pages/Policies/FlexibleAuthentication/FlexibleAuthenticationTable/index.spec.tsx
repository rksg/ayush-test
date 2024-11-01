import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  SwitchUrlsInfo,
  PolicyOperation,
  PolicyType,
  getPolicyListRoutePath,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, render, screen, within, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { flexAuthList } from '../__test__/fixtures'

import FlexibleAuthenticationTable from '.'

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

describe('FlexibleAuthenticationTable', ()=>{
  let params: { tenantId: string }
  params = {
    tenantId: 'tenant-id'
  }
  const tablePath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.FLEX_AUTH,
    oper: PolicyOperation.LIST
  })

  beforeEach(() => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getFlexAuthenticationProfiles.url,
        (req, res, ctx) => res(ctx.json(flexAuthList))
      ),
      rest.post(
        SwitchUrlsInfo.getFlexAuthenticationProfileAppliedTargets.url,
        (req, res, ctx) => res(ctx.json([]))
      ),
      rest.delete(
        SwitchUrlsInfo.deleteFlexAuthenticationProfile.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <FlexibleAuthenticationTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const table = await screen.findByRole('table')
    const rows = await within(table).findAllByRole('row')
    expect(rows).toHaveLength(flexAuthList.data.length + 1)

    const button = await screen.findByRole('button', { name: 'Add Authentication' })
    expect(button).toBeVisible()

    const profile01 = within(rows[1])
    const switchRow = await profile01.findAllByRole('cell', { name: /Profile01--auth10-guest5/i })
    expect(switchRow[0]).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <FlexibleAuthenticationTable />
      </Provider>, {
        route: { params, path: tablePath }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
  })

  it('should edit profile correctly', async () => {
    render(
      <Provider>
        <FlexibleAuthenticationTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const table = await screen.findByRole('table')
    const rows = await within(table).findAllByRole('row')
    expect(rows).toHaveLength(flexAuthList.data.length + 1)

    const button = await screen.findByRole('button', { name: 'Add Authentication' })
    expect(button).toBeVisible()

    const profile01 = within(rows[1])
    await userEvent.click(await profile01.findByRole('radio'))
    const editButton = await screen.findByRole('button', { name: 'Edit' })
    await userEvent.click(editButton)

    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/policies/flexibleAuthentication/${flexAuthList.data[0].id}/edit`,
      hash: '',
      search: ''
    })
  })

  it('should delete profile correctly', async () => {
    render(
      <Provider>
        <FlexibleAuthenticationTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const table = await screen.findByRole('table')
    const rows = await within(table).findAllByRole('row')
    expect(rows).toHaveLength(flexAuthList.data.length + 1)

    const button = await screen.findByRole('button', { name: 'Add Authentication' })
    expect(button).toBeVisible()

    const profile01 = within(rows[1])
    await userEvent.click(await profile01.findByRole('radio'))
    const deleteButton = await screen.findByRole('button', { name: 'Delete' })
    await userEvent.click(deleteButton)

    const deleteDialog = await screen.findByRole('dialog')
    await userEvent.click(
      await within(deleteDialog).findByRole('button', { name: /Delete Profile/i })
    )
    await waitFor(() => expect(deleteDialog).not.toBeVisible())
  })
})
