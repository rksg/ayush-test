import React from 'react'

import { useIntl } from 'react-intl'

import { GridRow, GridCol, Banner, Button, PageHeader } from '@acx-ui/components'
import { SettingsOutlined }                             from '@acx-ui/icons'
import { useRaiR1HelpPageLink }                         from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                   from '@acx-ui/react-router-dom'
import { hasRaiPermission }                             from '@acx-ui/user'

type DataSubscriptionsContentProps = {
  isRAI?: boolean
}

const DataSubscriptionsContent: React.FC<DataSubscriptionsContentProps> = ({ isRAI }) => {
  const { $t } = useIntl()
  const helpUrl = useRaiR1HelpPageLink()
  const navigate = useNavigate()
  const basePath = useTenantLink('/dataSubscriptions')

  return (<>
    <PageHeader
      title={$t({ defaultMessage: 'Data Subscriptions' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Business Insights' }) }]}
      extra={hasRaiPermission('WRITE_DATA_SUBSCRIPTIONS') ? <>
        <Button
          type='primary'
          onClick={() => navigate({
            ...basePath,
            pathname: `${basePath.pathname}/create`
          })}
        >{$t({ defaultMessage: 'New Subscription' })}</Button>
        <Button
          size='middle'
          icon={<SettingsOutlined/>}
          type='default'
          onClick={() => navigate({
            ...basePath,
            // to test new storage route use ${basePath.pathname}/cloudStorage/create
            pathname: `${basePath.pathname}/cloudStorage/edit/storageId`
          })}
        >{$t({ defaultMessage: 'Cloud Storage: Azure' })}</Button>
      </> : []}
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
  </>)
}

export default DataSubscriptionsContent