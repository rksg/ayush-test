import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { ipSecApi }                                                       from '@acx-ui/rc/services'
import { IpsecUrls }                                                      from '@acx-ui/rc/utils'
import { Provider, store }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockIpSecTable }     from './__tests__/fixtures'
import { IpsecDetailsDrawer } from './IpsecDetailsDrawer'

const readViewPath = '/:tenantId/t/policies/ipsec'

const params = {
  tenantId: 'tenantId'
}
describe('IpsecDetailsDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    store.dispatch(ipSecApi.util.resetApiState())

    mockServer.use(
      rest.post(
        IpsecUrls.getIpsecViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockIpSecTable.data))
      )
    )
  })

  // eslint-disable-next-line max-len
  it('should successfully fetch data from the API, edit it, and navigate back to the list page', async () => {
    const mockedSetVisible = jest.fn()
    render(
      <Provider>
        <IpsecDetailsDrawer
          visible={true}
          setVisible={mockedSetVisible}
          ipsecId='mock-ipsec-id'
        />
      </Provider>,
      { route: { path: readViewPath, params } }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line max-len
    expect(await screen.findByText('Profile Details: '+ mockIpSecTable.data.data[0].name)).toBeVisible()
    expect(await screen.findByText('128.0.0.1')).toBeVisible()

    await userEvent.click(screen.getByLabelText('Close'))
    await waitFor(() => expect(mockedSetVisible).toBeCalledTimes(1))
  })

  it('should handle ipsecId is undefined', async () => {
    render(
      <Provider>
        <IpsecDetailsDrawer
          visible={true}
          setVisible={jest.fn()}
          ipsecId={undefined}
        />
      </Provider>,
      { route: { path: readViewPath, params } }
    )

    expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()

    expect(await screen.findByText('Profile Details:')).toBeVisible()
  })
})