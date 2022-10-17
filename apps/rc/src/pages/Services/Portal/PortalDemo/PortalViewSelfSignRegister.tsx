import { useIntl } from 'react-intl'

import * as UI from '../styledComponents'
export default function PortalViewSelfSignRegister () {
  const { $t } = useIntl()

  return (
    <UI.ViewSection>
      <UI.ViewSectionTabsBig
        defaultActiveKey='register'
        type='card'
        size={'middle'}
      >
        <UI.ViewSectionTabsBig.TabPane tab={$t({ defaultMessage: 'Register' })} key='register'>
          <UI.FieldText style={{ marginLeft: 5 }}>
            {$t({ defaultMessage: 'Enter your details to receive your password' })}
          </UI.FieldText>
          <UI.ViewSectionSpan>*</UI.ViewSectionSpan><UI.ViewSectionUserOutlined/><UI.FieldInputSmall
            placeholder={$t({ defaultMessage: 'Your Name' })}></UI.FieldInputSmall><br/>
          <UI.ViewSectionSpan>*</UI.ViewSectionSpan>
          <UI.ViewSectionMobileOutlined/><UI.FieldInputSmall
            placeholder={$t({ defaultMessage: 'Mobile Phone Number' })}></UI.FieldInputSmall>
          <UI.ViewSectionText style={{ marginLeft: -56 }}>
            {$t({ defaultMessage: 'Your password will be sent to this number' })}
          </UI.ViewSectionText>
          <UI.ViewSectionMailOutlined/><UI.FieldInputSmall
            placeholder={$t({ defaultMessage: 'Your Email' })}></UI.FieldInputSmall>
          <UI.PortalButton>{$t({ defaultMessage: 'Register' })}</UI.PortalButton>
          <UI.ViewSectionText style={{ marginLeft: 68, display: 'flex' }}>{$t({
            defaultMessage: 'By registering, you are accepting the'
          })}&nbsp;&nbsp;
          <UI.FieldTextLink>
            {$t({ defaultMessage: 'terms & conditions' })}
          </UI.FieldTextLink></UI.ViewSectionText>
        </UI.ViewSectionTabsBig.TabPane>
        <UI.ViewSectionTabsBig.TabPane tab={$t({ defaultMessage: 'Login' })} key='login'>
          <UI.FieldText>{$t({ defaultMessage: 'Enter your password to connect' })}</UI.FieldText>
          <UI.FieldInput></UI.FieldInput>
          <UI.ViewSectionLink>
            {$t({ defaultMessage: 'Forgot your password?' })}</UI.ViewSectionLink>
          <UI.PortalButton>{$t({ defaultMessage: 'Connect To Wi-Fi' })}</UI.PortalButton>
        </UI.ViewSectionTabsBig.TabPane>
      </UI.ViewSectionTabsBig>
      <UI.FieldTextLink>{$t({ defaultMessage: 'Back' })}</UI.FieldTextLink>
    </UI.ViewSection>

  )
}

