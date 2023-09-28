import { useIntl } from 'react-intl'

import {
  GridRow,
  GridCol,
  Card
} from '@acx-ui/components'

import { DashboardStatistics }   from './DashboardStatistics'
import DiskFileSystemUtilization from './DiskFileSystemUtilization'
import TopSystemProcess          from './TopSystemProcess'


export function GatewayOverviewTab () {

  const { $t } = useIntl()


  return (
    <>
      <DashboardStatistics />
      <GridRow style={{ flexGrow: '1', marginTop: '16px' }}>
        <GridCol col={{ span: 12 }} style={{ height: '340px' }}>
          <Card title={$t({ defaultMessage: 'Top System Processes' })}>
            <TopSystemProcess />
          </Card>
        </GridCol>
        <GridCol col={{ span: 12 }} style={{ height: '340px' }}>
          <Card title={$t({ defaultMessage: 'Disk File System Utilization' })}>
            <DiskFileSystemUtilization />
          </Card>
        </GridCol>
      </GridRow>
    </>
  )
}
