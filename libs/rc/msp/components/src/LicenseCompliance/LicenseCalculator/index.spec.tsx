import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspRbacUrlsInfo }            from '@acx-ui/msp/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import LicenseCalculatorCard from '.'

const rcServices = require('@acx-ui/rc/services')

export const tenantDetail = {
  id: 'ee87b5336d5d483faeda5b6aa2cbed6f',
  createdDate: '2023-01-31T04:19:00.241+00:00',
  updatedDate: '2023-02-15T02:34:21.877+00:00',
  entitlementId: '140360222',
  maintenanceState: false,
  name: 'Dog Company 1551',
  externalId: '0012h00000NrlYAAAZ',
  upgradeGroup: 'production',
  tenantMFA: {
    mfaStatus: 'DISABLED',
    recoveryCodes: ['825910','333815','825720','919107','836842'] },
  preferences: { global: { mapRegion: 'UA' } },
  ruckusUser: false,
  isActivated: true,
  status: 'active',
  tenantType: 'REC'
}

describe('LicenseCompliance', () => {

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        MspRbacUrlsInfo.getCalculatedLicences.url,
        (_req, res, ctx) => res(ctx.json({}))
      ))
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: undefined }
    })
  })
  it('should render LicenseCalculatorCard with default props', async () => {
    const props = {
      title: 'Test Title',
      subTitle: 'Test Subtitle',
      footerContent: <div>Footer Content</div>
    }
    rcServices.useGetTenantDetailsQuery = jest.fn().mockImplementation(() => {
      return { data: tenantDetail }
    })
    render(<Provider><LicenseCalculatorCard {...props} /></Provider>)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Footer Content')).toBeInTheDocument()

    const tabMaxLiceses = screen.getByRole('tab', { name: 'Max Licenses' })
    expect(tabMaxLiceses.getAttribute('aria-selected')).toBeTruthy()
    const tabMaxPeriod = screen.getByRole('tab', { name: 'Max Period' })
    expect(tabMaxPeriod.getAttribute('aria-selected')).toBe('false')
    await userEvent.click(tabMaxPeriod)
    expect(tabMaxPeriod.getAttribute('aria-selected')).toBe('true')
    expect(tabMaxLiceses.getAttribute('aria-selected')).toBe('false')
  })
})
