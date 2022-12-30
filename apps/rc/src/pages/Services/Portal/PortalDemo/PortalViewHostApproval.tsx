import { Demo } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import PortalButtonContent from './PortalContent/PortalButtonContent'
export default function PortalViewHostApproval (props:{
  portalLang: { [key:string]:string },
  demoValue: Demo,
  isPreview?:boolean,
  updateBtn?: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void
}) {
  const { demoValue, updateBtn, isPreview, portalLang } = props
  return (
    <UI.ViewSectionNoBorder>
      <UI.ViewSectionTabsBig
        defaultActiveKey='register'
        type='card'
        size={'middle'}
      >
        <UI.ViewSectionTabsBig.TabPane tab={portalLang.register} key='register'>
          <UI.FieldText style={{ marginLeft: 5 }}>
            {portalLang.registerPageNote}
          </UI.FieldText>
          <UI.ViewSectionSpan>*</UI.ViewSectionSpan><UI.ViewSectionUserOutlined/><UI.FieldInputSmall
            placeholder={portalLang.name}></UI.FieldInputSmall><br/>
          <UI.ViewSectionSpan>*</UI.ViewSectionSpan>
          <UI.ViewSectionMobileOutlined/><UI.FieldInputSmall
            placeholder={portalLang.mobilePhone}></UI.FieldInputSmall>
          <UI.ViewSectionText>
            {portalLang.selfSignMobilePhoneNote}
          </UI.ViewSectionText>
          <UI.ViewSectionSpan>*</UI.ViewSectionSpan><UI.ViewSectionMailOutlined/><UI.FieldInputSmall
            placeholder={portalLang.hostEmail}></UI.FieldInputSmall>
          <UI.ViewSectionText>
            {portalLang.hostEmailNote}
          </UI.ViewSectionText>
          <UI.ViewSectionEditOutlined/><UI.FieldInputSmall
            placeholder={portalLang.hostNoteBlankText}>
          </UI.FieldInputSmall>
          <UI.ViewSectionText>{
            portalLang.hostNoteHint}</UI.ViewSectionText>
          <PortalButtonContent
            demoValue={demoValue}
            isPreview={isPreview}
            updateButton={(data)=>updateBtn?.(data)}
          >{portalLang.register}</PortalButtonContent>

        </UI.ViewSectionTabsBig.TabPane>
        <UI.ViewSectionTabsBig.TabPane tab={portalLang.login} key='login'>
          <UI.FieldText>{portalLang.loginNote}</UI.FieldText>
          <UI.FieldInput></UI.FieldInput>
          <UI.ViewSectionLink>
            {portalLang.forgotPswdLink}</UI.ViewSectionLink>
          <PortalButtonContent
            demoValue={demoValue}
            isPreview={isPreview}
            updateButton={(data)=>updateBtn?.(data)}
          >{portalLang.connectToWifi}</PortalButtonContent>
        </UI.ViewSectionTabsBig.TabPane>
      </UI.ViewSectionTabsBig>
    </UI.ViewSectionNoBorder>

  )
}

