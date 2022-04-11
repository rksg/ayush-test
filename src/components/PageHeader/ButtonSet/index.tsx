import React   from 'react'
import * as UI from './styledComponents'

export function ButtonSet (
  props: { buttons: React.ReactNode[] }
) {
  return <UI.ButtonSet>
    {props.buttons.map((button, i) => <UI.ButtonWrapper children={button} key={i} />)}
  </UI.ButtonSet>
}
