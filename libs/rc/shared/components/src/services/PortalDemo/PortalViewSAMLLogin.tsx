import { Demo } from '@acx-ui/rc/utils'

import PortalButtonContent from './PortalContent/PortalButtonContent'
import * as UI             from './styledComponents'

export default function PortalViewSAMLLogin (props:{
  demoValue: Demo,
  isPreview?:boolean,
  updateBtn?: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void,
  portalLang: { [key:string]:string }
}) {
  const { demoValue, updateBtn, isPreview, portalLang } = props
  return (
    <UI.ViewSection>
      <UI.FieldTextBig>{portalLang.connectWith}</UI.FieldTextBig>
      <PortalButtonContent
        demoValue={demoValue}
        isPreview={isPreview}
        updateButton={(data)=>updateBtn?.(data)}
      >{portalLang.ConnectWithSSO}</PortalButtonContent>
      <UI.FieldTextMiddle>
        {portalLang.SSOHint}
      </UI.FieldTextMiddle>
    </UI.ViewSection>
  )
}
