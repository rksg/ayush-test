import { useMemo } from 'react'

import { useIntl, defineMessage }                from 'react-intl'

import { Loader, TableProps, Table  }              from '@acx-ui/components'
import { ServiceGuardSpec, useNetworkHealthQuery } from './services'

export function NetworkHealthTable () {
  const intl = useIntl()
  const { $t } = intl
  const queryResults = useNetworkHealthQuery({})

  console.log('queryResults', queryResults)

  const ColumnHeaders: TableProps<ServiceGuardSpec>['columns'] = useMemo(() => [
    {
      key: 'testName',
      title: $t(defineMessage({ defaultMessage: 'Test Name' })),
      width: 120,
      dataIndex: 'testName'
    },
    {
      key: 'clientType',
      title: $t(defineMessage({ defaultMessage: 'Client Type' })),
      dataIndex: 'clientType'
    },
    {
      key: 'testType',
      title: $t(defineMessage({ defaultMessage: 'Test Type' })),
      dataIndex: 'testType'
    },
    {
      key: 'aps',
      title: $t(defineMessage({ defaultMessage: 'APs' })),
      dataIndex: 'aps'
    },
    {
      key: 'lastRun',
      title: $t(defineMessage({ defaultMessage: 'Last Run' })),
      dataIndex: 'lastRun',
    },
    {
      key: 'apsUnderTest',
      title: $t(defineMessage({ defaultMessage: 'APs Under Test' })),
      dataIndex: 'apsUnderTest',
    },
    {
      key: 'lastResult',
      title: $t(defineMessage({ defaultMessage: 'Last Result' })),
      dataIndex: 'lastResult',
    },
  ], [])

  return (
    <Loader states={[queryResults]}>
      <Table
        type='tall'
        columns={ColumnHeaders}
        dataSource={queryResults.data}
        rowKey='id'
      />
    </Loader>
  )
}
