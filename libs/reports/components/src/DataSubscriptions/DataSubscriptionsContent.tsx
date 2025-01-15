import React from 'react'

import { useIntl } from 'react-intl'

import { GridRow, GridCol, Banner, Button, PageHeader } from '@acx-ui/components'
import { SettingsOutlined }                             from '@acx-ui/icons'
import { useRaiR1HelpPageLink }                         from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                   from '@acx-ui/react-router-dom'
import { hasRaiPermission }                             from '@acx-ui/user'

import { generateBreadcrumb } from './utils'

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
      breadcrumb={generateBreadcrumb({ isRAI, isList: true })}
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
            pathname: `${basePath.pathname}/cloudStorage`
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
          helpUrl={helpUrl}
          closable />
      </GridCol>
    </GridRow>
  </>)
}

export default DataSubscriptionsContent