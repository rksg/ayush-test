import { render } from '@acx-ui/test-utils'

import { UsageRate } from '.'

describe('UsageRate', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<>
      <div style={{ width: '100px' }}><div>0</div><UsageRate percent={0}/></div>
      <div style={{ width: '100px' }}><div>5</div><UsageRate percent={5}/></div>
      <div style={{ width: '100px' }}><div>33.33</div><UsageRate percent={33.33}/></div>
      <div style={{ width: '100px' }}><div>50</div><UsageRate percent={50.00}/></div>
      <div style={{ width: '100px' }}><div>66.66</div><UsageRate percent={66.6600}/></div>
      <div style={{ width: '100px' }}><div>100</div><UsageRate percent={100}/></div>
    </>)
    expect(asFragment()).toMatchSnapshot()
  })
})