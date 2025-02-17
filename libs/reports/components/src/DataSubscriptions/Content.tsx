import React from 'react'

import { useIntl } from 'react-intl'

import { GridRow, GridCol, Banner, Button, PageHeader, Loader } from '@acx-ui/components'
import { get }                                                  from '@acx-ui/config'
import { SettingsOutlined }                                     from '@acx-ui/icons'
import { useRaiR1HelpPageLink }                                 from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                           from '@acx-ui/react-router-dom'
import { RolesEnum }                                            from '@acx-ui/types'
import { hasRaiPermission, hasRoles }                           from '@acx-ui/user'

import { StorageOptions }         from './CloudStorageForm'
import { useGetStorageQuery }     from './services'
import { DataSubscriptionsTable } from './Table'

const DataSubscriptionsContent: React.FC<{}> = () => {
  const { $t } = useIntl()
  const helpUrl = useRaiR1HelpPageLink()
  const navigate = useNavigate()
  const basePath = useTenantLink('/dataSubscriptions')
  const { data: storage, isLoading: isStorageLoading } = useGetStorageQuery({})
  const StorageLabel = StorageOptions.find(
    (option) => option.value === storage?.config?.connectionType
  )?.label
  const hasDCStoragePermission = get('IS_MLISA_SA')
    ? hasRaiPermission('WRITE_DATA_CONNECTOR_STORAGE')
    : hasRoles(RolesEnum.PRIME_ADMIN)
  const hasDCSubscriptionsPermission = get('IS_MLISA_SA')
    ? hasRaiPermission('WRITE_DATA_CONNECTOR')
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const headerButtons = []
  if (hasDCSubscriptionsPermission) {
    headerButtons.push(
      <Button
        type='primary'
        onClick={() => navigate({
          ...basePath,
          pathname: `${basePath.pathname}/create`
        })}
      >
        {$t({ defaultMessage: 'New Subscription' })}
      </Button>
    )
  }
  if (hasDCStoragePermission) {
    headerButtons.push(
      <Loader states={[{ isLoading: isStorageLoading }]}>
        <Button
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
        </Button>
      </Loader>
    )
  }

  return (<>
    <PageHeader
      title={$t({ defaultMessage: 'Data Subscriptions' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Business Insights' }) }]}
      extra={headerButtons}
    />
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: '180px' }}>
        <Banner
          title={$t({ defaultMessage: 'Simplify Data Integration' })}
          subTitles={[$t({
            defaultMessage: `Seamlessly transfer data between RUCKUS AI 
            and cloud platforms, monitor usage with precision, `
          }), $t({ defaultMessage: 'and customize exports for enhanced business insights.' })]}
          helpUrl={helpUrl} />
      </GridCol>
    </GridRow>
    <DataSubscriptionsTable />
  </>)
}

export default DataSubscriptionsContent
