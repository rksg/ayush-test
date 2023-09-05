import React, { RefObject } from 'react'

import ReactECharts from 'echarts-for-react'

import { mockDOMSize, render, waitFor } from '@acx-ui/test-utils'

import { sample }                           from './__tests__/fixtures'
import { deriveInterfering }                from './helper'
import { BandEnum, ProcessedCloudRRMGraph } from './type'

import { Graph } from '.'

describe('Graph', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    mockDOMSize(1280, 800)
  })
  it('should match snapshot', () => {
    const { asFragment } = render(<Graph
      chartRef={() => {}}
      title='Current'
      data={deriveInterfering(sample, BandEnum._5_GHz)} />)
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
      data={deriveInterfering(sample, BandEnum._5_GHz)} />)
    await waitFor(() => { expect(createHandleCallback()).not.toBeNull() })
  })

  it('should match snapshot when there are no nodes or links', () => {
    const { asFragment } = render(
      <Graph chartRef={() => {}} title='Current' data={{} as ProcessedCloudRRMGraph}/>)
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
      data={{} as ProcessedCloudRRMGraph}/>)
    const fragment = asFragment()
    fragment.querySelector('div[_echarts_instance_^="ec_"]')?.removeAttribute('_echarts_instance_')
    fragment.querySelectorAll('path').forEach(path => path?.removeAttribute('transform'))
    expect(fragment).toMatchSnapshot()
  })
})
