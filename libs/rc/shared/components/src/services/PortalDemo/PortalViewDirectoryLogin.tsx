import { Demo } from '@acx-ui/rc/utils'

import PortalButtonContent from './PortalContent/PortalButtonContent'
import * as UI             from './styledComponents'

export default function PortalViewDirectoryLogin (props:{
  demoValue: Demo,
  isPreview?:boolean,
  updateBtn?: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void,
  portalLang: { [key:string]:string }
}) {
  const { demoValue, updateBtn, isPreview, portalLang } = props
  return (
    <UI.ViewSection>
      <UI.ViewSectionLabel>{portalLang.username}</UI.ViewSectionLabel>
      <UI.FieldInput style={{ marginTop: '0px' }} disabled={true}></UI.FieldInput>
      <UI.ViewSectionLabel>{portalLang.enterYourPswd}</UI.ViewSectionLabel>
      <UI.FieldInput style={{ marginTop: '0px' }} disabled={true}></UI.FieldInput>
      <PortalButtonContent
        demoValue={demoValue}
        isPreview={isPreview}
        updateButton={(data)=>updateBtn?.(data)}
      >{portalLang.connectToWifi}</PortalButtonContent>
    </UI.ViewSection>

  )
}

