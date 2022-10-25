import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
// import { ApTable } from '../../../../components/ApTable'

export function ApsTable () {
  const { $t } = useIntl()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'WiFi' })}
        extra={[
          <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
        ]}
      />
      {/* TODO:  */}
      {/* <ApTable
        rowSelection={{
          type: 'checkbox',
          ...rowSelection(useIntl())
        }}
      /> */}
    </>
  )
}
