import * as UI from '../styledComponents'
export default function PortalViewConfirm (props:{
  portalLang: { [key:string]:string }
}) {
  return (
    <UI.ViewSection>
      <UI.ViewSectionTitle>
        {props.portalLang.nowConnected || 'You are now connected to Wi-Fi'}</UI.ViewSectionTitle>
      <UI.FieldText>
        {props.portalLang.nowRedirected || 'You will be redirected in 5 seconds...'}</UI.FieldText>
    </UI.ViewSection>

  )
}

