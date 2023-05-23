
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { MacRegListUrlsInfo, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { BrowserRouter as Router }                     from '@acx-ui/react-router-dom'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen }                  from '@acx-ui/test-utils'

import { MacRegistrationListSettingForm } from './MacRegistrationListSettingForm'

const list = {
  content: [
    {
      id: 'efce7414-1c78-4312-ad5b-ae03f28dbc68',
      name: 'Registration pool',
      description: '',
      autoCleanup: true,
      enabled: true,
      expirationEnabled: false,
      registrationCount: 5
    }
  ],
  pageable: {
    sort: { unsorted: true, sorted: false, empty: true },
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false
  },
  totalPages: 1,
  totalElements: 1,
  last: true,
  sort: { unsorted: true, sorted: false, empty: true },
  numberOfElements: 1,
  first: true,
  size: 10,
  number: 0,
  empty: false
}

const policySetList = {
  paging: {
    totalCount: 2,
    page: 1,
    pageSize: 2,
    pageCount: 1
  },
  content: [
    {
      id: '50f5cec9-850d-483d-8272-6ee5657f53da',
      name: 'testPolicySet',
      description: 'for test'
    },
    {
      id: '6ef51aa0-55da-4dea-9936-c6b7c7b11164',
      name: 'testPolicySet1',
      description: 'for test'
    }
  ]
}

describe('MacRegistrationListSettingForm', () => {
  jest.mocked(useIsSplitOn).mockReturnValue(true)

  it('should render form successfully', async () => {
    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.post(
        MacRegListUrlsInfo.searchMacRegistrationPools.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(list))
      )
    )

    render(
      <Router>
        <Provider>
          <Form>
            <MacRegistrationListSettingForm />
          </Form>
        </Provider>
      </Router>
    )
    await userEvent.type(await screen.findByRole('textbox', { name: 'Name' }), 'mac-auth-2')
  })
})
