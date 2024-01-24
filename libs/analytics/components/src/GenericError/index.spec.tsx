import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import GenericError from '.'

describe('GenericError', () => {
  it('should display default error', async () => {
    render(<Provider><GenericError/></Provider>, {
      route: {
        params: { tenantId: 't1', serialNumber: '000000000001' },
        path: '/:tenantId/t/devices/wifi/:serialNumber/details/analytics'
      }
    })
    expect(await screen.findByText('Please reduce the time period selection and try again.'))
      .toBeInTheDocument()
  })
  it('should display custome error', async () => {
    render(<Provider><GenericError errMsg='custom error' /></Provider>, {
      route: {
        params: { tenantId: 't1', serialNumber: '000000000001' },
        path: '/:tenantId/t/devices/wifi/:serialNumber/details/analytics'
      }
    })
    expect(await screen.findByText('custom error'))
      .toBeInTheDocument()
  })
})
