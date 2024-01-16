
import { isNaN }   from 'lodash'
import { useIntl } from 'react-intl'

import { getDefaultSettings }               from '@acx-ui/analytics/services'
import { defaultSort, sortProp, Settings  } from '@acx-ui/analytics/utils'
import { Table, TableProps, Tooltip }       from '@acx-ui/components'
import { formatter }                        from '@acx-ui/formatter'
import { noDataDisplay }                    from '@acx-ui/utils'

import {
  transformToLspView, transformToPropertyView, Property, Common, Lsp, customSort
} from './helpers'
import {
  Response
} from './services'

const pagination = { pageSize: 10, defaultPageSize: 10 }

export function BrandTable ({ sliceType, slaThreshold, data }:
{ sliceType: string, slaThreshold?: Partial<Settings>, data: Response[] }) {
  const { $t } = useIntl()
  const thresholds = slaThreshold || getDefaultSettings()
  const thresholdP1Incidents = thresholds['sla-p1-incidents-count' as keyof typeof slaThreshold]
  const thresholdGuestExp = thresholds['sla-guest-experience' as keyof typeof slaThreshold]
  const thresholdSSID = thresholds['sla-brand-ssid-compliance' as keyof typeof slaThreshold]
  const pColor = 'var(--acx-accents-blue-50)'
  const nColor = 'var(--acx-semantics-red-50)'
  const noDataColor = 'var(--acx-primary-black)'

  const tableData = sliceType === 'lsp'
    ? transformToLspView(data)
    : transformToPropertyView(data)
  const commonCols: TableProps<Common>['columns'] = [
    {
      title: $t({ defaultMessage: 'P1 Incidents Count' }),
      dataIndex: 'p1Incidents',
      key: 'p1Incidents',
      sorter: { compare: sortProp('p1Incidents', customSort) },
      render: (_, row: Common) =>
        <span
          style={{
            color: row?.p1Incidents <= parseInt(thresholdP1Incidents as string, 10)
              ? pColor : nColor
          }}
        >
          {formatter('countFormat')(row?.p1Incidents)}
        </span>
    },
    {
      title: $t({ defaultMessage: 'Guest Experience' }),
      dataIndex: 'guestExp',
      key: 'guestExp',
      sorter: { compare: sortProp('guestExp', customSort) },
      render: (_, row: Common) => <Tooltip
        placement='top'
        title={$t({
          // eslint-disable-next-line max-len
          defaultMessage: 'Average Connection Success: {avgConnSuccess}{nl} Average Time to Connect: {avgTTC}{nl} Average Client Throughput: {avgClientThroughput}'
        }, {
          avgConnSuccess: !isNaN(row.avgConnSuccess)
            ? formatter('percentFormat')(row.avgConnSuccess)
            : noDataDisplay,
          avgTTC: !isNaN(row.avgTTC)
            ? formatter('percentFormat')(row.avgTTC)
            : noDataDisplay,
          avgClientThroughput: !isNaN(row.avgClientThroughput)
            ? formatter('percentFormat')(row.avgClientThroughput)
            : noDataDisplay,
          nl: '\n'
        })}
      >
        <span
          style={{
            color: !isNaN(row?.guestExp)
              ? row?.guestExp >= parseFloat(thresholdGuestExp as string)/100
                ? pColor
                : nColor
              : noDataColor
          }}
        >
          {!isNaN(row?.guestExp) ? formatter('percentFormat')(row?.guestExp) : noDataDisplay}
        </span>
      </Tooltip>
    },
    {
      title: $t({ defaultMessage: 'SSID Compliance' }),
      dataIndex: 'ssidCompliance',
      key: 'ssidCompliance',
      sorter: { compare: sortProp('ssidCompliance', customSort) },
      render: (_, row: Common) =>
        <span
          style={{
            color: !isNaN(row?.ssidCompliance)
              ? row?.ssidCompliance >= parseFloat(thresholdSSID as string)/100
                ? pColor
                : nColor
              : noDataColor
          }}
        >
          {!isNaN(row?.ssidCompliance)
            ? formatter('percentFormat')(row?.ssidCompliance)
            : noDataDisplay}
        </span>
    },
    {
      title: $t({ defaultMessage: 'Devices Total' }),
      dataIndex: 'deviceCount',
      key: 'deviceCount',
      sorter: { compare: sortProp('deviceCount', customSort) }
    }
  ]
  const lspCols: TableProps<Pick<Lsp,'lsp' | 'propertyCount'>>['columns'] = [
    {
      title: $t({ defaultMessage: 'LSP' }),
      dataIndex: 'lsp',
      key: 'lsp',
      searchable: true,
      sorter: { compare: sortProp('lsp', defaultSort) },
      render: (_, row: Pick<Lsp,'lsp' | 'propertyCount'>, __, highlightFn: CallableFunction) =>
        <span>{highlightFn(row?.lsp)}</span>
    }, {
      title: $t({ defaultMessage: 'Property Count' }),
      dataIndex: 'propertyCount',
      key: 'propertyCount',
      searchable: false,
      sorter: { compare: sortProp('propertyCount', defaultSort) },
      width: 100
    }
  ]
  const propertyCols: TableProps<Pick<Property, 'property' | 'lsp'>>['columns'] = [{
    title: $t({ defaultMessage: 'Property' }),
    dataIndex: 'property',
    key: 'property',
    fixed: 'left',
    searchable: true,
    sorter: { compare: sortProp('property', defaultSort) },
    render: (_, row: Pick<Property, 'property' | 'lsp'>, __, highlightFn: CallableFunction) =>
      <span>{highlightFn(row?.property)}</span>
  }, {
    title: $t({ defaultMessage: 'LSP' }),
    dataIndex: 'lsp',
    key: 'lsp',
    searchable: true,
    sorter: { compare: sortProp('lsp', defaultSort) },
    render: (_, row: Pick<Property, 'property' | 'lsp'>, __, highlightFn: CallableFunction) =>
      <span>{highlightFn(row?.lsp)}</span>
  }
  ]

  return <Table<Property | Lsp>
    columns={[
      ...(sliceType === 'lsp' ? lspCols : propertyCols), ...commonCols
    ] as unknown as TableProps<Property | Lsp>['columns']}
    dataSource={tableData as Property[] | Lsp[]}
    pagination={pagination}
    settingsId='property-list-table'
    rowKey='id'
  />
}
