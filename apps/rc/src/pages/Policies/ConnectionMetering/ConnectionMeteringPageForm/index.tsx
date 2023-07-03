import { useIntl } from 'react-intl'

import {
  PageHeader
} from '@acx-ui/components'
import {
  ConnectionMeteringForm,
  ConnectionMeteringFormProps,
  ConnectionMeteringFormMode
} from '@acx-ui/rc/components'
import {
  getPolicyListRoutePath
} from '@acx-ui/rc/utils'

export default function ConnectionMeteringPageForm (props: ConnectionMeteringFormProps) {
  const { $t } = useIntl()
  const { mode } = props
  return (
    <>
      <PageHeader
        breadcrumb={
          [
            { text: $t({ defaultMessage: 'Policies & Profiles' }),
              link: getPolicyListRoutePath(true) }
          ]}
        title={mode === ConnectionMeteringFormMode.CREATE ?
          $t({ defaultMessage: 'Add Data Usage Metering' }):
          $t({ defaultMessage: 'Edit Data Usage Metering' })
        }
      />
      <ConnectionMeteringForm {...props}/>
    </>)
}