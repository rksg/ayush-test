import { render } from '@acx-ui/test-utils'

import { Summary } from './summary'

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

describe('summary', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<Summary />)
    expect(asFragment()).toMatchSnapshot()
  })
})
