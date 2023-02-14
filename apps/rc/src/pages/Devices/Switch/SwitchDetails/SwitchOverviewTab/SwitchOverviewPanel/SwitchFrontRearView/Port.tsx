import * as UI             from './styledComponents'

export function Port (props:{
  // slot: any, 
  labelText: string,
  labelPosition: 'top' | 'bottom',
}) {
  const { labelText, labelPosition } = props

  return <UI.PortWrapper>
  { labelPosition === 'top' && <UI.PortLabel>{labelText}</UI.PortLabel> }
  <UI.Port />
  { labelPosition === 'bottom' && <UI.PortLabel>{labelText}</UI.PortLabel> }
  </UI.PortWrapper>
}