import { render } from '@acx-ui/test-utils'

import { Introduction } from './introduction'

describe('introduction', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<Introduction />)
    expect(asFragment()).toMatchSnapshot()
  })
})
