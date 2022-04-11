import React         from 'react'
import { ButtonSet } from '../ButtonSet'
import * as UI       from './styledComponents'

export function FooterWithDivider (
  props: React.PropsWithChildren<{
    extra?: React.ReactNode[]
  }>
) {
  return <UI.Divider>
    {props.children}
    {props.extra && <ButtonSet buttons={props.extra} />}
  </UI.Divider>
}
