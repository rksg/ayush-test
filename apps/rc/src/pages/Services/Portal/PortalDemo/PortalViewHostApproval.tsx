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
      <UI.ViewSectionTabs
        defaultActiveKey='register'
        type='card'
        stickyTop={false}
        size={'middle'}
      >
        <UI.ViewSectionTabs.TabPane tab={portalLang.register} key='register'>
          <UI.FieldTextBig style={{ marginLeft: 5 }}>
            {portalLang.registerPageNote}
          </UI.FieldTextBig>
          <UI.ViewSectionText>{portalLang.name}
            <UI.ViewSectionSpan>*</UI.ViewSectionSpan></UI.ViewSectionText>
          <UI.ViewDivInput><UI.ViewSectionUserOutlined/><UI.FieldInputSmall>
          </UI.FieldInputSmall></UI.ViewDivInput>
          <UI.ViewSectionText>{portalLang.mobilePhone}
            <UI.ViewSectionSpan>*</UI.ViewSectionSpan></UI.ViewSectionText>
          <UI.ViewDivInput><UI.ViewSectionMobileOutlined/><UI.FieldInputSmall
            placeholder={'(123) 456-7890'}></UI.FieldInputSmall></UI.ViewDivInput>
          <UI.ViewSectionText style={{ marginBottom: 10, marginTop: -10 }}>
            {portalLang.selfSignMobilePhoneNote}
          </UI.ViewSectionText>
          <UI.ViewSectionText>{portalLang.hostEmail}
            <UI.ViewSectionSpan>*</UI.ViewSectionSpan></UI.ViewSectionText>
          <UI.ViewDivInput><UI.ViewSectionMailOutlined/><UI.FieldInputSmall>
          </UI.FieldInputSmall></UI.ViewDivInput>
          <UI.ViewSectionText style={{ marginBottom: 10, marginTop: -10 }}>
            {portalLang.hostEmailNote}
          </UI.ViewSectionText>
          <UI.ViewSectionText>{portalLang.hostNoteBlankText}</UI.ViewSectionText>
          <UI.ViewDivInput style={{ height: 60 }}><UI.FieldInputSmall>
          </UI.FieldInputSmall></UI.ViewDivInput>
          <UI.ViewSectionText style={{ marginBottom: 10, marginTop: -10 }}>{
            portalLang.hostNoteHint}</UI.ViewSectionText>
          <PortalButtonContent
            demoValue={demoValue}
            isPreview={isPreview}
            updateButton={(data)=>updateBtn?.(data)}
          >{portalLang.register}</PortalButtonContent>

        </UI.ViewSectionTabs.TabPane>
        <UI.ViewSectionTabs.TabPane tab={portalLang.login} key='login'>
          <UI.FieldTextBig>{portalLang.loginNote}</UI.FieldTextBig>
          <UI.FieldInput disabled={true}></UI.FieldInput>
          <UI.ViewSectionLink>
            {portalLang.forgotPswdLink}</UI.ViewSectionLink>
          <PortalButtonContent
            demoValue={demoValue}
            isPreview={isPreview}
            updateButton={(data)=>updateBtn?.(data)}
          >{portalLang.connectToWifi}</PortalButtonContent>
        </UI.ViewSectionTabs.TabPane>
      </UI.ViewSectionTabs>
    </UI.ViewSectionNoBorder>

  )
}

