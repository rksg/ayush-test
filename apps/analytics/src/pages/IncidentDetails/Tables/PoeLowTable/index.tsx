import React, { useMemo, useState } from 'react'

import moment                     from 'moment'
import { useIntl, defineMessage } from 'react-intl'

import { noDataSymbol }              from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table } from '@acx-ui/components'
import { useTenantLink, Link }       from '@acx-ui/react-router-dom'

import { ImpactedTableProps, defaultSort } from '../utils'

import poeApPwrModeEnumMap                      from './poeApPwrModeEnumMap.json'
import poeCurPwrSrcEnumMap                      from './poeCurPwrSrcEnumMap.json'
import { ImpactedAP, useImpactedEntitiesQuery } from './services'

type PoeLowTableFields = {
  name: string
  mac: string
  configured: string
  operating: string
  eventTime: number
  apGroup: string
}

export const PoeLowTable: React.FC<ImpactedTableProps> = (props) => {
  const intl = useIntl()
  const { $t } = intl
  const [ search ] = useState('')

  const queryResults = useImpactedEntitiesQuery({
    id: props.incident.id,
    search,
    n: 100
  },{ selectFromResult: (states) => ({
    ...states
  }) })
  const basePath = useTenantLink('/analytics/incidents/')

  const json2keymap = (keyFields: string[], field: string, filter: string[]) =>
    (...mappings: any[]) => mappings
    // (...mappings: Array<{id: number, code: string, text: string}>[]) => mappings
      .flatMap(items => items)
      .filter(item => !filter.includes(item[field]))
      .reduce((map, item) => map.set(
        keyFields.map(keyField => item[keyField]).join('-'),
        item[field]
      ), new Map())

  const pwrModeMap = json2keymap(['code'], 'text', [''])(poeApPwrModeEnumMap)
  const pwrSrcMap = json2keymap(['code'], 'text', [''])(poeCurPwrSrcEnumMap)

  const convertData = (data: ImpactedAP[]) => (
    data.map(datum => {
      const configured = datum.poeMode.configured
      const operating = datum.poeMode.operating
      return {
        name: data[0].name,
        mac: data[0].mac,
        configured: pwrModeMap.get(configured),
        operating: pwrSrcMap.get(operating),
        eventTime: datum.poeMode.eventTime,
        apGroup: datum.poeMode.apGroup
      }
    })
  )

  const columnHeaders: TableProps<PoeLowTableFields>['columns'] = useMemo(() => [
    {
      title: $t(defineMessage({ defaultMessage: 'AP Name' })),
      width: 200,
      dataIndex: 'name',
      key: 'name',
      render: (_, value) => {
        return <Link to={{ ...basePath, pathname: `${basePath.pathname}` }}>
          {value.name}
        </Link>
      },
      sorter: {
        compare: (a, b) => defaultSort(a.name, b.name)
      },
      defaultSortOrder: 'descend',
      fixed: 'left',
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'MAC Address' })),
      width: 120,
      dataIndex: 'mac',
      key: 'mac',
      sorter: {
        compare: (a, b) => defaultSort(a.mac, b.mac)
      },
      searchable: true
    },
    ...(props.incident.sliceType === 'zone'
      ? [{
        title: $t(defineMessage({ defaultMessage: 'AP Group' })),
        width: 110,
        dataIndex: 'apGroup',
        key: 'apGroup',
        sorter: {
          compare: (a: { apGroup: string }, b: { apGroup: string } ) =>
            defaultSort(a.apGroup as string, b.apGroup as string)
        },
        searchable: true
      }]
      : []),
    {
      title: $t(defineMessage({ defaultMessage: 'Configured PoE Mode' })),
      width: 120,
      dataIndex: 'configured',
      key: 'configured',
      sorter: {
        compare: (a, b) => defaultSort(a.configured, b.configured)
      },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Operating PoE Mode' })),
      width: 120,
      dataIndex: 'operating',
      key: 'operating',
      sorter: {
        compare: (a, b) => defaultSort(a.operating, b.operating)
      },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Event Time' })),
      width: 130,
      dataIndex: 'eventTime',
      key: 'eventTime',
      render: (_, value) => moment(value.eventTime).format('MMMM DD YYYY HH:mm'),
      sorter: {
        compare: (a, b) => defaultSort(a.eventTime, b.eventTime)
      }
    }
  ], [])

  return (
    <Loader states={[queryResults]}>
      <Table
        type='tall'
        dataSource={convertData(queryResults.data!)}
        columns={columnHeaders}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataSymbol}
        indentSize={6}
      />
    </Loader>
  )
}

export default PoeLowTable
