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
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

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
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: /Enable Multi-Factor Authentication/i })
    expect(formItem).not.toBeChecked()
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
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: /Enable Multi-Factor Authentication/i })
    expect(formItem).toBeChecked()

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
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: /Enable Multi-Factor Authentication/i })
    expect(formItem).toBeChecked()
    fireEvent.click(formItem)

    const okBtn = await screen.findByRole('button', { name: 'Disable MFA' })
    expect(okBtn).toBeVisible()
  })


  it('should display error when click to disable MFA', async () => {
    mockServer.use(
      rest.put(
        AdministrationUrlsInfo.updateMFAAccount.url,
        (_req, res, ctx) => res(ctx.status(500), ctx.json(null))
      )
    )

    const enabledData = _.cloneDeep(fakeMFATenantDetail)
    enabledData.tenantStatus = MFAStatus.ENABLED

    render(
      <Provider>
        <MFAFormItem
          mfaTenantDetailsData={enabledData}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: /Enable Multi-Factor Authentication/i })
    expect(formItem).toBeChecked()
    fireEvent.click(formItem)

    const okBtn = await screen.findByRole('button', { name: 'Disable MFA' })
    expect(okBtn).toBeVisible()
    fireEvent.click(okBtn)
    expect(await screen.findByText('An error occurred')).toBeVisible()
  })

  it('should be disabled to click toggle MFA', async () => {
    render(
      <Provider>
        <MFAFormItem
          mfaTenantDetailsData={fakeMFATenantDetail}
          isPrimeAdminUser={false}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: /Enable Multi-Factor Authentication/i })
    expect(formItem).toBeDisabled()
  })
})