import { storiesOf } from '@storybook/react'

import { ProgressBar, ProgressBarV2 } from '.'

storiesOf('ProgressBar', module)
  .add('Health', () => {
    return <>
      <p style={{ width: '100px' }}><div>0</div><ProgressBar percent={0}/></p>
      <p style={{ width: '100px' }}><div>33.33</div><ProgressBar percent={33.33}/></p>
      <p style={{ width: '100px' }}><div>50</div><ProgressBar percent={50.00}/></p>
      <p style={{ width: '100px' }}><div>66.66</div><ProgressBar percent={66.6600}/></p>
      <p style={{ width: '100px' }}><div>100</div><ProgressBar percent={100}/></p>
    </>
  })
  .add('HealthV2', () => {
    return <>
      <p style={{ width: '100px' }}><div>0</div><ProgressBarV2 percent={0}/></p>
      <p style={{ width: '100px' }}><div>10</div><ProgressBarV2 percent={10}/></p>
      <p style={{ width: '100px' }}><div>33.33</div><ProgressBarV2 percent={33.33}/></p>
      <p style={{ width: '100px' }}><div>50</div><ProgressBarV2 percent={50.00}/></p>
      <p style={{ width: '100px' }}><div>66.66</div><ProgressBarV2 percent={66.6600}/></p>
      <p style={{ width: '100px' }}><div>100</div><ProgressBarV2 percent={100}/></p>
    </>
  })
  .add('HealthV2 usage case', () => {
    return <>
      <p style={{ width: '100px' }}><div>0</div><ProgressBarV2
        percent={0}
        gradientMode='usage'
        style={{ height: '8px', lineHeight: '8px' }}/></p>
      <p style={{ width: '100px' }}><div>25</div><ProgressBarV2
        percent={25}
        gradientMode='usage'
        style={{ height: '8px', lineHeight: '8px' }}/></p>
      <p style={{ width: '100px' }}><div>50</div><ProgressBarV2
        percent={50}
        gradientMode='usage'
        style={{ height: '8px', lineHeight: '8px' }}/></p>

      <p style={{ width: '100px' }}><div>75</div><ProgressBarV2
        percent={75}
        gradientMode='usage'
        style={{ height: '8px', lineHeight: '8px' }} /></p>
    </>
  })

export {}
