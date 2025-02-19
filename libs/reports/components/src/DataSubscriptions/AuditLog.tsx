import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { GridRow, GridCol, PageHeader, Loader } from '@acx-ui/components'

import AuditLogTable                       from './AuditLogTable'
import { useGetDataSubscriptionByIdQuery } from './services'
import { generateBreadcrumb }              from './utils'

const DataSubscriptionsAuditLog: React.FC = () => {
  const { $t } = useIntl()
  const { settingId } = useParams <{ settingId: string }>()
  const { data: dataSubscription, isLoading } = useGetDataSubscriptionByIdQuery(settingId)

  return (
    <Loader states={[{ isLoading }]}>
      <PageHeader
        title={`${$t({ defaultMessage: 'Audit Log' })} (${dataSubscription?.name})`}
        breadcrumb={generateBreadcrumb()}
      />
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
          <AuditLogTable dataSubscriptionId={String(settingId)} />
        </GridCol>
      </GridRow>
    </Loader>
  )
}

export default DataSubscriptionsAuditLog