/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { administrationApi }      from '@acx-ui/rc/services'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store  }       from '@acx-ui/store'
import {
  render,
  screen,
  mockServer
} from '@acx-ui/test-utils'


import { EmailRecipientDialog } from '.'


const adminList = [{
  id: '01b35c76411544999550f038304f18f8',
  createdDate: '2023-08-16T19:12:05.983+00:00',
  updatedDate: '2023-08-16T19:12:05.987+00:00',
  description: 'primeAdmin',
  endpoints: [
    {
      type: 'EMAIL',
      id: 'bed16f134e28411ba6df5de8a3204df7',
      createdDate: '2023-08-16T19:12:05.984+00:00',
      updatedDate: '2023-08-16T19:12:05.984+00:00',
      destination: 'efg.cheng@email.com',
      active: true,
      status: 'OK'
    }
  ]
}
]

const params = { tenantId: 'tenant-id' }
describe('Email recipents dialog', () => {

  beforeEach(() => {
    store.dispatch(administrationApi.util.resetApiState())
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getNotificationRecipients.url,
        (req, res, ctx) => {
          return res(ctx.json(adminList))
        }
      )
    )
  })

  it('should render correctly', async () => {
    const submitFn = jest.fn()
    render(<EmailRecipientDialog
      visible={true}
      onCancel={() => {}}
      onSubmit={submitFn}
      currentEmailList={['efg.cheng@email.com']}
    />, { route: { params }, wrapper: Provider })

    expect(await screen.findByText('efg.cheng@email.com')).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: 'Select' }))

    expect(submitFn).toBeCalled()

  })

  it('should close dialog', async () => {
    const cancelFn = jest.fn()
    render(<EmailRecipientDialog
      visible={true}
      onCancel={cancelFn}
      onSubmit={() => {}}
      currentEmailList={['efg.cheng@email.com']}
    />, { route: { params }, wrapper: Provider })

    expect(await screen.findByText('efg.cheng@email.com')).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))

    await expect(cancelFn).toBeCalled()

  })

})
