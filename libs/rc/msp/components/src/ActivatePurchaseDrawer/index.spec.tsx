
import { rest } from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  render,
  screen,
  mockServer
} from '@acx-ui/test-utils'

import { ActivatePurchaseDrawer } from './'

const services = require('@acx-ui/rc/services')

const fakeActivationData =
{
  orderId: 'a0EO3000001ZfCbMAK',
  salesOrderId: 'a0FO3000000xInJMAU',
  productName: 'R1 Pro 1 AP/SW REC 1-Yr',
  productCode: 'CLD-PROF-APSW-REC1',
  productId: '01t2h000006KerfAAC',
  quantity: 100,
  registeredQuantity: 0,
  remainingQuantity: 1,
  spaStartDate: '2024-04-22',
  spaEndDate: '2025-04-22',
  productCategory: 'ACX',
  productClass: 'ACX-PROF-NEW',
  orderSoNumber: '03726423',
  orderCreateDate: '2024-04-22T08:51:27.000+0000',
  orderRegistrationCode: 'BUG-HIT-GUM',
  orderAcxRegistrationCode: 'ACX-03726423-BUG-HIT-GUM'
}

const fakeActivationDataPassEnddate =
{
  orderId: 'a0EO3000001ZfHRMA0',
  salesOrderId: 'a0FO3000000xIs9MAE',
  productName: 'R1 Pro 1 AP/SW EDU 1-Yr',
  productCode: 'CLD-PROF-APSW-EDU1',
  productId: '01t2h000006KertAAC',
  quantity: 100,
  registeredQuantity: 0,
  remainingQuantity: 1,
  spaStartDate: '2023-04-22',
  spaEndDate: '2024-04-22',
  productCategory: 'ACX',
  productClass: 'ACX-PROF-NEW',
  orderSoNumber: '03726424',
  orderCreateDate: '2023-04-22T08:52:12.000+0000',
  orderRegistrationCode: 'BUG-HIT-ACE',
  orderAcxRegistrationCode: 'ACX-03726424-BUG-HIT-ACE'
}

describe('Activate Purchase Drawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.spyOn(services, 'usePatchEntitlementsActivationsMutation')
    mockServer.use(
      rest.put(
        AdministrationUrlsInfo.patchEntitlementsActivations.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render layout correctly', async () => {
    render(
      <Provider>
        <ActivatePurchaseDrawer
          visible={true}
          activationData={fakeActivationData}
          setVisible={jest.fn()} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Activate Purchase')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Activate' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })
  it('should render spa end date passed correctly', async () => {
    render(
      <Provider>
        <ActivatePurchaseDrawer
          visible={true}
          activationData={fakeActivationDataPassEnddate}
          setVisible={jest.fn()} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Activate Purchase')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Activate' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
  })

})
