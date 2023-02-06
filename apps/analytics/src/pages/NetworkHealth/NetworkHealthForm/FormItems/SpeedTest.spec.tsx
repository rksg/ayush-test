import { screen } from '@acx-ui/test-utils'

import { renderForm } from '../../__tests__/fixtures'

import { SpeedTest } from './SpeedTest'

describe('SpeedTest', () => {
  it('renders field', async () => {
    renderForm(<SpeedTest />)

    expect(screen.getByRole('checkbox')).toBeVisible()
  })
})
