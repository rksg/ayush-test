import {
  MobileOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  WindowsOutlined,
  GoogleOutlined
} from '@ant-design/icons'
import { useIntl } from 'react-intl'

import * as UI from '../styledComponents'
export default function PortalViewSelfSignConnect () {
  const { $t } = useIntl()

  return (
    <UI.ViewSection>
      <UI.FieldText>{$t({ defaultMessage: 'Connect With:' })}</UI.FieldText>
      <UI.ViewSectionSocial $type='sms'>
        <UI.ViewSectionSocialIcon>
          <MobileOutlined></MobileOutlined>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {$t({ defaultMessage: 'Connect with SMS' })}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>
      <UI.ViewSectionSocial $type='facebook'>
        <UI.ViewSectionSocialIcon>
          <FacebookOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {$t({ defaultMessage: 'Connect with Facebook' })}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>
      <UI.ViewSectionSocial $type='microsoft'>
        <UI.ViewSectionSocialIcon>
          <WindowsOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {$t({ defaultMessage: 'Connect with Microsoft' })}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>
      <UI.ViewSectionSocial $type='twitter'>
        <UI.ViewSectionSocialIcon>
          <TwitterOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {$t({ defaultMessage: 'Connect with Twitter' })}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>
      <UI.ViewSectionSocial $type='google'>
        <UI.ViewSectionSocialIcon>
          <GoogleOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {$t({ defaultMessage: 'Connect with Google' })}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>
      <UI.ViewSectionSocial $type='linked'>
        <UI.ViewSectionSocialIcon>
          <LinkedinOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {$t({ defaultMessage: 'Connect with LinkedIn' })}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>
      <UI.ViewSectionText>{$t({ defaultMessage: 'Your email address may be saved by '+
      'the network provider' })}</UI.ViewSectionText>
    </UI.ViewSection>

  )
}

