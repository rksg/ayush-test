import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

export default function ClientList () {
  const { $t } = useIntl()

  return <>
    <PageHeader title={$t({ defaultMessage: 'Switch' })} />
    {/* TODO: Switch Client list */}
  </>
}