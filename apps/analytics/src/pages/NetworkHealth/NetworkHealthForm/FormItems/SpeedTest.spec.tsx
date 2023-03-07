import { screen } from '@acx-ui/test-utils'

import { renderForm } from '../../__tests__/fixtures'

import { SpeedTest } from './SpeedTest'

describe('SpeedTest', () => {
  it('renders field', async () => {
    renderForm(<SpeedTest />)

    expect(screen.getByRole('checkbox')).toBeVisible()
  })
})

describe('SpeedTest.FieldSummary', () => {
  it('renders Enabled', async () => {
    renderForm(<SpeedTest.FieldSummary />, {
      initialValues: {
        configs: [{ speedTestEnabled: true }]
      }
    })

    expect(screen.getByTestId('field')).toHaveTextContent('Enabled')
  })

  it('renders Disabled', async () => {
    renderForm(<SpeedTest.FieldSummary />, {
      initialValues: {
        configs: [{ speedTestEnabled: false }]
      }
    })

    expect(screen.getByTestId('field')).toHaveTextContent('Disabled')
  })
})
