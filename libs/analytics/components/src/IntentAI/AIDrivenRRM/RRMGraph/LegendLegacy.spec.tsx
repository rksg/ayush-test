import { render } from '@acx-ui/test-utils'

import { Legend } from './LegendLegacy'

describe('Legend', () => {
  it('should render properly', async () => {
    const { asFragment } = render(<Legend />)
    expect(asFragment()).toMatchSnapshot()
  })
})
