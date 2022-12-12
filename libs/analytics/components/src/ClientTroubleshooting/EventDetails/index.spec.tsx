import { render } from '@acx-ui/test-utils'

import Details from '.'

describe('EventDetails', () => {

  const fields = [
    { label: 'label1', value: 'value1' },
    { label: 'label2', value: 'value2' }
  ]


  it('renders Details correctly', () => {
    const { asFragment } = render(<Details fields={fields}/>)
    expect(asFragment()).toMatchSnapshot()
  })
})