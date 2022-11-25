import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

import ApTabs from './ApTabs'

function ApPageHeader () {
  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t({ defaultMessage: 'WiFi' })}
      footer={<ApTabs />}
    />
  )
}

export default ApPageHeader