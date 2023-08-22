import { BandEnum, bandwidthMapping } from '@acx-ui/components'
import { render }                     from '@acx-ui/test-utils'

import { Legend } from './Legend'

describe('Legend', () => {
  it('should render properly', async () => {
    const { asFragment } = render(<Legend bandwidths={bandwidthMapping[BandEnum._2_4_GHz]}/>)
    expect(asFragment()).toMatchSnapshot()
  })
})