import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  AaaUrls,
  CommonUrlsInfo,
  EthernetPortProfileUrls,
  PolicyOperation,
  PolicyType,
  getPolicyDetailsLink,
  getPolicyListRoutePath,
  getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { dummayRadiusServiceList, dummyTableResult, mockEthernetPortProfileId, mockedVenuesResult } from './__tests__/fixtures'


import EthernetPortProfile from '.'

const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
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

const mockedSingleDeleteApi = jest.fn()
describe('EthernetPortProfileTable', ()=>{

  let params: { tenantId: string }
  const tablePath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.ETHERNET_PORT_PROFILE,
    oper: PolicyOperation.LIST
  })

  beforeEach(() => {
    params = {
      tenantId: tenantId
    }

    mockedSingleDeleteApi.mockClear()
    mockServer.use(
      rest.post(
        EthernetPortProfileUrls.getEthernetPortProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(dummyTableResult))
      ),

      rest.delete(
        EthernetPortProfileUrls.deleteEthernetPortProfile.url,
        (req, res, ctx) => {
          mockedSingleDeleteApi()
          return res(ctx.status(202))
        }
      ),
      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(dummayRadiusServiceList))
      ),

      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json(mockedVenuesResult))
      )

    )
  })
  it('should create EthernetPortProfileList successfully', async () => {

    render(
      <Provider>
        <EthernetPortProfile />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findAllByRole('row', { name: /ethernetPortProfile_/i })
    const defaultrRow = await screen.findAllByRole('row', { name: /Default/i })
    await waitFor(() =>{expect(row.length+defaultrRow.length).toBe(dummyTableResult.totalCount)})
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <EthernetPortProfile />
      </Provider>, {
        route: { params, path: tablePath }
      })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })
  it('EthernetPortProfile detail page link should be correct', async () => {
    render(
      <Provider>
        <EthernetPortProfile />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const ethernetPortProfileLink = await screen.findByRole('link',
      { name: mockEthernetPortProfileId }) as HTMLAnchorElement
    expect(ethernetPortProfileLink.href)
      .toContain(`/${params.tenantId}/t/${getPolicyDetailsLink({
        type: PolicyType.ETHERNET_PORT_PROFILE,
        oper: PolicyOperation.DETAIL,
        policyId: mockEthernetPortProfileId
      })}`)
  })

  it('should go edit page', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EthernetPortProfile />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /ethernetPortProfile_1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${getPolicyDetailsLink({
        type: PolicyType.ETHERNET_PORT_PROFILE,
        oper: PolicyOperation.EDIT,
        policyId: mockEthernetPortProfileId
      })}`,
      hash: '',
      search: ''
    })
  })

  it('edit button will removed when select above 1 row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EthernetPortProfile />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /ethernetPortProfile_/i })
    await user.click(within(row[0]).getByRole('checkbox'))
    await user.click(within(row[1]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
  })

  it('should delete selected row - single', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EthernetPortProfile />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findByRole('row', { name: /ethernetPortProfile_1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await within(dialog).findByText('Delete "ethernetPortProfile_1"?')
    await user.click(within(dialog).getByRole('button', { name: 'Delete Profile' }))
    await waitFor(() => {
      expect(mockedSingleDeleteApi).toBeCalledTimes(1)
    })
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })
  })

  it('should delete selected row - multiple', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EthernetPortProfile />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /ethernetPortProfile_/i })
    await user.click(within(row[0]).getByRole('checkbox'))
    await user.click(within(row[1]).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await within(dialog).findByText('Delete "2 Profile"?')
    await user.click(within(dialog).getByRole('button', { name: 'Delete Profile' }))
    await waitFor(() => {
      expect(mockedSingleDeleteApi).toBeCalledTimes(2)
    })
    await waitFor(() => {
      expect(dialog).not.toBeVisible()
    })
  })

  it('edit and delete button will remove when select Default Ethernet Port Profile', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EthernetPortProfile />
      </Provider>, {
        route: { params, path: tablePath }
      })
    const row = await screen.findAllByRole('row', { name: /Default/i })
    await user.click(within(row[0]).getByRole('checkbox'))
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
  })

})
