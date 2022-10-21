import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'

export function SwitchesTable () {
  const { $t } = useIntl()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Switch' })}
        extra={[
          <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
        ]}
      />
      {/* TODO: Switch list */}
    </>
  )
}


