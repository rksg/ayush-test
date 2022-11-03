import { useIntl } from 'react-intl'


import * as UI from '../styledComponents'
export default function PortalViewConfirm () {
  const { $t } = useIntl()

  return (
    <UI.ViewSection>
      <UI.ViewSectionTitle>
        {$t({ defaultMessage: 'You are now connected to Wi-Fi' })}</UI.ViewSectionTitle>
      <UI.FieldText>
        {$t({ defaultMessage: 'You will be redirected in 5 seconds...' })}</UI.FieldText>
    </UI.ViewSection>

  )
}

