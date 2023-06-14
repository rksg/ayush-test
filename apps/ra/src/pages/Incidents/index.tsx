import { useIntl } from 'react-intl'

import { useUserProfileContext } from '@acx-ui/analytics/utils'
import { Loader }                from '@acx-ui/components'

import * as UI from './styledComponents'

function Analytics () {
  const { $t } = useIntl()

  const { data } = useUserProfileContext()
  return <Loader>
    <UI.DummyWrapper>
      {$t(
        { defaultMessage: 'profile loaded for the user: {user}' },
        { user: `${data?.firstName}  ${data?.lastName}` }
      )}
    </UI.DummyWrapper>
  </Loader>
}

export default Analytics
