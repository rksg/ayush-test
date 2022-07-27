import { render } from '@acx-ui/test-utils'

import { SparklineChart } from '.'

describe('SparklineChart',() => {
  test('should render component',()=>{
    const { asFragment } =render(<SparklineChart data={[1,2,3,4,5]}/>)
    const svg = asFragment().querySelector('svg')
    expect(svg).toMatchSnapshot()
  })
  test('should render component with trendLine having red',()=>{
    const { asFragment } =render(<SparklineChart data={[1,2,3,4,5,0]} isTrendLine={true}/>)
    const svg = asFragment().querySelector('svg')
    expect(svg).toMatchSnapshot()
  })

  test('should render component with trendLine having green',()=>{
    const { asFragment } =render(<SparklineChart data={[1,2,3,4,5,6]} isTrendLine={true}/>)
    const svg = asFragment().querySelector('svg')
    expect(svg).toMatchSnapshot()
  })
})