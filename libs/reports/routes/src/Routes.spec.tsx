import * as config                           from '@acx-ui/config'
import { MLISA_BASE_PATH }                   from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'
import { logRoles, render, screen }          from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions } from '@acx-ui/user'

import ReportsRoutes from './Routes'

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  Report: () => <div data-testid={'some-report-id'} id='acx-report' />,
  CloudStorageForm: () => <div data-testid={'some-ds-cloud-form'} />
}))

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

test('should navigate to reports/wireless for R1', async () => {
  const { container }=render(<Provider><ReportsRoutes /></Provider>, {
    route: {
      path: '/tenantId/t/reports/wireless',
      wrapRoutes: false
    }
  })
  logRoles(container)
  //expect(screen.getByRole('heading', { name: /wireless/i })).toBeDefined()
  expect(screen.getByTestId('some-report-id')).toBeDefined()
})

describe('should navigate correct for RAI', () => {
  beforeEach(() => {
    jest.mocked(get).mockReturnValue('true')
  })
  it('should navigate to reports/wireless', async () => {
    render(<Provider><ReportsRoutes /></Provider>, {
      route: {
        path: MLISA_BASE_PATH+'/reports/wireless',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('some-report-id')).toBeDefined()
  })
  it('should not navigate to data connector cloudStorage', () => {
    render(<Provider><ReportsRoutes /></Provider>, {
      route: {
        path: MLISA_BASE_PATH+'/dataSubscriptions/cloudStorage/edit/testId',
        wrapRoutes: false
      }
    })
    expect(screen.queryByTestId('some-ds-cloud-form')).toBeNull()
  })
  it('should navigate to data connector cloudStorage', () => {
    setRaiPermissions({ WRITE_DATA_CONNECTOR_STORAGE: true } as RaiPermissions)
    render(<Provider><ReportsRoutes /></Provider>, {
      route: {
        path: MLISA_BASE_PATH+'/dataSubscriptions/cloudStorage/edit/testId',
        wrapRoutes: false
      }
    })
    expect(screen.getByTestId('some-ds-cloud-form')).toBeDefined()
  })
})
