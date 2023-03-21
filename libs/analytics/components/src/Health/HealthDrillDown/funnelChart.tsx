// @ts-nocheck
import React, {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback
}                   from 'react'

import _ from 'lodash'

import { formatter } from '@acx-ui/formatter'

import {
  ChartContainer,
  Stage,
  Label,
  Pin,
  StageList
}                   from './styledComponents'
const minVisibleWidth = 10
const chartPadding = 40

export function useGetNode () {
  const [node, setNode] = useState(null)
  const ref = useCallback(node => {
    if (node !== null) {
      setNode(node)
    }
  }, [])
  return [node, ref]
}
export function FunnelChart ({
  height, stages, colors, selectedStage, onSelectStage, valueFormatter,
  valueLabel
}) {
  const [parentNode, ref] = useGetNode()
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const onClick = (name) => {
    onSelectStage(name !== selectedStage ? name : '')
  }
  const enhancedStages = useMemo(() => {
    if (!parentNode) return []
    const parentWidth = parentNode.offsetWidth
    let totalWidth = parentWidth
    const sum = stages.reduce((acc, { value }) => acc + value, 0)
    const filteredStages = stages
      .filter(({ value }) => value)
      .map(stage => {
        const formattedPct = formatter('percentFormat')(stage.value / sum)
        const pct = parseFloat(formattedPct) / 100
        const realWidth = Math.round(pct * parentWidth)
        // ensure stage is always visible visible, then reduce the width of other "normal" stages
        const width = Math.max(realWidth, minVisibleWidth)
        totalWidth -= Math.max(width - realWidth, 0)
        return {
          ...stage,
          formattedPct,
          pct,
          width
        }
      })
    let endPosition = 0
    return filteredStages
      .map((stage, i) => {
        if (stage.width > minVisibleWidth) stage.width = stage.pct * totalWidth
        endPosition += stage.width
        return {
          ...stage,
          valueLabel,
          valueFormatter,
          onClick: onClick.bind(null, stage.name),
          key: stage.name,
          isSelected: stage.name === selectedStage,
          idx: i,
          bgColor: colors[i],
          endPosition
        }
      })
  }, [stages, selectedStage, parentNode, windowWidth])
  useLayoutEffect(() => {
    const handler = function resizeHandler () { setWindowWidth(window.innerWidth) }
    window.addEventListener('resize', handler)
    return function cleanup () { window.removeEventListener('resize', handler) }
  }, [])

  return (
    <ChartContainer height={height} padding={chartPadding} ref={ref}>
      {!enhancedStages.length ? <div>{'No data'}</div> : [
        <StageList key={1}>
          {enhancedStages.map((stage) => <Stage {...stage} />)}
        </StageList>,
        <Labels key={2}
          onClick={onClick}
          enhancedStages={enhancedStages}
          parentNode={parentNode}
          parentHeight={height}
          colors={colors}
        />]}
    </ChartContainer>
  )
}

export function Labels ({
  enhancedStages,
  parentNode,
  parentHeight,
  colors,
  onClick
}) {
  const [childNodes, setChildNodes] = useState(new Array(enhancedStages.length).fill(null))
  const updateChildNodes = (i, node) => {
    if (node !== childNodes[i]) {
      setChildNodes(nodes => {
        const newNodes = nodes.slice()
        newNodes[i] = node
        return newNodes
      })
    }
  }

  const defaultPosition = useMemo(() => enhancedStages.map(
    ({ width, endPosition }) => ({
      left: endPosition - width / 2,
      pinPosition: 'left',
      line: 1
    })))

  const offsetWidths = childNodes.map(node => node && node.offsetWidth)

  const labelPositions = useMemo(() => {
    const labelPositions = defaultPosition.slice()

    for (let i = labelPositions.length - 1; i >= 0; i--) {
      const offsetWidth = offsetWidths[i]
      if (!offsetWidth || !parentNode) continue
      const stage = enhancedStages[i]
      const defaultLeft = defaultPosition[i].left
      const labelRightBoundary = defaultLeft + offsetWidth
      // flip the text if being cut off at the end
      if (labelRightBoundary > parentNode.offsetWidth) {
        if (offsetWidth > stage.width) {
          labelPositions[i] = {
            left: (stage.endPosition - stage.width / 2) - offsetWidth,
            pinPosition: 'right',
            line: 1
          }
        } else {
          labelPositions[i] = {
            left: stage.endPosition - offsetWidth,
            pinPosition: 'left',
            line: 1
          }
        }
      }
      // switch the line if overlap
      const previousLeft = _.get(labelPositions, [i + 2, 'left'], Infinity)
      const previousLine = _.get(labelPositions, [i + 2, 'line'])
      if (labelRightBoundary > previousLeft &&
          labelPositions[i].line === previousLine &&
          previousLine === 1
      ) labelPositions[i].line = 2
    }

    return labelPositions
  }, [parentNode, offsetWidths, enhancedStages])
  if (!parentNode) return null

  return enhancedStages.map((stage, i) => {
    const dir = i % 2 === 0
    const top = !dir ? chartPadding - 30 : parentHeight - 40
    const labelProps = {
      ...stage,
      ...labelPositions[i],
      top,
      dir: i % 2 === 0,
      color: colors[i],
      onClick: onClick.bind(null, stage.name),
      labelRef: updateChildNodes
    }
    return (<LabelWithPin {...labelProps} />)
  })
}


export function LabelWithPin ({ label, left, top, dir, pinPosition, line, idx,
  isSelected, formattedPct, value, valueFormatter, color, labelRef, onClick }) {
  const style = {
    left, top
  }
  const [node, ref] = useGetNode()
  useEffect(() => {
    if (node !== null) labelRef(idx, node)
  }, [node, idx])
  if (line === 2 && !dir) style.top -= 30

  const text = `${label}: ${formattedPct}(${valueFormatter(value)})`
  const dirForElement = dir ? '_' : ''
  return (
    <Label
      onClick={onClick}
      ref={ref}
      style={style}
      isSelected={isSelected}
      dir={dirForElement}
      line={line}
      pinPosition={pinPosition}>
      <Pin dir={dirForElement} color={color} pinPosition={pinPosition} />{text}
    </Label>
  )
}

export const valueFormatter = value => formatter('durationFormat')(value)

