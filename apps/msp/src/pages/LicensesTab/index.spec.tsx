import '@testing-library/jest-dom'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { LicensesTab } from './index'

const params = { tenantId: 'tenant-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('LicensesTab', () => {
  it('should render page header', async () => {render(
    <Provider>
      <LicensesTab />
    </Provider>, { route: { params } })
  expect(screen.getByText('MSP Licenses')).toBeVisible()
  expect(screen.getByText('Update Licenses')).toBeVisible()
  expect(screen.getByText('Generate Usage Report')).toBeVisible()
  })
})
