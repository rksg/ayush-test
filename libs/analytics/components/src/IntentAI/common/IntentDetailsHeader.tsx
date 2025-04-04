import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

export const IntentDetailsHeader = () => {
  const { $t } = useIntl()

  return <PageHeader
    title={$t({ defaultMessage: 'Intent Details' })}
    breadcrumb={[
      { text: $t({ defaultMessage: 'AI Assurance' }) },
      { text: $t({ defaultMessage: 'AI Analytics' }) },
      { text: $t({ defaultMessage: 'Intent AI' }), link: 'analytics/intentAI' }
    ]}
    // extra={hasPermission({ permission: 'WRITE_INTENT_AI', scopes: [WifiScopes.UPDATE] })
    //   ? [] // TODO: Action buttom
    //   : []
    // }
  />
}
