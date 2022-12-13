import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

import Tabs from './Tabs'

function Header () {
  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t({ defaultMessage: 'WiFi' })}
      footer={<Tabs />}
    />
  )
}

export default Header