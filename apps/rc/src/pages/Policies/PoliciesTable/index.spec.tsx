import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, RogueApUrls } from '@acx-ui/rc/utils'
import { Provider }                    from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { getPolicyListRoutePath } from '../policyRouteUtils'

import { PoliciesTable } from '.'

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
      type: 'VLAN Pool',
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
      type: 'Rouge AP detection',
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
      )
    )
  })

  it('should render table', async () => {
    const { asFragment } = render(
      <Provider>
        <PoliciesTable />
      </Provider>, {
        route: { params, path: '/:tenantId/' + getPolicyListRoutePath() }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()

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
        route: { params, path: '/:tenantId/' + getPolicyListRoutePath() }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const selectedPolicyName = mockTableResult.data[0].name
    const row = await screen.findByRole('row', { name: new RegExp(selectedPolicyName) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))

    await screen.findByText('Delete "' + selectedPolicyName + '"?')
    await userEvent.click(await screen.findByRole('button', { name: /Delete Policy/i }))
  })
})
