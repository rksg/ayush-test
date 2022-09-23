
import _ from 'lodash'

import { DivContainer, ProgressContent, ProgressEmptyContent } from './styledComponents'

export default function ProgressBar (props:{ sliceNumber?:number, value:number }) {
  const slices = props.sliceNumber || 5
  const coloured = Number((slices * props.value)).toFixed(0)
  return (
    <DivContainer>
      {_.map(Array(Number(coloured)), (item, index)=> (<ProgressContent key={index}/>))}
      {_.map(Array((slices-Number(coloured))),
        (item, index)=> (<ProgressEmptyContent key={index}/>))}
    </DivContainer>
  )
}

