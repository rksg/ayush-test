
import { useIntl } from 'react-intl'

import * as UI from './styledComponents'


export default function LicenseBar () {
  const { $t } = useIntl()

  return <UI.LicenseContainer>
    <UI.LicenseIconWrapper>
      <UI.LayoutIcon children={<UI.Expired />} />
    </UI.LicenseIconWrapper>
    <UI.TipsWrapper>
      <div>{$t({ defaultMessage: 'License for 20 APs will expire in 25 days' })}</div>
      <UI.ActiveBtn>
        {$t({ defaultMessage: 'ensure service level, Act now' })}
      </UI.ActiveBtn>
    </UI.TipsWrapper>
  </UI.LicenseContainer>
}
