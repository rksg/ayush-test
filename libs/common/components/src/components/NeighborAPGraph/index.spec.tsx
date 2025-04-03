import { mockDOMSize, render } from '@acx-ui/test-utils'

import { nodes, nodeSize, nodesWithZeroValue, rootNode } from './__tests__/fixtures'

import { NeighborAPGraph } from '.'

const base = 120
describe('Graph', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    mockDOMSize(1280, 800)
  })
  it('should match snapshot', () => {
    const { asFragment } = render(<NeighborAPGraph
      title='Before'
      root={rootNode}
      nodeSize={nodeSize}
      nodes={nodes}
      width={base * 3}
      height={base * 4}
    />)
    const fragment = asFragment()
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')
    fragment.querySelectorAll('path').forEach(path => path?.removeAttribute('transform'))
    expect(fragment).toMatchSnapshot()
  })

  it('should match snapshot when there nodes with zero value', () => {
    const { asFragment } = render(<NeighborAPGraph
      title='Current'
      root={rootNode}
      nodeSize={nodeSize}
      nodes={nodesWithZeroValue}
      width={base * 3}
      height={base * 4}
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
      nodeSize={nodeSize}
      root={rootNode}
      nodes={nodes}
      width={base * 3}
      height={base * 4}
    />)
    const fragment = asFragment()
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')
    fragment.querySelectorAll('path').forEach(path => path?.removeAttribute('transform'))
    expect(fragment).toMatchSnapshot()
  })
})
