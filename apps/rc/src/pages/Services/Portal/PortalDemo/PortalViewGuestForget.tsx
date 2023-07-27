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
      <UI.FieldTextBig>{portalLang.forgotPswdNote}</UI.FieldTextBig>
      <UI.ViewSectionTabs
        defaultActiveKey='text'
        type='card'
        size={'middle'}
      >
        <UI.ViewSectionTabs.TabPane tab={portalLang.forgotPswdText} key='text'>
          <UI.FieldTextMiddle style={{ textAlign: 'left', padding: '0 50px 0 50px' }}>
            {portalLang.forgotPswdTextDesc}</UI.FieldTextMiddle>
          <UI.FieldInput
            disabled={true}
            placeholder={portalLang.mobilePhone}
          ></UI.FieldInput>
          <PortalButtonContent
            demoValue={demoValue}
            isPreview={isPreview}
            updateButton={(data) => updateBtn?.(data)}
          >{portalLang.sendPswd}</PortalButtonContent>
        </UI.ViewSectionTabs.TabPane>
        <UI.ViewSectionTabs.TabPane tab={portalLang.forgotPswdEmail} key='email'>
          <UI.FieldTextMiddle style={{ textAlign: 'left', padding: '0 50px 0 50px' }}>
            {portalLang.forgotPswdEmailDesc}</UI.FieldTextMiddle>
          <UI.FieldInput
            disabled={true}
            placeholder={portalLang.email}></UI.FieldInput>
          <PortalButtonContent
            demoValue={demoValue}
            isPreview={isPreview}
            updateButton={(data) => updateBtn?.(data)}
          >{portalLang.sendPswd}</PortalButtonContent>
        </UI.ViewSectionTabs.TabPane>
        <UI.ViewSectionTabs.TabPane tab={portalLang.forgotPswOther} key='other'>
          <UI.FieldTextMiddle style={{ textAlign: 'left', padding: '0 20px 0 20px' }}>
            {portalLang.forgotPswOtherDesc}</UI.FieldTextMiddle>
        </UI.ViewSectionTabs.TabPane>
      </UI.ViewSectionTabs>
      <UI.FieldTextLink>{portalLang.back}</UI.FieldTextLink>
    </UI.ViewSection>

  )
}

