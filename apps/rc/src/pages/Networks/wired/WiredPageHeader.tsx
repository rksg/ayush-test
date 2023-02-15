import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

import WiredTabs from './WiredTabs'


function WiredPageHeader () {
  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t({ defaultMessage: 'Wired Networks' })}
      footer={<WiredTabs />}
    />
  )
}

export default WiredPageHeader
