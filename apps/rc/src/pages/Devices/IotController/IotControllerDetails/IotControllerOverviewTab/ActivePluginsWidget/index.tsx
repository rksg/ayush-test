import { useIntl } from 'react-intl'

import { Loader , Card } from '@acx-ui/components'


export function ActivePluginsWidget () {
  const { $t } = useIntl()

  return (
    <Loader>
      <Card title={$t({ defaultMessage: 'Active Plugins' })}>
      </Card>
    </Loader>
  )
}
