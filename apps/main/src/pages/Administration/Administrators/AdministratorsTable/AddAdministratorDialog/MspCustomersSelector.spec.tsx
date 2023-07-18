/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { MspUrlsInfo } from '@acx-ui/msp/utils'
import { Provider }    from '@acx-ui/store'
import {
  mockServer,
  renderHook,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import MspCustomersSelector from './MspCustomersSelector'

const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
const mockedMSPCustomers = {
  fields: ['name','id'],
  totalCount: 2,
  page: 1,
  data: [{
    id: '2242a683a7594d7896385cfef1fe1234',
    name: 'Customer1',
    entitlements: [
      {
        expirationDateTs: '1680134399000',
        consumed: '0',
        quantity: '1',
        entitlementDeviceType: 'DVCNWTYPE_SWITCH',
        tenantId: '2242a683a7594d7896385cfef1fe1234',
        type: 'entitlement',
        expirationDate: '2023-03-29T23:59:59Z',
        entitlementDeviceSubType: 'ICX71',
        toBeRemovedQuantity: 0
      },
      { expirationDateTs: '1680134399000',consumed: '2',quantity: '2',entitlementDeviceType: 'DVCNWTYPE_WIFI',
        tenantId: '2242a683a7594d7896385cfef1fe1234',type: 'entitlement',expirationDate: '2023-03-29T23:59:59Z',toBeRemovedQuantity: 2 }
    ],
    wifiLicenses: 2,
    switchLicenses: 1
  },
  { id: '350f3089a8e34509a2913c550faf1234',
    name: 'Customer2',
    entitlements: [
      { expirationDateTs: '1680134399000',consumed: '0',quantity: '2',entitlementDeviceType: 'DVCNWTYPE_WIFI',tenantId: '350f3089a8e34509a2913c550faf1234',type: 'entitlement',expirationDate: '2023-03-29T23:59:59Z',toBeRemovedQuantity: 0 },
      { expirationDateTs: '1680134399000',consumed: '0',quantity: '2',entitlementDeviceType: 'DVCNWTYPE_SWITCH',tenantId: '350f3089a8e34509a2913c550faf1234',type: 'entitlement',expirationDate: '2023-03-29T23:59:59Z',entitlementDeviceSubType: 'ICX71',toBeRemovedQuantity: 0 }
    ],
    wifiLicenses: 2,
    switchLicenses: 2
  }]
}

describe('MSP Custom selector component', () => {
  mockServer.use(
    rest.post(
      MspUrlsInfo.getMspCustomersList.url,
      (req, res, ctx) => res(ctx.json(mockedMSPCustomers))
    )
  )

  it('should multiple clickable', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <MspCustomersSelector />
        </Form>
      </Provider>, {
        route: { params }
      })

    const radio = await screen.findByRole('radio', { name: /specific customers/i })
    await userEvent.click(radio)
    await waitFor(async () => {
      expect(await screen.findByRole('combobox')).toBeInTheDocument()
    })
    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)
    await userEvent.click(await screen.findByRole('option', { name: 'Customer1' }))
    await userEvent.click(await screen.findByRole('option', { name: 'Customer2' }))
  })
})