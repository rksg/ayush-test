import { useState } from 'react'

import Xarrow from 'react-xarrows'

import { ApMeshLink } from '@acx-ui/rc/utils'

import ApMeshConnectionTooltip from '../ApMeshConnectionTooltip'
import { getColorForLine }     from '../ApMeshConnectionTooltip/utils'

export interface ApMeshConnectionProps {
  linkInfo: ApMeshLink
}

export default function ApMeshConnection (props: ApMeshConnectionProps) {
  const { linkInfo: lineInfo } = props
  const [ clickedComponentKey, setClickedComponentKey ] = useState<string | null>(null)
  const isWired = lineInfo.connectionType === 'Wired'

  const fromId = genApMeshConnectionId(lineInfo.from)
  const toId = genApMeshConnectionId(lineInfo.to)
  const componentKey = fromId + '-' + toId

  const onVisibleChange = (visible: boolean) => {
    !visible && setClickedComponentKey(null)
  }

  return (
    <Xarrow
      key={componentKey}
      start={fromId}
      end={toId}
      dashness={isWired ? false : { strokeLen: 5, nonStrokeLen: 1 }}
      SVGcanvasStyle={{ cursor: 'pointer' }}
      showHead={false}
      curveness={0}
      lineColor={getColorForLine(lineInfo)}
      startAnchor={{ position: 'bottom', offset: { y: -5 } }}
      endAnchor={{ position: 'bottom', offset: { y: -5 } }}
      strokeWidth={clickedComponentKey === componentKey ? 4 : 2}
      labels={clickedComponentKey === componentKey
        ? <ApMeshConnectionTooltip data={lineInfo} onVisibleChange={onVisibleChange} />
        : undefined
      }
      arrowBodyProps={{ onClick: () => {
        setClickedComponentKey(componentKey)
      } }}
    />
  )
}

export function genApMeshConnectionId (deviceId: string) {
  return 'ap-' + deviceId
}
