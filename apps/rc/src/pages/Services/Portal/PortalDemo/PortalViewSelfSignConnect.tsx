import * as UI from '../styledComponents'
export default function PortalViewSelfSignConnect (props:{
  networkSocial?:{ [key:string]:boolean }
}) {
  const { networkSocial } = props
  return (
    <UI.ViewSection>
      <UI.FieldText>{'Connect With:'}</UI.FieldText>
      {(!networkSocial || networkSocial.smsEnabled) &&
      <UI.ViewSectionSocial $type='sms'>
        <UI.ViewSectionSocialIcon>
          <UI.SMSMobileOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {'Connect with SMS'}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>}
      {(!networkSocial || networkSocial.facebookEnabled) &&
      <UI.ViewSectionSocial $type='facebook'>
        <UI.ViewSectionSocialIcon>
          <UI.FacebookOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {'Connect with Facebook'}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>}
      {(!networkSocial || networkSocial.googleEnabled) &&
      <UI.ViewSectionSocial $type='google'>
        <UI.ViewSectionSocialIcon>
          <UI.GoogleOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {'Connect with Google'}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>}
      {(!networkSocial || networkSocial.twitterEnabled) &&
      <UI.ViewSectionSocial $type='twitter'>
        <UI.ViewSectionSocialIcon>
          <UI.TwitterOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {'Connect with Twitter'}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>}
      {(!networkSocial || networkSocial.linkedInEnabled) &&
      <UI.ViewSectionSocial $type='linked'>
        <UI.ViewSectionSocialIcon>
          <UI.LinkedinOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {'Connect with LinkedIn'}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>}
      <UI.ViewSectionText>{'Your email address may be saved by '+
      'the network provider'}</UI.ViewSectionText>
    </UI.ViewSection>

  )
}

