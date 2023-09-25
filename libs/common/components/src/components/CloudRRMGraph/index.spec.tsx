import React, { RefObject } from 'react'

import { scalePow } from 'd3-scale'
import ReactECharts from 'echarts-for-react'

import { mockDOMSize, render, waitFor } from '@acx-ui/test-utils'

import { sample }                           from './__tests__/fixtures'
import { deriveInterfering }                from './helper'
import { BandEnum, ProcessedCloudRRMGraph } from './type'

import { Graph } from '.'

const zoomScale = scalePow()
  .exponent(0.01)
  .domain([3, 10, 63, 125, 250, 375, 500])
  .range([2.5, 1, 0.3, 0.2, 0.15, 0.125, 0.1])

describe('Graph', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    mockDOMSize(1280, 800)
  })
  it('should match snapshot', () => {
    const { asFragment } = render(<Graph
      chartRef={() => {}}
      title='Current'
      data={deriveInterfering(sample, BandEnum._5_GHz)}
      zoomScale={zoomScale}
    />)
    const fragment = asFragment()
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')
    fragment.querySelectorAll('path').forEach(path => path?.removeAttribute('transform'))
    expect(fragment).toMatchSnapshot()
  })

  it('should use imperative handle', async () => {
    const mockCallbackRef = jest.fn()
    let createHandleCallback: () => RefObject<ReactECharts>
    jest.spyOn(React, 'useImperativeHandle').mockImplementation((ref, callback) => {
      expect(ref).toEqual(mockCallbackRef)
      createHandleCallback = callback as () => RefObject<ReactECharts>
    })
    render(<Graph
      chartRef={mockCallbackRef}
      title='Current'
      data={deriveInterfering(sample, BandEnum._5_GHz)}
      zoomScale={zoomScale}
    />)
    await waitFor(() => { expect(createHandleCallback()).not.toBeNull() })
  })

  it('should match snapshot when there are no nodes or links', () => {
    const { asFragment } = render(<Graph
      chartRef={() => {}}
      title='Current'
      data={{} as ProcessedCloudRRMGraph}
      zoomScale={zoomScale}
    />)
    const fragment = asFragment()
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')
    fragment.querySelectorAll('path').forEach(path => path?.removeAttribute('transform'))
    expect(fragment).toMatchSnapshot()
  })

  it('should match snapshot when subtext is provided', () => {
    const { asFragment } = render(<Graph
      chartRef={() => {}}
      title='Current'
      subtext='Subtext'
      data={{} as ProcessedCloudRRMGraph}
      zoomScale={zoomScale}
    />)
    const fragment = asFragment()
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')
    fragment.querySelectorAll('path').forEach(path => path?.removeAttribute('transform'))
    expect(fragment).toMatchSnapshot()
  })
})
