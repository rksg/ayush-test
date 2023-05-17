import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

import WiredTabs from './WiredTabs'

function WiredPageHeader () {
  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t({ defaultMessage: 'Wired Network Profiles' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Wired' }), link: '/networks/wired/profiles' }
      ]}
      footer={<WiredTabs />}
    />
  )
}

export default WiredPageHeader
