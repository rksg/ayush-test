/* eslint-disable max-len */
import { userEvent } from '@storybook/testing-library'
import { rest }      from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }              from '@acx-ui/store'
import {
  render,
  screen,
  mockServer
} from '@acx-ui/test-utils'


import { EmailRecipientDialog } from '.'


const adminList = [{
  id: '0587cbeb13404f3b9943d21f9e1d1e9e',
  email: 'efg.cheng@email.com',
  name: 'primeAdmin',
  role: 'PRIME_ADMIN',
  delegateToAllECs: true,
  detailLevel: 'debug'
}
]

const params = { tenantId: 'tenant-id' }
describe('Email recipents dialog', () => {

  beforeEach(() => {
    mockServer.use(
      rest.get(
        AdministrationUrlsInfo.getAdministrators.url,
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

    userEvent.click(await screen.findByRole('button', { name: 'Select' }))

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
