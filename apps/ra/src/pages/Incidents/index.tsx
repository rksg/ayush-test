import { useIntl } from 'react-intl'

import { Loader } from '@acx-ui/components'
import { get }    from '@acx-ui/config'

import * as UI from './styledComponents'

function Analytics () {
  const { $t } = useIntl()
  return <Loader>
    <UI.DummyWrapper>
      {$t({ defaultMessage: 'doc url: {env}' }, { env: get('MLISA_DOCUMENTATION_URL') })}
    </UI.DummyWrapper>
  </Loader>
}

export default Analytics
