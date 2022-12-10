import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  DpskUrls,
  ServiceType,
  DpskDetailsTabKey,
  getServiceRoutePath,
  ServiceOperation
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import {
  mockedDpskPassphraseList,
  mockedTenantId,
  mockedServiceId
} from './__tests__/fixtures'
import DpskPassphraseManagement from './DpskPassphraseManagement'

describe('DpskPassphraseManagement', () => {
  const paramsForPassphraseTab = {
    tenantId: mockedTenantId,
    serviceId: mockedServiceId,
    activeTab: DpskDetailsTabKey.PASSPHRASE_MGMT
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })

  beforeEach(() => {
    mockServer.use(
      rest.get(
        DpskUrls.getPassphraseList.url,
        (req, res, ctx) => res(ctx.json(mockedDpskPassphraseList))
      )
    )
  })

  it('should render the Passphrase Management view', async () => {
    const { asFragment } = render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    expect(asFragment()).toMatchSnapshot()

    const targetRecord = mockedDpskPassphraseList.content[0]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    expect(targetRow).toBeInTheDocument()

    await userEvent.click(await within(targetRow).findByRole('img', { name: /eye-invisible/ }))
    const passwordElem = await within(targetRow).findByDisplayValue(targetRecord.passphrase)
    expect(passwordElem).toBeInTheDocument()
  })

  it('should render Add Passphrases drawer', async () => {
    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    await userEvent.click(await screen.findByRole('button', { name: /Add Passphrases/ }))
    const addManuallyRadio = await screen.findByRole('radio', { name: /Add manually/ })
    expect(addManuallyRadio).toBeInTheDocument()
  })

  it('should delete selected passphrase', async () => {
    render(
      <Provider>
        <DpskPassphraseManagement />
      </Provider>, {
        route: { params: paramsForPassphraseTab, path: detailPath }
      }
    )

    const targetRecord = mockedDpskPassphraseList.content[0]

    const targetRow = await screen.findByRole('row', { name: new RegExp(targetRecord.username) })
    await userEvent.click(within(targetRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: /Delete/i }))

    const confirmMsgElem = await screen.findByText('Delete "' + targetRecord.username + '"?')
    expect(confirmMsgElem).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: /Delete Passphrase/i }))
  })
})
