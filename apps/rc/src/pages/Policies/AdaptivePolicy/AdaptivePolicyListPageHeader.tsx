import { useIntl } from 'react-intl'

import { PageHeader }             from '@acx-ui/components'
import { getPolicyListRoutePath } from '@acx-ui/rc/utils'

import AdaptivePolicyTabs from './AdaptivePolicyTabs'

function AdaptivePolicyListPageHeader () {
  const { $t } = useIntl()
  return (
    <PageHeader
      breadcrumb={
        [
          { text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true) }
        ]}
      title={$t({ defaultMessage: 'Adaptive Policy' })}
      footer={<AdaptivePolicyTabs />}
    />
  )
}

export default AdaptivePolicyListPageHeader
