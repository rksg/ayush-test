
import _ from 'lodash'

import { DivContainer, HealthContentExcellent, HealthContentModerate, HealthContentPoor, ProgressEmptyContent } from './styledComponents'

export function HealthBar (props:{ blockNumber?:number, value:number }) {
  const slices = props.blockNumber || 8
  const coloured = Math.max(Number((slices * props.value).toFixed(0)),1)

  const HealthBar =
    props.value > 0.5? HealthContentExcellent :
      coloured>0.125*slices ? HealthContentModerate : HealthContentPoor

  return (
    <div title={String(props.value)}>
      <DivContainer>
        {_.map(Array(coloured), (item, index) => <HealthBar key={index}/>)}
        {_.map(Array((slices-coloured)),(item, index)=> (<ProgressEmptyContent key={index}/>))}
      </DivContainer>
    </div>
  )
}

