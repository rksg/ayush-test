import { Demo } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import PortalButtonContent from './PortalContent/PortalButtonContent'
export default function PortalViewGuestForget (props: {
  portalLang: { [key:string]:string },
  demoValue: Demo,
  isPreview?: boolean,
  updateBtn?: (value: {
    url?: string, size?: number, show?: boolean,
    color?: string, text?: string
  }) => void
}) {
  const { demoValue, updateBtn, isPreview, portalLang } = props
  return (
    <UI.ViewSection>
      <UI.ViewSectionTitle>{portalLang.forgotPswdLink}</UI.ViewSectionTitle>
      <UI.FieldText>{portalLang.forgotPswdNote}</UI.FieldText>
      <UI.ViewSectionTabs
        defaultActiveKey='text'
        type='card'
        size={'middle'}
      >
        <UI.ViewSectionTabs.TabPane tab={portalLang.forgotPswdText} key='text'>
          <UI.FieldText style={{ textAlign: 'left', padding: '0 50px 0 50px' }}>
            {portalLang.forgotPswdTextDesc}</UI.FieldText>
          <UI.FieldInput
            placeholder={portalLang.mobilePhone}></UI.FieldInput>
          <PortalButtonContent
            demoValue={demoValue}
            isPreview={isPreview}
            updateButton={(data) => updateBtn?.(data)}
          >{portalLang.sendPswd}</PortalButtonContent>
        </UI.ViewSectionTabs.TabPane>
        <UI.ViewSectionTabs.TabPane tab={portalLang.forgotPswdEmail} key='email'>
          <UI.FieldText style={{ textAlign: 'left', padding: '0 50px 0 50px' }}>
            {portalLang.forgotPswdEmailDesc}</UI.FieldText>
          <UI.FieldInput
            placeholder={portalLang.email}></UI.FieldInput>
          <PortalButtonContent
            demoValue={demoValue}
            isPreview={isPreview}
            updateButton={(data) => updateBtn?.(data)}
          >{portalLang.sendPswd}</PortalButtonContent>
        </UI.ViewSectionTabs.TabPane>
        <UI.ViewSectionTabs.TabPane tab={portalLang.forgotPswOther} key='other'>
          <UI.FieldText style={{ textAlign: 'left', padding: '0 20px 0 20px' }}>
            {portalLang.forgotPswOtherDesc}</UI.FieldText>
        </UI.ViewSectionTabs.TabPane>
      </UI.ViewSectionTabs>
      <UI.FieldTextLink>{portalLang.back}</UI.FieldTextLink>
    </UI.ViewSection>

  )
}

