import {
  render
} from '@acx-ui/test-utils'

import { ClientHealthIcon } from '.'

describe('ClientHealthIcon', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<ClientHealthIcon type='good'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})
