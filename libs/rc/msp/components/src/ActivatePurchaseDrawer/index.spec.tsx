
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  waitFor
} from '@acx-ui/test-utils'

import { ActivatePurchaseDrawer } from './'

const services = require('@acx-ui/rc/services')
const user = require('@acx-ui/user')

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

const userProfile1 = {
  adminId: '9b85c591260542c188f6a12c62bb3912',
  companyName: 'msp.eleu1658',
  dateFormat: 'mm/dd/yyyy',
  detailLevel: 'debug',
  email: 'msp.eleu1658@mail.com',
  externalId: '0032h00000gXuBNAA0',
  firstName: 'msp',
  lastName: 'eleu1658',
  role: 'PRIME_ADMIN',
  support: true,
  tenantId: '3061bd56e37445a8993ac834c01e2710',
  username: 'msp.eleu1658@rwbigdog.com',
  var: true,
  varTenantId: '3061bd56e37445a8993ac834c01e2710',
  allowedRegions:
  [
    {
      name: 'Asia',
      description: 'APAC region',
      link: 'https://int.ruckus.cloud',
      current: false
    },
    {
      name: 'EU',
      description: 'European Union',
      link: 'https://qa.ruckus.cloud',
      current: false
    },
    {
      name: 'US',
      description: 'United States of America',
      link: 'https://dev.ruckus.cloud',
      current: true
    }
  ]
}

describe('Activate Purchase Drawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.spyOn(services, 'usePatchEntitlementsActivationsMutation')
    mockServer.use(
      rest.patch(
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
  it('cancel should close correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <ActivatePurchaseDrawer
          visible={true}
          activationData={fakeActivationData}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Activate Purchase')).toBeVisible()
    const cancel = screen.getByRole('button', { name: 'Cancel' })

    await userEvent.click(cancel)
    expect(mockedCloseDrawer).toHaveBeenCalled()
  })
  it('should save correctly', async () => {
    user.useUserProfileContext = jest.fn().mockImplementation(() => {
      return { data: userProfile1 }
    })
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <ActivatePurchaseDrawer
          visible={true}
          activationData={fakeActivationData}
          setVisible={mockedCloseDrawer} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Activate Purchase')).toBeVisible()
    await userEvent.click(screen.getAllByRole('radio')[2])
    await userEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Activate' })).toBeEnabled()
    })
    await userEvent.click(screen.getByRole('button', { name: 'Activate' }))

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '456' },
      status: 'fulfilled'
    })]
    await waitFor(()=>
      expect(services.usePatchEntitlementsActivationsMutation).toHaveLastReturnedWith(value))
    expect(mockedCloseDrawer).toHaveBeenCalled()
  })
})
