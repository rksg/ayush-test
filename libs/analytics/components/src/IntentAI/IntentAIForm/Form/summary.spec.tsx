import { render } from '@acx-ui/test-utils'

import { Summary } from './summary'

describe('summary', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<Summary />)
    expect(asFragment()).toMatchSnapshot()
  })
})
