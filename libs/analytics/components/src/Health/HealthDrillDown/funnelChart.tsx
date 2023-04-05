import React, {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  MouseEventHandler
} from 'react'

import { get }                        from 'lodash'
import { MessageDescriptor, useIntl } from 'react-intl'

import { formatter } from '@acx-ui/formatter'


import { Stages, FunnelChartStages, EnhancedStage }     from './config'
import { ChartContainer, Stage, Label, Pin, StageList } from './styledComponents'
const minVisibleWidth = 10
const chartPadding = 40

type LabelPinProps = {
  label: MessageDescriptor;
  left: number;
  top: number;
  dir: string;
  pinPosition: string;
  line: number;
  idx: string;
  formattedPct: string;
  value: number;
  valueFormatter: CallableFunction;
  color: string;
  labelRef: CallableFunction;
  onClick: MouseEventHandler<HTMLDivElement>;
}
type LabelsProps = {
  enhancedStages: EnhancedStage[];
  parentNode: HTMLElement;
  parentHeight: number;
  colors: string[];
  onClick: CallableFunction;
}

export function useGetNode () {
  const [node, setNode] = useState<HTMLElement | null>(null)
  const ref = useCallback((node: HTMLElement) => {
    if (node !== null) {
      setNode(node)
    }
  }, [])
  return [node, ref]
}
export function FunnelChart ({
  height,
  stages,
  colors,
  selectedStage,
  onSelectStage,
  valueFormatter,
  valueLabel
}: {
  stages: FunnelChartStages;
  height: number;
  colors: string[];
  selectedStage: Stages;
  onSelectStage: CallableFunction;
  valueFormatter: CallableFunction;
  valueLabel: string;
}) {
  const [parentNode, ref] = useGetNode()
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const onClick = (width: number, name: string) => {
    onSelectStage(width, name)
  }
  const enhancedStages: EnhancedStage[] = useMemo(() => {
    if (!parentNode) return []
    const parentWidth = (parentNode as HTMLElement).offsetWidth
    let totalWidth = parentWidth
    const sum = stages.reduce((acc, { value }) => acc + (value as number), 0)
    const filteredStages = stages
      .filter(({ value }) => value)
      .map((stage) => {
        const formattedPct = formatter('percentFormat')((stage.value as number) / sum)
        const pct = parseFloat(formattedPct) / 100
        const realWidth = Math.round(pct * parentWidth)
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
    const endStages = filteredStages.map((stage, i) => {
      if (stage.width > minVisibleWidth) {
        stage.width = stage.pct * totalWidth
      }
      endPosition += stage.width
      return {
        ...stage,
        valueLabel,
        valueFormatter,
        key: stage.name,
        isSelected: stage.name === selectedStage,
        idx: i,
        bgColor: colors[i],
        endPosition
      }
    })
    // endPosition is mutable, onclick will capture its final value instead of iterated map value.
    return endStages.map((stage) => ({
      ...stage,
      onClick: () => onClick(stage.endPosition - stage.width / 2, stage.name)
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages, selectedStage, parentNode, windowWidth])
  useLayoutEffect(() => {
    const handler = function resizeHandler () {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handler)
    return function cleanup () {
      window.removeEventListener('resize', handler)
    }
  }, [])

  return (
    <ChartContainer
      height={height}
      padding={chartPadding}
      ref={ref as unknown as React.RefObject<HTMLDivElement>}>
      {!enhancedStages.length ? (
        <div>{'No data'}</div>
      ) : (
        [
          <StageList key={1}>
            {enhancedStages.map((stage) => (
              <Stage role={stage.name} {...stage} />
            ))}
          </StageList>,
          <Labels
            key={2}
            onClick={onClick}
            enhancedStages={enhancedStages}
            parentNode={parentNode as HTMLElement}
            parentHeight={height}
            colors={colors}
          />
        ]
      )}
    </ChartContainer>
  )
}

export const Labels = ({
  enhancedStages,
  parentNode,
  parentHeight,
  colors,
  onClick
}: LabelsProps) => {
  const [childNodes, setChildNodes] = useState(new Array(enhancedStages.length).fill(null))
  const updateChildNodes = (i: number, node: HTMLElement) => {
    if (node !== childNodes[i]) {
      setChildNodes((nodes) => {
        const newNodes = nodes.slice()
        newNodes[i] = node
        return newNodes
      })
    }
  }

  const defaultPosition = enhancedStages.map(
    ({ width, endPosition }: { width: number; endPosition: number }) => ({
      left: endPosition - width / 2,
      pinPosition: 'left',
      line: 1
    })
  )

  const offsetWidths = childNodes.map((node) => node && node.offsetWidth)

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
            left: stage.endPosition - stage.width / 2 - offsetWidth,
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
      const previousLeft = get(labelPositions, [i + 2, 'left'], Infinity)
      const previousLine = get(labelPositions, [i + 2, 'line'])
      if (
        labelRightBoundary > previousLeft &&
        labelPositions[i].line === previousLine &&
        previousLine === 1
      )
        labelPositions[i].line = 2
    }

    return labelPositions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentNode, offsetWidths, enhancedStages])
  if (!parentNode) return null

  return (
    <>
      {enhancedStages.map((stage, i) => {
        const dir = i % 2 === 0
        const top = !dir ? chartPadding - 30 : parentHeight - 40
        const labelProps = {
          ...stage,
          ...labelPositions[i],
          top,
          dir: i % 2 === 0,
          color: colors[i],
          onClick: () => (onClick as CallableFunction)(
            stage.endPosition - stage.width / 2, stage.name
          ),
          labelRef: updateChildNodes
        } as unknown as LabelPinProps
        return <LabelWithPin {...labelProps} />
      })}
    </>
  )
}

export function LabelWithPin ({
  label,
  left,
  top,
  dir,
  pinPosition,
  line,
  idx,
  formattedPct,
  value,
  valueFormatter,
  color,
  labelRef,
  onClick
}: LabelPinProps) {
  const style = {
    left,
    top
  }
  const [node, ref] = useGetNode()
  const { $t } = useIntl()
  useEffect(() => {
    if (node !== null) labelRef(idx, node)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node, idx])
  if (line === 2 && !dir) style.top -= 30

  const text = `${$t(label)}: ${formattedPct}(${valueFormatter(value)})`
  const dirForElement = dir ? '_' : ''
  return (
    <Label
      onClick={onClick}
      ref={ref as unknown as React.RefObject<HTMLDivElement>}
      style={style}
      line={line}
      pinPosition={pinPosition}>
      <Pin dir={dirForElement} color={color} pinPosition={pinPosition} />
      {text}
    </Label>
  )
}
