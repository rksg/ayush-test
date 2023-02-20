import * as UI from '../styledComponents'
export default function PortalViewSelfSignConnect (props:{
  portalLang: { [key:string]:string },
  networkSocial?:{ [key:string]:boolean }
}) {
  const { networkSocial, portalLang } = props
  return (
    <UI.ViewSection>
      <UI.FieldTextBig>{portalLang.connectWith}</UI.FieldTextBig>
      {(!networkSocial || networkSocial.smsEnabled) &&
      <UI.ViewSectionSocial $type='sms'>
        <UI.ViewSectionSocialIcon>
          <UI.SMSMobileOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {portalLang.connectWithSMS}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>}
      {(!networkSocial || networkSocial.facebookEnabled) &&
      <UI.ViewSectionSocial $type='facebook'>
        <UI.ViewSectionSocialIcon>
          <UI.FacebookOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {portalLang.connectWithFacebook}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>}
      {(!networkSocial || networkSocial.googleEnabled) &&
      <UI.ViewSectionSocial $type='google'>
        <UI.ViewSectionSocialIcon>
          <UI.GoogleOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {portalLang.connectWithGoogle}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>}
      {(!networkSocial || networkSocial.twitterEnabled) &&
      <UI.ViewSectionSocial $type='twitter'>
        <UI.ViewSectionSocialIcon>
          <UI.TwitterOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {portalLang.connectWithTwitter}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>}
      {(!networkSocial || networkSocial.linkedInEnabled) &&
      <UI.ViewSectionSocial $type='linked'>
        <UI.ViewSectionSocialIcon>
          <UI.LinkedinOutlined/>
        </UI.ViewSectionSocialIcon>
        <UI.ViewSectionSocialText>
          {portalLang.connectWithLinkedIn}</UI.ViewSectionSocialText>
      </UI.ViewSectionSocial>}
      <UI.ViewSectionText style={{ textAlign: 'center', marginLeft: 0 }}>
        {portalLang.socialEmailsCollection}</UI.ViewSectionText>
    </UI.ViewSection>

  )
}

