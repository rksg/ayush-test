import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { GridRow, GridCol, PageHeader, Loader } from '@acx-ui/components'

import AuditLogTable                    from './AuditLogTable'
import { useGetDataConnectorByIdQuery } from './services'
import { generateBreadcrumb }           from './utils'

const DataConnectorAuditLog: React.FC = () => {
  const { $t } = useIntl()
  const { settingId } = useParams <{ settingId: string }>()
  const { data: dataConnector, isLoading } = useGetDataConnectorByIdQuery(settingId)

  return (
    <Loader states={[{ isLoading }]}>
      <PageHeader
        title={`${$t({ defaultMessage: 'Audit Log' })} (${dataConnector?.name})`}
        breadcrumb={generateBreadcrumb()}
      />
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
          <AuditLogTable dataConnectorId={String(settingId)} />
        </GridCol>
      </GridRow>
    </Loader>
  )
}

export default DataConnectorAuditLog