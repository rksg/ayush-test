import { useIntl } from 'react-intl'


import * as UI from '../styledComponents'
export default function PortalViewGuestConnect () {
  const { $t } = useIntl()

  return (
    <UI.ViewSection>
      <UI.FieldText>{$t({ defaultMessage: 'Enter your password to connect' })}</UI.FieldText>
      <UI.FieldInput></UI.FieldInput>
      <UI.ViewSectionLink>
        {$t({ defaultMessage: 'Forgot your password?' })}</UI.ViewSectionLink>
      <UI.PortalButton>{$t({ defaultMessage: 'Connect To Wi-Fi' })}</UI.PortalButton>
    </UI.ViewSection>

  )
}

