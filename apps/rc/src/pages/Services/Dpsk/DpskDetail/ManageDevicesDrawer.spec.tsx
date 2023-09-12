import { rest } from 'msw'

import { serviceApi } from '@acx-ui/rc/services'
import {
  DpskUrls,
  CommonUrlsInfo,
  ClientUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  mockedDevices
} from './__tests__/fixtures'
import ManageDevicesDrawer from './ManageDevicesDrawer'

const managePassphraseInfo = {
  id: 'bed56dda739d4738b46c67cda01e5113',
  passphrase: '12345678',
  username: 'DPSK_User_356',
  numberOfDevices: 29,
  createdDate: '2023-09-05T07:08:12.038034',
  expirationDate: null
}

describe('ManageDevicesDrawer', () => {
  beforeEach(() => {
    store.dispatch(serviceApi.util.resetApiState())

    mockServer.use(
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        DpskUrls.getPassphraseDevices.url.replace('?tenantId=:tenantId', ''),
        (req, res, ctx) => {
          return res(ctx.json(mockedDevices))
        }
      ),
      rest.get(
        DpskUrls.getNewFlowPassphraseDevices.url,
        (req, res, ctx) => res(ctx.json(mockedDevices))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json({ data: [], totalCount: 0 }))
      ),
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (_, res, ctx) => res(ctx.json([]))
      )
    )
  })

  it('should render the Passphrase Management view', async () => {
    render(
      <Provider>
        <ManageDevicesDrawer
          visible={true}
          setVisible={() => {}}
          passphraseInfo={managePassphraseInfo}
          setPassphraseInfo={() => {}}
        />
      </Provider>, {
        route: { params: {
          tenantId: 'fe8d6c89c852473ea343c9a0fa66829b',
          serviceId: '89a09af4f9264145a97bef7014c3c8e9',
          passphraseId: 'bed56dda739d4738b46c67cda01e5113'
        } }
      }
    )

    await screen.findByText('11:22:33:44:55:66')
  })
})
