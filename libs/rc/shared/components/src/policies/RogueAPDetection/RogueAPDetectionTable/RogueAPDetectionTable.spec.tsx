import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import {
  CommonUrlsInfo,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  RogueApUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockedRogueApPoliciesList, mockVenueRogueApResult } from '../__tests__/fixtures'

import { RogueAPDetectionTable } from './RogueAPDetectionTable'


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

describe('RogueAPDetectionTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        RogueApUrls.getEnhancedRoguePolicyList.url,
        (req, res, ctx) => res(ctx.json(mockedRogueApPoliciesList))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueRogueApResult))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <RogueAPDetectionTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetName = mockedRogueApPoliciesList.data[0].name
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('button', { name: /Add Rogue AP Detection Policy/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetName) })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        RogueApUrls.deleteRogueApPolicies.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <RogueAPDetectionTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockedRogueApPoliciesList.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(await screen.findByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + target.name + '"?')).toBeVisible()

    const dialog = await screen.findByRole('dialog')
    // eslint-disable-next-line max-len
    await userEvent.click(await screen.findByRole('button', { name: /Delete Policy/i }))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <RogueAPDetectionTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockedRogueApPoliciesList.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getPolicyDetailsLink({
      type: PolicyType.ROGUE_AP_DETECTION,
      oper: PolicyOperation.EDIT,
      policyId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })
})
