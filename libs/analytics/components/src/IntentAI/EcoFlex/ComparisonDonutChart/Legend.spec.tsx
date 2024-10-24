import { render } from '@acx-ui/test-utils'

import { Legend } from './Legend'

describe('Legend', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Legend />)
    expect(asFragment()).toMatchSnapshot()
  })
})
