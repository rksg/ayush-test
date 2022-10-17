import { useIntl } from 'react-intl'


import * as UI from '../styledComponents'
export default function PortalViewGuestForget () {
  const { $t } = useIntl()

  return (
    <UI.ViewSection>
      <UI.ViewSectionTitle>{$t({ defaultMessage: 'Forget Your Password?' })}</UI.ViewSectionTitle>
      <UI.FieldText>{$t({ defaultMessage: 'Please follow the instructions'+
      ' to receive a new password based on how it was provided to you originally' })}</UI.FieldText>

      <UI.ViewSectionTabs
        defaultActiveKey='text'
        type='card'
        size={'middle'}
      >
        <UI.ViewSectionTabs.TabPane tab={$t({ defaultMessage: 'Text Message' })} key='text'>
          <UI.FieldText style={{ textAlign: 'left', padding: '0 50px 0 50px' }}>
            {$t({ defaultMessage: 'Please enter the mobile phone number where you'+
          ' received the original password to recieve a new one:' })}</UI.FieldText>
          <UI.FieldInput
            placeholder={$t({ defaultMessage: 'Mobile phone number' })}></UI.FieldInput>
          <UI.PortalButton>{$t({ defaultMessage: 'Get Password' })}</UI.PortalButton>
        </UI.ViewSectionTabs.TabPane>
        <UI.ViewSectionTabs.TabPane tab={$t({ defaultMessage: 'Email Message' })} key='email'>
          <UI.FieldText style={{ textAlign: 'left', padding: '0 50px 0 50px' }}>
            {$t({ defaultMessage: 'Please enter the E-mail address where you received'+
          ' the original password to receive a new one:' })}</UI.FieldText>
          <UI.FieldInput
            placeholder={$t({ defaultMessage: 'E-mail address' })}></UI.FieldInput>
          <UI.PortalButton>{$t({ defaultMessage: 'Get Password' })}</UI.PortalButton>
        </UI.ViewSectionTabs.TabPane>
        <UI.ViewSectionTabs.TabPane tab={$t({ defaultMessage: 'Other' })} key='other'>
          <UI.FieldText style={{ textAlign: 'left', padding: '0 20px 0 20px' }}>
            {$t({ defaultMessage: 'If you received a password for this network '+
          'through another channel (printout for example) please request a new code from the '+
          'person that provided it for your use' })}</UI.FieldText>
        </UI.ViewSectionTabs.TabPane>
      </UI.ViewSectionTabs>
      <UI.FieldTextLink>{$t({ defaultMessage: 'Back' })}</UI.FieldTextLink>
    </UI.ViewSection>

  )
}

