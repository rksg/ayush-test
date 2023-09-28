import { Demo } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import PortalButtonContent from './PortalContent/PortalButtonContent'
export default function PortalViewSelfSignRegister (props:{
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
          <UI.FieldTextMiddle style={{ marginLeft: 5 }}>
            {portalLang.registerPageNote}
          </UI.FieldTextMiddle>
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
          <UI.ViewSectionText>{portalLang.email}</UI.ViewSectionText>
          <UI.ViewDivInput><UI.ViewSectionMailOutlined/><UI.FieldInputSmall>
          </UI.FieldInputSmall></UI.ViewDivInput>
          <PortalButtonContent
            isPreview={isPreview}
            demoValue={demoValue}
            updateButton={(data)=>updateBtn?.(data)}
          >{portalLang.register}</PortalButtonContent>
          <UI.ViewSectionText style={{ marginLeft: 0, textAlign: 'center' }}>{
            portalLang.acceptTermsMsgHostSelfSign?.replace('{0}','')
          }&nbsp;
          <UI.FieldLabelLink>
            {portalLang.acceptTermsLink}
          </UI.FieldLabelLink></UI.ViewSectionText>
        </UI.ViewSectionTabs.TabPane>
        <UI.ViewSectionTabs.TabPane tab={portalLang.login} key='login'>
          <UI.FieldTextMiddle>{portalLang.loginNote}</UI.FieldTextMiddle>
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
      <UI.FieldTextLink>{portalLang.back}</UI.FieldTextLink>
    </UI.ViewSectionNoBorder>

  )
}

