import * as UI from '../styledComponents'
export default function PortalViewConfirm (props:{
  portalLang: { [key:string]:string }
}) {
  return (
    <UI.ViewSection>
      <UI.ViewSectionTitle>
        {props.portalLang.connected || 'You are now connected to Wi-Fi'}</UI.ViewSectionTitle>
      <UI.FieldTextMiddle>
        {props.portalLang.redirected || 'You will be redirected in 5 seconds...'}
      </UI.FieldTextMiddle>
    </UI.ViewSection>

  )
}

