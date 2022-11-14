import { render } from '@acx-ui/test-utils'

import { ProgressBar } from '.'

describe('ProgressBar', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<>
      <p style={{ width: '100px' }}><div>0</div><ProgressBar percent={0}/></p>
      <p style={{ width: '100px' }}><div>33.33</div><ProgressBar percent={33.33}/></p>
      <p style={{ width: '100px' }}><div>50</div><ProgressBar percent={50.00}/></p>
      <p style={{ width: '100px' }}><div>66.66</div><ProgressBar percent={66.6600}/></p>
      <p style={{ width: '100px' }}><div>100</div><ProgressBar percent={100}/></p>
    </>)
    expect(asFragment()).toMatchSnapshot()
  })
})