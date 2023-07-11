import { Demo } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import PortalButtonContent from './PortalContent/PortalButtonContent'
export default function PortalViewGuestConnect (props:{
  demoValue: Demo,
  isPreview?:boolean,
  updateBtn?: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void,
  portalLang: { [key:string]:string }
}) {
  const { demoValue, updateBtn, isPreview, portalLang } = props
  return (
    <UI.ViewSection>
      <UI.FieldTextBig>{portalLang.loginNote}</UI.FieldTextBig>
      <UI.FieldInput disabled={true}></UI.FieldInput>
      <UI.ViewSectionLink>
        {portalLang.forgotPswdLink}</UI.ViewSectionLink>
      <PortalButtonContent
        demoValue={demoValue}
        isPreview={isPreview}
        updateButton={(data)=>updateBtn?.(data)}
      >{portalLang.connectToWifi}</PortalButtonContent>
    </UI.ViewSection>

  )
}

