import { useIntl } from 'react-intl'

import * as UI from '../styledComponents'
export default function PortalViewHostApproval () {
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
          <UI.ViewSectionSpan>*</UI.ViewSectionSpan><UI.ViewSectionMailOutlined/><UI.FieldInputSmall
            placeholder={$t({ defaultMessage: 'Your host\'s Email' })}></UI.FieldInputSmall>
          <UI.ViewSectionText style={{ marginLeft: -8 }}>
            {$t({ defaultMessage: 'Your host will be asked to approve your registration' })}
          </UI.ViewSectionText>
          <UI.ViewSectionEditOutlined/><UI.FieldInputSmall
            placeholder={$t({ defaultMessage: 'Optional: add a short note to your host' })}>
          </UI.FieldInputSmall>
          <UI.ViewSectionText style={{ marginLeft: -94 }}>{$t({
            defaultMessage: 'Maximum length is 200 characters'
          })}</UI.ViewSectionText>
          <UI.PortalButton>{$t({ defaultMessage: 'Register' })}</UI.PortalButton>

        </UI.ViewSectionTabsBig.TabPane>
        <UI.ViewSectionTabsBig.TabPane tab={$t({ defaultMessage: 'Login' })} key='login'>
          <UI.FieldText>{$t({ defaultMessage: 'Enter your password to connect' })}</UI.FieldText>
          <UI.FieldInput></UI.FieldInput>
          <UI.ViewSectionLink>
            {$t({ defaultMessage: 'Forgot your password?' })}</UI.ViewSectionLink>
          <UI.PortalButton>{$t({ defaultMessage: 'Connect To Wi-Fi' })}</UI.PortalButton>
        </UI.ViewSectionTabsBig.TabPane>
      </UI.ViewSectionTabsBig>
    </UI.ViewSection>

  )
}

