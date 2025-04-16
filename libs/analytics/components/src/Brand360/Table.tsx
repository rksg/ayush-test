import { isNaN, isNull } from 'lodash'
import { useIntl }       from 'react-intl'

import { getDefaultSettings }               from '@acx-ui/analytics/services'
import { defaultSort, sortProp, Settings  } from '@acx-ui/analytics/utils'
import { Table, TableProps, Tooltip }       from '@acx-ui/components'
import { formatter }                        from '@acx-ui/formatter'
import { getUserProfile, isCoreTier }       from '@acx-ui/user'
import { noDataDisplay }                    from '@acx-ui/utils'

import {
  transformToLspView, transformToPropertyView, Property, Common, Lsp, customSort
} from './helpers'
import {
  Response
} from './services'

const pagination = { pageSize: 10, defaultPageSize: 10 }

interface BrandTableProps {
  sliceType: string
  slaThreshold?: Partial<Settings>
  data: Response[]
  isLSP?: boolean
  lspLabel: string
  propertyLabel: string
  isMDU?: boolean
}

export function BrandTable ({
  sliceType, slaThreshold, data, isLSP, lspLabel, propertyLabel, isMDU
}: BrandTableProps) {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const thresholds = slaThreshold || getDefaultSettings()
  const thresholdP1Incidents = thresholds['sla-p1-incidents-count' as keyof typeof slaThreshold]
  const thresholdProspectCount = thresholds['sla-prospect-count' as keyof typeof slaThreshold]
  const thresholdGuestExp = thresholds['sla-guest-experience' as keyof typeof slaThreshold]
  const thresholdSSID = thresholds['sla-brand-ssid-compliance' as keyof typeof slaThreshold]
  const pColor = 'var(--acx-primary-black)'
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
      title: isMDU  // istanbul ignore next
        ? $t({ defaultMessage: 'Resident Experience' })
        : $t({ defaultMessage: 'Guest Experience' }),
      dataIndex: 'guestExp',
      key: 'guestExp',
      sorter: { compare: sortProp('guestExp', customSort) },
      // eslint-disable-next-line max-len
      tooltip: isCore ? $t({ defaultMessage: 'This value is calculated using data from Essential and Professional tier properties only.' }) : '',
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
            color: !isNaN(row?.guestExp) && !isNull(row?.guestExp)
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
    ...(isMDU
      ?
      // for demo only
      // istanbul ignore next
      [
        {
          title: $t({ defaultMessage: '# of Prospects' }),
          dataIndex: 'prospectCountSLA',
          key: 'prospectCountSLA',
          sorter: { compare: sortProp('prospectCountSLA', customSort) },
          render:
          // istanbul ignore next
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (_: any, row: Common) =>
            <span
              style={{
                color: row?.prospectCountSLA >= parseInt(thresholdProspectCount as string, 10)
                  ? pColor : nColor
              }}
            >
              {formatter('countFormat')(row?.prospectCountSLA)}
            </span>
        }
      ] : [{
        title: $t({ defaultMessage: 'SSID Compliance' }),
        dataIndex: 'ssidCompliance',
        key: 'ssidCompliance',
        sorter: { compare: sortProp('ssidCompliance', customSort) },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (_: any, row: Common) =>
          <span
            style={{
              color: !isNaN(row?.ssidCompliance) && !isNull(row?.ssidCompliance)
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
      }]),
    {
      title: $t({ defaultMessage: 'Devices Total' }),
      dataIndex: 'deviceCount',
      key: 'deviceCount',
      sorter: { compare: sortProp('deviceCount', customSort) }
    }
  ]
  const lspCols: TableProps<Pick<Lsp,'lsp' | 'propertyCount'>>['columns'] = [
    {
      title: lspLabel,
      dataIndex: 'lsp',
      key: 'lsp',
      searchable: true,
      fixed: 'left',
      sorter: { compare: sortProp('lsp', defaultSort) },
      render: (_, row: Pick<Lsp,'lsp' | 'propertyCount'>, __, highlightFn: CallableFunction) =>
        <span>{highlightFn(row?.lsp)}</span>
    }, {
      title: $t({ defaultMessage: '{propertyLabel} Count' }, { propertyLabel }),
      dataIndex: 'propertyCount',
      key: 'propertyCount',
      searchable: false,
      sorter: { compare: sortProp('propertyCount', defaultSort) },
      width: 100
    }
  ]
  const propertyCols: TableProps<Pick<Property, 'property' | 'lsp'>>['columns'] = [{
    title: propertyLabel,
    dataIndex: 'property',
    key: 'property',
    fixed: 'left',
    searchable: true,
    sorter: { compare: sortProp('property', defaultSort) },
    render: (_, row: Pick<Property, 'property' | 'lsp'>, __, highlightFn: CallableFunction) =>
      <span>{highlightFn(row?.property)}</span>
  }, {
    title: lspLabel,
    dataIndex: 'lsp',
    key: 'lsp',
    fixed: 'left',
    searchable: true,
    sorter: { compare: sortProp('lsp', defaultSort) },
    render: (_, row: Pick<Property, 'property' | 'lsp'>, __, highlightFn: CallableFunction) =>
      <span>{highlightFn(row?.lsp)}</span>
  }
  ]
  // Remove lsp column in case of LSP account
  if(isLSP){
    propertyCols.splice(-1)
  }

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
