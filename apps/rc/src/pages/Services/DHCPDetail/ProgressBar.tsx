
import _ from 'lodash'

import { DivContainer, ProgressContent, ProgressEmptyContent } from './styledComponents'

export default function ProgressBar (props:{ blockNumber?:number, value:number }) {
  const slices = props.blockNumber || 8
  const coloured = Number((slices * props.value)).toFixed(0)
  return (
    <div title={String(props.value)}>
      <DivContainer>
        {_.map(Array(Number(coloured)), (item, index)=>
          (<ProgressContent color={
            props.value > 0.5? '#23AB36' :
              Number(coloured)>1 ? '#EC7100':'#ED1C24'}
          key={index}/>))}
        {_.map(Array((slices-Number(coloured))),
          (item, index)=> (<ProgressEmptyContent key={index}/>))}
      </DivContainer>
    </div>
  )
}

