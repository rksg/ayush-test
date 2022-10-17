import { useIntl } from 'react-intl'


import * as UI from '../styledComponents'
export default function PortalViewGoThrough () {
  const { $t } = useIntl()

  return (
    <UI.PortalButton>{$t({ defaultMessage: 'Connect To Wi-Fi' })}</UI.PortalButton>
  )
}

