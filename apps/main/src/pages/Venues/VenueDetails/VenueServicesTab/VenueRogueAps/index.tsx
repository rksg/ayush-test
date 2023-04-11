import React from 'react'

import { Badge }   from 'antd'
import { useIntl } from 'react-intl'

import { deviceCategoryColors, Loader, Table, TableProps } from '@acx-ui/components'
import {
  SignalBad,
  SignalExcellent,
  SignalGood, SignalPoor,
  VenueMarkerGrey,
  VenueMarkerRed
} from '@acx-ui/icons'
import { useGetOldVenueRogueApQuery }                                 from '@acx-ui/rc/services'
import { RogueDeviceCategory, RogueOldApResponseType, useTableQuery } from '@acx-ui/rc/utils'

const defaultPayload = {
  url: '/api/viewmodel/tenant/{tenantId}/venue/{venueId}/rogue/ap',
  searchString: '',
  fields: [
    'rogueMac',
    'category',
    'classificationPolicyName',
    'ssid',
    'channel',
    'band',
    'closestAp.snr',
    'closestAp.apName',
    'numberOfDetectingAps',
    'lastUpdTime',
    'locatable',
    'cog',
    'classificationRuleName',
    'closestAp.apSerialNumber',
    'detectingAps.apName',
    'id'
  ],
  sortField: 'lastUpdTime',
  sortOrder: 'DESC',
  page: 1
}

const renderSignal = (snr: number) => {
  if (snr <= 10) return <SignalBad height={21} />

  const value = Math.floor(snr / 10)
  if (value >= 4) {
    return <SignalExcellent height={21}/>
  }
  if (value >= 3) {
    return <SignalGood height={21} />
  }
  if (value >= 2) {
    return <SignalPoor height={21} />
  }

  return <SignalBad height={21} />
}

const handleCategoryColor = (status: RogueDeviceCategory) => {
  return `var(${deviceCategoryColors[status]})`
}

export function VenueRogueAps () {
  const leftFillZero = (num: number) => num.toString().padStart(2, '0')
  const formatDate = (date: Date) => {
    return (
      [
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      ].join('/') +
      ' ' +
      [
        leftFillZero(date.getHours()),
        leftFillZero(date.getMinutes()),
        leftFillZero(date.getSeconds())
      ].join(':')
    )
  }

  const getCols = (intl: ReturnType<typeof useIntl>) => {
    const columns: TableProps<RogueOldApResponseType>['columns'] = [
      {
        key: 'rogueMac',
        title: intl.$t({ defaultMessage: 'BSSID' }),
        dataIndex: 'rogueMac',
        searchable: true,
        fixed: 'left'
      },
      {
        key: 'category',
        title: intl.$t({ defaultMessage: 'Category' }),
        dataIndex: 'category',
        // filterable: true, // TODO: change to search or provide static list
        sorter: true,
        render: (data, row) => {
          return <span>
            <Badge
              color={handleCategoryColor(row.category as RogueDeviceCategory)}
              text={row.category}
            />
          </span>
        }
      },
      {
        key: 'classificationPolicyName',
        title: intl.$t({ defaultMessage: 'Classification Profile' }),
        dataIndex: 'classificationPolicyName',
        sorter: true
      },
      {
        key: 'ssid',
        title: intl.$t({ defaultMessage: 'SSID' }),
        dataIndex: 'ssid',
        sorter: true
      },
      {
        key: 'channel',
        title: intl.$t({ defaultMessage: 'Channel' }),
        dataIndex: 'channel',
        sorter: true
      },
      {
        key: 'band',
        title: intl.$t({ defaultMessage: 'Band' }),
        dataIndex: 'band'
      },
      {
        key: 'closestAp_snr',
        title: intl.$t({ defaultMessage: 'SNR' }),
        dataIndex: 'closestAp_snr',
        sorter: true,
        align: 'center',
        render: (data, row) => {
          return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <span>{row.closestAp_snr}</span>
            {renderSignal(row.closestAp_snr ?? 0)}
          </div>
        }
      },
      {
        key: 'closestAp_apName',
        title: intl.$t({ defaultMessage: 'Closest Ap' }),
        dataIndex: 'closestAp_apName',
        // filterable: true, // TODO: change to search or provide static list
        sorter: true
      },
      {
        key: 'detectingAps',
        title: intl.$t({ defaultMessage: 'Detecting AP' }),
        dataIndex: 'detectingAps',
        sorter: true,
        align: 'center',
        render: (data, row) => {
          return row.detectingAps.length
        }
      },
      {
        key: 'lastUpdTime',
        title: intl.$t({ defaultMessage: 'Last Seen' }),
        dataIndex: 'lastUpdTime',
        sorter: true,
        defaultSortOrder: 'descend',
        render: (data, row) => {
          return formatDate(new Date(Number(row.lastUpdTime) * 1000))
        }
      },
      {
        key: 'locatable',
        title: intl.$t({ defaultMessage: 'Locate Rogue' }),
        dataIndex: 'locatable',
        sorter: true,
        render: (data, row) => {
          return row.locatable
            ? <VenueMarkerRed />
            : <VenueMarkerGrey />
        }
      }
    ]
    return columns
  }

  const transformData = (data: RogueOldApResponseType[]) => {
    return data.map(response => {
      return {
        ...response,
        closestAp_apName: response?.closestAp?.apName || '',
        closestAp_snr: response?.closestAp?.snr || 0
      }
    })
  }

  const VenueRogueApsTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useGetOldVenueRogueApQuery,
      defaultPayload,
      sorter: {
        sortField: 'lastUpdTime',
        sortOrder: 'DESC'
      }
    })

    return (
      <Loader states={[
        tableQuery
      ]}>
        <Table
          settingsId='venue-rogue-aps-table'
          columns={getCols(useIntl())}
          dataSource={transformData(tableQuery?.data?.data || [])}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <VenueRogueApsTable />
  )
}
