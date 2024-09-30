import '@testing-library/jest-dom'
import { render } from '@acx-ui/test-utils'

import { BetaIndicator } from '.'

describe('BetaIndicator', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<>
      <BetaIndicator />
      <BetaIndicator size='md' />
    </>)
    expect(asFragment()).toMatchSnapshot()
  })
})
