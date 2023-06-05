import { useIntl } from 'react-intl'

import { Loader } from '@acx-ui/components'
import { get }    from '@acx-ui/config'
import { useUserProfileContext } from '@acx-ui/analytics/utils'

import * as UI from './styledComponents'

function Analytics () {
  const { $t } = useIntl()
  
  const { data } = useUserProfileContext()
  return <Loader states={[{ isLoading: !data }]}>
    <UI.DummyWrapper>
      {$t({ defaultMessage: 'user profile loaded: {env}' }, { env: data?.firstName })}
    </UI.DummyWrapper>
  </Loader>
}

export default Analytics
