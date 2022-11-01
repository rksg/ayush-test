import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }             from '@acx-ui/components'
import { LocationSolid, SignalUp }               from '@acx-ui/icons'
import { useGetOldVenueRogueApQuery }            from '@acx-ui/rc/services'
import { RogueOldApResponseType, useTableQuery } from '@acx-ui/rc/utils'

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
  page: 1,
  pageSize: 25
}

// {
//   "rogueMac": "D4:5D:64:0C:97:C8",
//   "category": "Unclassified",
//   "classificationPolicyName": "No policy matched",
//   "classificationRuleName": "No rule matched",
//   "ssid": "JDL3F",
//   "channel": 3,
//   "band": "2.4 GHz",
//   "closestAp": {
//   "apSerialNumber": "121749001049",
//     "apName": "Raymond-R610",
//     "snr": 5
// },
//   "detectingAps": [
//   {
//     "apMac": "D8:38:FC:36:76:F0",
//     "apName": "Raymond-R610"
//   }
// ],
//   "numberOfDetectingAps": 1,
//   "lastUpdTime": "1666938118",
//   "locatable": false
// }

// {
//   key: 'rougeMac',
//     title: intl.$t({ defaultMessage: 'BSSID' }),
//   dataIndex: 'rougeMac',
//   align: 'center',
//   render: function (data, row) {
//   return row.rougeMac
// }
// },


export function VenueRogueAps () {
  function getCols (intl: ReturnType<typeof useIntl>) {
    const columns: TableProps<RogueOldApResponseType>['columns'] = [
      {
        key: 'rogueMac',
        title: intl.$t({ defaultMessage: 'BSSID' }),
        dataIndex: 'rogueMac',
        searchable: true
      },
      {
        key: 'category',
        title: intl.$t({ defaultMessage: 'Category' }),
        dataIndex: 'category',
        filterable: true,
        sorter: true,
        align: 'left'
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
        sorter: true,
        defaultSortOrder: 'ascend'
      },
      {
        key: 'channel',
        title: intl.$t({ defaultMessage: 'Channel' }),
        dataIndex: 'channel',
        sorter: true,
        align: 'center'
      },
      {
        key: 'band',
        title: intl.$t({ defaultMessage: 'Band' }),
        dataIndex: 'band',
        align: 'center'
      },
      {
        key: 'closestAp_snr',
        title: intl.$t({ defaultMessage: 'SNR' }),
        dataIndex: 'closestAp_snr',
        sorter: true,
        align: 'left',
        render: function (data, row) {
          return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <span>{row.closestAp_snr}</span>
            <SignalUp height={21}/>
          </div>
        }
      },
      {
        key: 'closestAp_apName',
        title: intl.$t({ defaultMessage: 'ClosestAp' }),
        dataIndex: 'closestAp_apName',
        filterable: true,
        sorter: true,
        align: 'center'
      },
      {
        key: 'detectingAps',
        title: intl.$t({ defaultMessage: 'Detecting AP' }),
        dataIndex: 'detectingAps',
        sorter: true,
        align: 'center',
        render: function (data, row) {
          return row.detectingAps.length
        }
      },
      {
        key: 'lastUpdTime',
        title: intl.$t({ defaultMessage: 'Last Seen' }),
        dataIndex: 'lastUpdTime',
        sorter: true,
        align: 'center',
        render: function (data, row) {
          return row.lastUpdTime
        }
      },
      {
        key: 'locatable',
        title: intl.$t({ defaultMessage: 'Locate Rouge' }),
        dataIndex: 'locatable',
        sorter: true,
        align: 'center',
        render: function (data, row) {
          return row.locatable
            ? <LocationSolid fill={'#f00'} stroke={'#f00'}/>
            : <LocationSolid fill={'#facd91'} stroke={'#facd91'} fillOpacity={'0.5'}/>
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
      defaultPayload
    })

    return (
      <Loader states={[
        tableQuery
      ]}>
        <Table
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
