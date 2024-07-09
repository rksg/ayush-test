import { render } from '@acx-ui/test-utils'

import { Settings } from './settings'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => {
    return {
      form: {
        intentType: 'clientDensity'
      }
    }
  }
}))

describe('settings', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<Settings />)
    expect(asFragment()).toMatchSnapshot()
  })
})
