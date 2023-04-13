import { useState } from 'react'

import Xarrow from 'react-xarrows'

import MeshConnectionInfo           from '../MeshConnectionInfo'
import { MeshConnectionInfoEntity } from '../MeshConnectionInfo/types'
import { getColorForLine }          from '../MeshConnectionInfo/utils'

export interface MeshConnectionLineProps {
  lineInfo: MeshConnectionInfoEntity
}

export default function MeshConnectionLine (props: MeshConnectionLineProps) {
  const { lineInfo } = props
  const [ clickedComponentKey, setClickedComponentKey ] = useState<string | null>(null)
  const isWired = lineInfo.connectionType === 'Wired'

  const fromId = genApMeshConnectionLineId(lineInfo.from)
  const toId = genApMeshConnectionLineId(lineInfo.to)
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
      startAnchor='bottom'
      endAnchor='bottom'
      strokeWidth={clickedComponentKey === componentKey ? 4 : 2}
      labels={clickedComponentKey === componentKey
        ? <MeshConnectionInfo data={lineInfo} onVisibleChange={onVisibleChange} />
        : undefined
      }
      arrowBodyProps={{ onClick: () => {
        setClickedComponentKey(componentKey)
      } }}
    />
  )
}

export function genApMeshConnectionLineId (deviceId: string) {
  return 'ap-' + deviceId
}
