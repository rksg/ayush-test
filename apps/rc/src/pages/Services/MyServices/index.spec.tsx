import { getSelectServiceRoutePath } from '@acx-ui/rc/utils'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import MyServices from '.'

describe('MyServices', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/t/:tenantId'

  it('should render my services', async () => {
    render(
      <MyServices />, {
        route: { params, path }
      }
    )

    const createPageLink = `/t/${params.tenantId}/` + getSelectServiceRoutePath()
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Add Service' })).toHaveAttribute('href', createPageLink)
  })
})
