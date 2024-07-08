import { render } from '@acx-ui/test-utils'

import { Priority } from './priority'

describe('priority', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<Priority />)
    expect(asFragment()).toMatchSnapshot()
  })
})
