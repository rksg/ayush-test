import { render } from '@acx-ui/test-utils'

import { IntentAIDrivenRRM } from '.'

describe('AIDrivenRRM', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<IntentAIDrivenRRM />)
    expect(asFragment()).toMatchSnapshot()
  })
})