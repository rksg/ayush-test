import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AccessControlUrls, CommonUrlsInfo, RogueApUrls, getPolicyListRoutePath } from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import PoliciesTable from '.'

const mockTableResult = {
  totalCount: 3,
  page: 1,
  data: [
    {
      id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
      name: 'Policy 1',
      type: 'Access Control',
      technology: 'WI-FI',
      scope: '5',
      tags: [
        'tag1',
        'tag2'
      ]
    },
    {
      id: 'aa080e33-26a7-4d34-870f-b7f312fcfccb',
      name: 'Policy 2',
      type: 'VLAN Pools',
      technology: 'WI-FI',
      scope: '7',
      tags: [
        'tag3',
        'tag4'
      ]
    },
    {
      id: 'aa080e33-26a7-4d34-870f-b7f312fcfccc',
      name: 'Policy 3',
      type: 'Rogue AP Detection',
      technology: 'WI-FI',
      scope: '8',
      tags: [
        'tag3',
        'tag4'
      ]
    },
    {
      id: 'bbc80e33-2547-4d34-870f-b7f245fcfccc',
      name: 'Default profile',
      type: 'Rogue AP Detection',
      technology: 'WI-FI',
      scope: '8',
      tags: [
        'tag3',
        'tag4'
      ]
    }
  ]
}

describe('PoliciesTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getPoliciesList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.delete(
        RogueApUrls.deleteRogueApPolicy.url,
        (req, res, ctx) => res(ctx.json({ requestId: '' }))
      ),
      rest.delete(
        AccessControlUrls.deleteAccessControlProfile.url,
        (req, res, ctx) => res(ctx.json({ requestId: '' }))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <PoliciesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/' + getPolicyListRoutePath() }
      })

    const targetPolicyName = mockTableResult.data[0].name
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('button', { name: /Add Policy or Profile/i })).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('row', { name: new RegExp(targetPolicyName) })).toBeInTheDocument()
  })

  it('should delete selected row', async () => {
    render(
      <Provider>
        <PoliciesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/' + getPolicyListRoutePath() }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const selectedPolicyName = mockTableResult.data[0].name
    const row = await screen.findByRole('row', { name: new RegExp(selectedPolicyName) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))

    await screen.findByText('Delete "' + selectedPolicyName + '"?')
    await userEvent.click(await screen.findByRole('button', { name: /Delete Policy/i }))
  })

  it('should not delete default profile successfully', async () => {
    render(
      <Provider>
        <PoliciesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/' + getPolicyListRoutePath() }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const selectedPolicyName = 'Default profile'
    const row = await screen.findByRole('row', { name: new RegExp(selectedPolicyName) })
    await userEvent.click(within(row).getByRole('radio'))

    const delBtn = screen.queryByText('delete')



    expect(delBtn).not.toBeInTheDocument()
  })
})
