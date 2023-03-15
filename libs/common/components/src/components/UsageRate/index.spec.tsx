import { render } from '@acx-ui/test-utils'

import { UsageRate } from '.'

describe('UsageRate', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<>
      <p style={{ width: '100px' }}><div>0</div><UsageRate percent={0}/></p>
      <p style={{ width: '100px' }}><div>5</div><UsageRate percent={5}/></p>
      <p style={{ width: '100px' }}><div>33.33</div><UsageRate percent={33.33}/></p>
      <p style={{ width: '100px' }}><div>50</div><UsageRate percent={50.00}/></p>
      <p style={{ width: '100px' }}><div>66.66</div><UsageRate percent={66.6600}/></p>
      <p style={{ width: '100px' }}><div>100</div><UsageRate percent={100}/></p>
    </>)
    expect(asFragment()).toMatchSnapshot()
  })
})
