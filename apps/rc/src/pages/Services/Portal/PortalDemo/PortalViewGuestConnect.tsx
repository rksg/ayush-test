import { Demo } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import PortalButtonContent from './PortalContent/PortalButtonContent'
export default function PortalViewGuestConnect (props:{
  demoValue: Demo,
  isPreview?:boolean,
  updateBtn?: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void
}) {
  const { demoValue, updateBtn, isPreview } = props
  return (
    <UI.ViewSection>
      <UI.FieldText>{'Enter your password to connect'}</UI.FieldText>
      <UI.FieldInput></UI.FieldInput>
      <UI.ViewSectionLink>
        {'Forgot your password?'}</UI.ViewSectionLink>
      <PortalButtonContent
        demoValue={demoValue}
        isPreview={isPreview}
        updateButton={(data)=>updateBtn?.(data)}
      >{'Connect To Wi-Fi'}</PortalButtonContent>
    </UI.ViewSection>

  )
}

