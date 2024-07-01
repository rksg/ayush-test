import { render } from '@acx-ui/test-utils'

import { AIDrivenRRM } from './AIDrivenRRM'

describe('AIDrivenRRM', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<AIDrivenRRM />)
    expect(asFragment()).toMatchSnapshot()
  })
})
