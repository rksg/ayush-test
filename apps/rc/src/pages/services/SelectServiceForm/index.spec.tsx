import '@testing-library/jest-dom'
import { render } from '@acx-ui/test-utils'

import { SelectServiceForm } from '.'


describe('Select Service Form', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render form', async () => {
    const { asFragment } = render(
      <SelectServiceForm />, {
        route: { params, path: '/:tenantId/services/select' }
      }
    )

    expect(asFragment).toMatchSnapshot()
  })
})
