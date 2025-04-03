import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import { GridRow, GridCol, Banner, Button, PageHeader, Loader, DisabledButton } from '@acx-ui/components'
import { get }                                                                  from '@acx-ui/config'
import { SettingsOutlined }                                                     from '@acx-ui/icons'
import { useRaiR1HelpPageLink }                                                 from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                           from '@acx-ui/react-router-dom'
import { RolesEnum }                                                            from '@acx-ui/types'
import { hasRaiPermission, hasRoles }                                           from '@acx-ui/user'

import { StorageOptions }     from './CloudStorageForm'
import { QuotaUsageBar }      from './QuotaUsageBar'
import { useGetStorageQuery } from './services'
import * as UI                from './styledComponents'
import { DataConnectorTable } from './Table'

const DataConnectorContent: React.FC<{}> = () => {
  const { $t } = useIntl()
  const helpUrl = useRaiR1HelpPageLink()
  const navigate = useNavigate()
  const basePath = useTenantLink('/dataConnector')
  const { data: storage, isLoading: isStorageLoading } = useGetStorageQuery({})
  const StorageLabel = StorageOptions.find(
    (option) => option.value === storage?.config?.connectionType
  )?.label
  const hasDCStoragePermission = get('IS_MLISA_SA')
    ? hasRaiPermission('WRITE_DATA_CONNECTOR_STORAGE')
    : hasRoles(RolesEnum.PRIME_ADMIN)
  const hasDCPermission = get('IS_MLISA_SA')
    ? hasRaiPermission('WRITE_DATA_CONNECTOR')
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const headerButtons = []
  if (hasDCPermission) {
    headerButtons.push(
      storage?.id
        ? <Button
          key='new-connector-button'
          type='primary'
          onClick={() => navigate({
            ...basePath,
            pathname: `${basePath.pathname}/create`
          })}
        >
          {$t({ defaultMessage: 'New Connector' })}
        </Button>
        : <DisabledButton
          key='disabled-new-connector-button'
          title={$t(
            { defaultMessage: 'Cloud storage needs to be configured first, by prime admin.' }
          )}
          size='middle'
        >
          {$t({ defaultMessage: 'New Connector' })}
        </DisabledButton>
    )
  }
  if (hasDCStoragePermission) {
    headerButtons.push(
      <Tooltip title={storage?.error}>
        <Button
          key='cloud-storage-button'
          size='middle'
          icon={<SettingsOutlined />}
          type='default'
          onClick={() => navigate({
            ...basePath,
            pathname: storage?.id
              ? `${basePath.pathname}/cloudStorage/edit/${storage.id}`
              : `${basePath.pathname}/cloudStorage/create`
          })}
        >
          {storage?.config
            ? $t(
              { defaultMessage: 'Cloud Storage: {connectionType}' },
              { connectionType: StorageLabel }
            )
            : $t({ defaultMessage: 'New Cloud Storage' })}
          {storage != null && (
            storage.isConnected
              ? <UI.ConnectedDot data-testid='connected-dot' />
              : <UI.DisconnectedDot data-testid='disconnected-dot' />
          )}
        </Button>
      </Tooltip>
    )
  }

  return (<>
    <PageHeader
      title={$t({ defaultMessage: 'Data Connector' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Business Insights' }) }]}
      extra={headerButtons.length > 0
        ? <Loader
          states={[{ isLoading: isStorageLoading }]}
          style={{ flexDirection: 'row', gap: '10px' }}>
          {headerButtons}
        </Loader>
        : []}
    />
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <Banner
          title={$t({ defaultMessage: 'Simplify Data Integration' })}
          subTitles={[$t({
            defaultMessage: `Seamlessly transfer data between RUCKUS AI
            and cloud platforms, monitor usage with precision, `
          }), $t({ defaultMessage: 'and customize exports for enhanced business insights.' })]}
          helpUrl={helpUrl}
          disabled />
        <QuotaUsageBar />
      </GridCol>
    </GridRow>
    <DataConnectorTable />
  </>)
}

export default DataConnectorContent