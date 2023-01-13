/* eslint-disable max-len */
import _        from 'lodash'
import { rest } from 'msw'

import { AdministrationUrlsInfo, MFAStatus } from '@acx-ui/rc/utils'
import { Provider  }                         from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import { fakeMFATenantDetail } from '../__tests__/fixtures'

import  { MFAFormItem } from './'

const mockedNavigatorWriteText = jest.fn()
describe('Enable MFA Checkbox', () => {
  let params: { tenantId: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  beforeEach(() => {
    mockServer.use(
      rest.put(
        AdministrationUrlsInfo.updateMFAAccount.url,
        (_req, res, ctx) => res(ctx.status(200))
      )
    )

    Object.assign(window.navigator, {
      clipboard: {
        writeText: mockedNavigatorWriteText
      }
    })
  })

  it('should display confirm dialog after enable MFA checkbox changed', async () => {
    render(
      <Provider>
        <MFAFormItem
          mfaTenantDetailsData={fakeMFATenantDetail}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: /Enable Multi-Factor Authentication/i })
    expect(formItem.getAttribute('value')).toBe('false')
    fireEvent.click(formItem)

    const okBtn = await screen.findByRole('button', { name: 'Enable MFA' })
    expect(okBtn).toBeVisible()

    fireEvent.click(okBtn)
  })

  it('should successfully copy codes', async () => {
    const enabledData = _.cloneDeep(fakeMFATenantDetail)
    enabledData.tenantStatus = MFAStatus.ENABLED

    render(
      <Provider>
        <MFAFormItem
          mfaTenantDetailsData={enabledData}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: /Enable Multi-Factor Authentication/i })
    expect(formItem.getAttribute('value')).toBe('true')

    const copyBtn = await screen.findByText( 'Copy Codes' )
    fireEvent.click(copyBtn)
    expect(mockedNavigatorWriteText).toBeCalledWith('678490\n287605\n230202\n791760\n169187')
  })

  it('should correctly display when click to disable MFA', async () => {
    const enabledData = _.cloneDeep(fakeMFATenantDetail)
    enabledData.tenantStatus = MFAStatus.ENABLED

    render(
      <Provider>
        <MFAFormItem
          mfaTenantDetailsData={enabledData}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: /Enable Multi-Factor Authentication/i })
    expect(formItem.getAttribute('value')).toBe('true')
    fireEvent.click(formItem)

    const okBtn = await screen.findByRole('button', { name: 'Disable MFA' })
    expect(okBtn).toBeVisible()
    expect(await screen.findByText('Recovery Codes')).toBeVisible()
  })
})