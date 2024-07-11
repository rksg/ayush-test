import { render, screen } from '@acx-ui/test-utils'

import { Settings } from './settings'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => {
    return {
      form: {
        getFieldValue: () => 'partial'
      }
    }
  }
}))

describe('settings', () => {
  it('should match snapshot', async () => {
    const { asFragment } = render(<Settings />)
    expect(await screen.findByText('High client throughput in sparse network')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})
