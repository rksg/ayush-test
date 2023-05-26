import { useIntl } from 'react-intl'

import { Loader } from '@acx-ui/components'

import * as UI from './styledComponents'

function Analytics () {
  const { $t } = useIntl()
  return <Loader>
    <UI.DummyWrapper>
      {$t({ defaultMessage: 'Testing! Hellow from Ruckus Analytics!' })}
    </UI.DummyWrapper>
  </Loader>
}

export default Analytics
