import { mockDOMSize, render } from '@acx-ui/test-utils'

import { nodeSize, sampleData } from './__tests__/fixtures'

import { NeighborAPGraph, ProcessedNeighborAPGraph } from '.'

describe('Graph', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    mockDOMSize(1280, 800)
  })
  it('should match snapshot', () => {
    const { asFragment } = render(<NeighborAPGraph
      title='Before'
      data={sampleData}
      nodeSize={nodeSize}
    />)
    const fragment = asFragment()
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')
    fragment.querySelectorAll('path').forEach(path => path?.removeAttribute('transform'))
    expect(fragment).toMatchSnapshot()
  })

  it('should match snapshot when there are no nodes or links', () => {
    const { asFragment } = render(<NeighborAPGraph
      title='Current'
      data={{} as ProcessedNeighborAPGraph}
      nodeSize={nodeSize}
    />)
    const fragment = asFragment()
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')
    fragment.querySelectorAll('path').forEach(path => path?.removeAttribute('transform'))
    expect(fragment).toMatchSnapshot()
  })

  it('should match snapshot when subtext is provided', () => {
    const { asFragment } = render(<NeighborAPGraph
      title='Before'
      subtext='Subtext'
      data={sampleData}
      nodeSize={nodeSize}
    />)
    const fragment = asFragment()
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')
    fragment.querySelectorAll('path').forEach(path => path?.removeAttribute('transform'))
    expect(fragment).toMatchSnapshot()
  })
})
