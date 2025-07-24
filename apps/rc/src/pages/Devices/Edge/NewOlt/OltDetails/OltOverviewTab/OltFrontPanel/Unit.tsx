import * as UI from './styledComponents'

import { SlotPort } from './index'


export const Unit = (props: {
    num: number,
    showLabel: boolean,
    data: SlotPort
  }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { num, showLabel, data } = props
  return <UI.UnitWrapper>
    <UI.Unit />
    { showLabel && <UI.UnitTitle>{num}</UI.UnitTitle>}
  </UI.UnitWrapper>
}