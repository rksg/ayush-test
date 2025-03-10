import { render } from '@acx-ui/test-utils'

import { ProgressBar, ProgressBarV2 } from '.'

describe('ProgressBar', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<>
      <div style={{ width: '100px' }}><div>0</div><ProgressBar percent={0}/></div>
      <div style={{ width: '100px' }}><div>33.33</div><ProgressBar percent={33.33}/></div>
      <div style={{ width: '100px' }}><div>50</div><ProgressBar percent={50.00}/></div>
      <div style={{ width: '100px' }}><div>66.66</div><ProgressBar percent={66.6600}/></div>
      <div style={{ width: '100px' }}><div>100</div><ProgressBar percent={100}/></div>
    </>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('ProgressBarV2', () => {
  it('should match snapshot', () => {
    const { asFragment } = render(<>
      <div style={{ width: '100px' }}><div>0</div><ProgressBarV2 percent={0}/></div>
      <div style={{ width: '100px' }}><div>33.33</div><ProgressBarV2 percent={33.33}/></div>
      <div style={{ width: '100px' }}><div>50</div><ProgressBarV2 percent={50.00}/></div>
      <div style={{ width: '100px' }}><div>66.66</div><ProgressBarV2 percent={66.6600}/></div>
      <div style={{ width: '100px' }}><div>100</div><ProgressBarV2 percent={100}/></div>
    </>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should match usage - snapshot', () => {
    const { asFragment } = render(<>
      <ProgressBarV2 percent={0}
        gradientMode='usage'
        style={{ height: '8px', lineHeight: '8px' }}/>
      <ProgressBarV2
        percent={25}
        gradientMode='usage'
        style={{ height: '8px', lineHeight: '8px' }}/>
      <ProgressBarV2
        percent={50}
        gradientMode='usage'
        style={{ height: '8px', lineHeight: '8px' }}/>
      <ProgressBarV2
        percent={75}
        gradientMode='usage'
        style={{ height: '8px', lineHeight: '8px' }} />
    </>)
    expect(asFragment()).toMatchSnapshot()
  })

})