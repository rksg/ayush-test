import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

function NetworkHealthList () {
  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t({ defaultMessage: 'Network Health' })}
      breadcrumb={[
        {
          text: $t({ defaultMessage: 'Service Validation' }),
          link: '/serviceValidation'
        }
      ]}
    />
  )
}

export default NetworkHealthList
