import React, {
  useState,
  useLayoutEffect,
  useEffect,
  useMemo
}  from 'react'

import _ from 'lodash'

import { render } from '@acx-ui/test-utils'

import  {
  Labels,
  LabelWithPin,
  useGetNode,
  FunnelChart
}             from './funnelChart'
import {
  Label
}             from './styledComponents'

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useLayoutEffect: jest.fn(),
  useEffect: jest.fn(),
  useMemo: jest.fn()
}))

jest.mock('../../../main/lib/hooks')

describe('FunnelChart', () => {
  beforeEach(() => {
    useGetNode.mockReturnValue([{ offsetWidth: 50 }])
    useState.mockImplementation(jest.requireActual('react').useState)
    useEffect.mockImplementation(f => f())
    useMemo.mockImplementation(f => f())
  })
  afterEach(() => {
    useGetNode.mockReset()
    useState.mockReset()
    useEffect.mockReset()
    useMemo.mockReset()
  })
  const props = {
    stages: [
      { name: 'stage1', label: 'stage1 label', value: 10 },
      { name: 'stage2', label: 'stage2 label', value: 10 },
      { name: 'stage3', label: 'stage3 label', value: 10 },
      { name: 'stage4', label: 'stage4 label', value: 10 },
      { name: 'stage5', label: 'stage5 label', value: 50 }
    ],
    valueLabel: 'TTC'
  }
  describe('chart rendering', () => {
    it('should not render any stage if node is not ready', () => {
      useGetNode.mockImplementationOnce(() => [null])
      render(<FunnelChart {...props} />)
      expect(screen.findBy('Stage').exists()).toBeFalsy()
    })
    it('should not render Labels if there is no stage yet', () => {
      const { asFragment } = render(<FunnelChart {...{ ...props, stages: [] }} />)
      expect(asFragment.find(Labels).exists()).toBeFalsy()
    })
    it('should handle on resize', () => {
      window.addEventListener = jest.fn((name, handler) => {
        if (name === 'resize') handler()
      })
      useLayoutEffect.mockImplementationOnce((f) => f())
      renderWithTheme(<FunnelChart {...props} />)
    })
    it('should clean up listener when unmount', () => {
      window.removeEventListener = jest.fn()
      let unmount
      useLayoutEffect.mockImplementationOnce((f) => { unmount = f() })
      shallow(<FunnelChart {...props} />)
      expect(useLayoutEffect).toHaveBeenCalled()
      unmount()
      expect(window.removeEventListener).toHaveBeenCalled()
    })
  })
  describe('interaction', () => {
    it('should fire on change when click on stage', () => {
      const onSelectStage = jest.fn()
      const funnel = shallow(<FunnelChart {...{ ...props, onSelectStage }} />)
      funnel.find(Labels).prop('onClick')('stage1')
      expect(onSelectStage).toHaveBeenCalledWith('stage1')
    })
    it('should fire null when click the slected stage', () => {
      const onSelectStage = jest.fn()
      const funnel = shallow(<FunnelChart {...{
        ...props,
        selectedStage: 'stage1',
        onSelectStage
      }}
      />)
      funnel.find(Labels).prop('onClick')('stage1')
      expect(onSelectStage).toHaveBeenCalledWith('')
    })
  })
  describe('Labels', () => {
    it('should not render if parent is not ready', () => {
      expect(shallow(<Labels parentNode={null} enhancedStages={[]} />)).toEqual({})
    })
    it('should ensure labels visibility', () => {
      const valueFormatter = _.identity
      const enhancedStages = [
        { width: 899, endPosition: 899, valueFormatter },
        { width: 45, endPosition: 945, valueFormatter },
        { width: 45, endPosition: 990, valueFormatter },
        { width: 45, endPosition: 1035, valueFormatter },
        { width: 45, endPosition: 1080, valueFormatter },
        { width: 45, endPosition: 1135, valueFormatter },
        { width: 45, endPosition: 1180, valueFormatter }
      ]
      const parentNode = { offsetWidth: 1000 }
      useState.mockImplementationOnce(() => [
        [
          { offsetWidth: 130 },
          { offsetWidth: 130 },
          { offsetWidth: 130 },
          { offsetWidth: 130 },
          { offsetWidth: 130 },
          { offsetWidth: 130 },
          { offsetWidth: 40 }
        ],
        () => {}
      ])
      const colors = ['black', 'red', 'yellow', 'blue', 'white', '#ccc', '#ddd']
      const props = { enhancedStages, parentNode, parentHeight: 120, colors, onClick: jest.fn() }
      const labels = shallow(<Labels {...props} />)
      const labelWithPins = labels.find(LabelWithPin)
      expect(labelWithPins).toHaveLength(7)
      const compareProps = labelWithPins.map((node) =>
        _.pick(node.props(), ['color', 'dir', 'left', 'line', 'pinPosition', 'top'])
      )
      expect(compareProps).toEqual(
        [{ color: 'black', dir: true, left: 449.5, line: 1, pinPosition: 'left', top: 80
        }, { color: 'red', dir: false, left: 792.5, line: 1, pinPosition: 'right', top: 10
        }, { color: 'yellow', dir: true, left: 837.5, line: 1, pinPosition: 'right', top: 80
        }, { color: 'blue', dir: false, left: 882.5, line: 2, pinPosition: 'right', top: 10
        }, { color: 'white', dir: true, left: 927.5, line: 2, pinPosition: 'right', top: 80
        }, { color: '#ccc', dir: false, left: 982.5, line: 1, pinPosition: 'right', top: 10
        }, { color: '#ddd', dir: true, left: 1140, line: 1, pinPosition: 'left', top: 80
        }]
      )
    })

    it('update child nodes ref', () => {
      const valueFormatter = _.identity
      const enhancedStages = [
        { width: 899, endPosition: 899, valueFormatter }
      ]
      const parentNode = { offsetWidth: 1000 }
      let setChild
      const setChildNodes = jest.fn(f => { setChild = f })
      const node = { offsetWidth: 130 }
      useState.mockImplementationOnce(() => [ [ node ], setChildNodes ])
      const colors = ['black']
      const props = { enhancedStages, parentNode, parentHeight: 120, colors, onClick: jest.fn() }
      const labels = shallow(<Labels {...props} />)
      const labelWithPins = labels.find(LabelWithPin)
      const labelRef = labelWithPins.at(0).prop('labelRef')
      labelRef(0, node)
      expect(setChildNodes).not.toHaveBeenCalled()
      labelRef(0, {})
      expect(setChildNodes).toHaveBeenCalled()
      expect(setChild([])).toEqual([{}])
    })

    it('LabelWithPin in selected stage', () => {
      const props = {
        left: 10,
        top: 10,
        dir: false,
        line: 2,
        isSelected: true,
        valueFormatter: _.identity,
        labelRef: jest.fn()
      }
      const label = shallow(<LabelWithPin {...props} />)
      render(<Label line={2} />)
      expect(label.find(Label).prop('style')).toEqual({
        left: 10,
        top: -20
      })
    })

    it('LabelWithPin should not set ref if node is null', () => {
      useGetNode.mockImplementationOnce(() => [null])
      const props = {
        left: 10,
        top: 10,
        dir: false,
        line: 2,
        isSelected: true,
        valueFormatter: _.identity,
        labelRef: jest.fn()
      }
      shallow(<LabelWithPin {...props} />)
      expect(props.labelRef).not.toHaveBeenCalled()
    })
  })
})
