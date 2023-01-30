import * as UI from '../styledComponents'
export default function PortalViewConfirm (props:{
  portalLang: { [key:string]:string }
}) {
  return (
    <UI.ViewSection>
      <UI.ViewSectionTitle>
        {props.portalLang.connected}</UI.ViewSectionTitle>
      <UI.FieldTextMiddle>
        {props.portalLang.redirected}
      </UI.FieldTextMiddle>
    </UI.ViewSection>

  )
}

