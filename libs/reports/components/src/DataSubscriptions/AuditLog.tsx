import { useIntl } from 'react-intl'

import { GridRow, GridCol, PageHeader, Button } from '@acx-ui/components'
import { DownloadOutlined }                     from '@acx-ui/icons'

import { generateBreadcrumb } from './utils'

const DataSubscriptionsAuditLog: React.FC = () => {
  const { $t } = useIntl()
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Data Subscriptions AuditLog' })}
        breadcrumb={generateBreadcrumb()}
        extra={
          <Button
            size='middle'
            icon={<DownloadOutlined/>}
            type='default'
          >{$t({ defaultMessage: 'Download Audit' })}</Button>}
      />
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>

        </GridCol>
      </GridRow>
    </>
  )
}

export default DataSubscriptionsAuditLog