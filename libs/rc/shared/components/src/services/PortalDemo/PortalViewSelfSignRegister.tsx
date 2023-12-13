/* eslint-disable max-len */
import { Demo } from '@acx-ui/rc/utils'

import PortalButtonContent from './PortalContent/PortalButtonContent'
import * as UI             from './styledComponents'

export default function PortalViewSelfSignRegister (props:{
  portalLang: { [key:string]:string },
  demoValue: Demo,
  isPreview?:boolean,
  updateBtn?: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void
}) {
  const { demoValue, updateBtn, isPreview, portalLang } = props
  const { componentDisplay } = demoValue
  const renderTermsConditionsView = (activeKey:string) => {
    if (componentDisplay.termsConditions && portalLang?.acceptTermsMsg2 && portalLang?.acceptTermsMsgHostApproval) {
      const { acceptTermsMsg2, acceptTermsMsgHostApproval } = portalLang
      let acceptTermsTxt = (activeKey === 'register') ? acceptTermsMsgHostApproval : acceptTermsMsg2
      const acceptTermsMsg = acceptTermsTxt.replace('<1>{{linkText}}</1>','#')
      const linkIndex = acceptTermsMsg.indexOf('#')
      return (<span style={{ display: 'inline-block' }}>
        {(linkIndex !== 0) &&
          <UI.FieldText style={{ display: 'inline' }}>{acceptTermsMsg.substring(0, linkIndex)}&nbsp;</UI.FieldText> }
        <UI.FieldLabelLink>{props.portalLang.acceptTermsLink}</UI.FieldLabelLink>
        {(linkIndex !== acceptTermsMsg.length - 1) &&
          <UI.FieldText style={{ display: 'inline' }}>&nbsp;{acceptTermsMsg.substring(linkIndex +1, acceptTermsMsg.length -1)}</UI.FieldText>}
      </span>)

    }
    return []
  }
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
          <UI.ViewSectionText style={{ marginLeft: 0, textAlign: 'center' }}>
            {renderTermsConditionsView('register')}
          </UI.ViewSectionText>
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
          <UI.ViewSectionText style={{ marginLeft: 0, textAlign: 'center' }}>
            {renderTermsConditionsView('login')}
          </UI.ViewSectionText>
        </UI.ViewSectionTabs.TabPane>
      </UI.ViewSectionTabs>
      <UI.FieldTextLink>{portalLang.back}</UI.FieldTextLink>
    </UI.ViewSectionNoBorder>

  )
}

