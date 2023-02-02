
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import {  MacRegListUrlsInfo }        from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

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

describe('MacRegistrationListSettingForm', () => {

  it('should render form successfully', async () => {
    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPools.url,
        (req, res, ctx) => res(ctx.json(list))
      )
    )

    render(
      <Provider>
        <Form>
          <MacRegistrationListSettingForm />
        </Form>
      </Provider>
    )
    await userEvent.type(await screen.findByRole('textbox', { name: 'Name' }), 'mac-auth-2')
  })
})
