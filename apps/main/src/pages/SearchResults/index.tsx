import { IntlShape, useIntl } from 'react-intl'
import { useParams }          from 'react-router-dom'

import { Loader, PageHeader }     from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ApTable,
  ConnectedClientsTable,
  defaultApPayload,
  defaultClientPayload,
  // defaultHistoricalClientPayload,
  defaultNetworkPayload,
  defaultRbacClientPayload,
  defaultRbacNetworkPayload,
  defaultSwitchClientPayload,
  defaultSwitchPayload,
  eventDefaultSearch,
  EventTable,
  // GlobalSearchHistoricalClientsTable,
  NetworkTable,
  newDefaultApPayload,
  ClientsTable as SwitchClientTable,
  SwitchTable,
  useEventsTableQuery
} from '@acx-ui/rc/components'
import {
  useApListQuery,
  useGetClientListQuery,
  useGetClientsQuery,
  // useGetHistoricalClientListQuery,
  useGetSwitchClientListQuery,
  useNetworkListQuery,
  useNewApListQuery,
  useSwitchListQuery,
  useVenuesListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  APExtended,
  ApExtraParams,
  // Client,
  ClientInfo,
  ClientList,
  Network,
  NewAPModelExtended,
  SwitchClient,
  SwitchRow,
  Venue,
  WifiNetwork
} from '@acx-ui/rc/utils'
import { RequestPayload } from '@acx-ui/types'
import {
  TableQuery,
  useTableQuery
} from '@acx-ui/utils'

import { useDefaultVenuePayload, VenueTable } from '../Venues'

import NoData              from './NoData'
import { Collapse, Panel } from './styledComponents'


interface EnableRbacType {
  isWifiRbacEnabled?: boolean
}

const pagination = { pageSize: 5, showSizeChanger: false }

const searches = [
  (searchString: string, $t: IntlShape['$t']) => {
    const venuePayload = useDefaultVenuePayload()
    const result = useTableQuery<Venue, RequestPayload<unknown>, unknown>({
      useQuery: useVenuesListQuery,
      defaultPayload: {
        ...venuePayload
      },
      search: {
        searchString,
        searchTargetFields: venuePayload.searchTargetFields as string[]
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }),
      component: <VenueTable tableQuery={result} searchable={false} />
    }
  },

  (searchString: string, $t: IntlShape['$t'], enableRbac: EnableRbacType) => {
    const result = useTableQuery<Network|WifiNetwork, RequestPayload<unknown>, unknown>({
      useQuery: enableRbac.isWifiRbacEnabled? useWifiNetworkListQuery : useNetworkListQuery,
      // eslint-disable-next-line max-len
      defaultPayload: enableRbac.isWifiRbacEnabled? defaultRbacNetworkPayload : defaultNetworkPayload,
      search: {
        searchString,
        searchTargetFields: ['name', 'description']
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'Networks' }),
      component: <NetworkTable tableQuery={result} />
    }
  },

  (searchString: string, $t: IntlShape['$t'], enableRbac: EnableRbacType) => {
    // eslint-disable-next-line max-len
    const result = useTableQuery<APExtended|NewAPModelExtended, RequestPayload<unknown>, ApExtraParams>({
      useQuery: enableRbac.isWifiRbacEnabled ? useNewApListQuery : useApListQuery,
      defaultPayload: enableRbac.isWifiRbacEnabled ? newDefaultApPayload :defaultApPayload,
      search: {
        searchString,
        searchTargetFields: enableRbac.isWifiRbacEnabled ?
          newDefaultApPayload.searchTargetFields :
          defaultApPayload.searchTargetFields
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'APs' }),
      component: <ApTable
        // eslint-disable-next-line max-len
        tableQuery={result as TableQuery<APExtended|NewAPModelExtended, RequestPayload<unknown>, ApExtraParams>}
        searchable={false} />
    }
  },

  (searchString: string, $t: IntlShape['$t']) => {
    const result = useEventsTableQuery(
      { entity_type: undefined },
      { ...eventDefaultSearch, searchString },
      pagination,
      0 // no polling
    )
    return {
      result,
      title: $t({ defaultMessage: 'Events' }),
      component: <EventTable
        settingsId='timeline-event-table'
        tableQuery={result}
        searchables={false}
        filterables={false}
      />
    }
  },

  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<SwitchRow, RequestPayload<unknown>, unknown>({
      useQuery: useSwitchListQuery,
      enableRbac: true,
      defaultPayload: {
        ...defaultSwitchPayload
      },
      search: {
        searchString,
        searchTargetFields: defaultSwitchPayload.searchTargetFields
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'Switches' }),
      component: <SwitchTable tableQuery={result} searchable={false}/>
    }
  },

  (searchString: string, $t: IntlShape['$t'], enableRbac: EnableRbacType) => {
    const isWifiRbacEnabled = enableRbac.isWifiRbacEnabled
    const defaultPayload = isWifiRbacEnabled? defaultRbacClientPayload : defaultClientPayload

    const result = useTableQuery<ClientInfo|ClientList, RequestPayload<unknown>, unknown>({
      useQuery: isWifiRbacEnabled? useGetClientsQuery : useGetClientListQuery,
      defaultPayload: {
        ...defaultPayload
      },
      search: {
        searchString,
        searchTargetFields: defaultPayload.searchTargetFields
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'Wi-Fi Clients' }),
      component: <ConnectedClientsTable tableQuery={result} />
    }
  },

  // (searchString: string, $t: IntlShape['$t']) => {
  //   const result = useTableQuery<Client, RequestPayload<unknown>, unknown>({
  //     useQuery: useGetHistoricalClientListQuery,
  //     defaultPayload: {
  //       ...defaultHistoricalClientPayload,
  //       searchString
  //     },
  //     pagination
  //   })
  //   return {
  //     result,
  //     title: $t({ defaultMessage: 'Historical Clients' }),
  //     component: <GlobalSearchHistoricalClientsTable tableQuery={result} />
  //   }
  // },

  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<SwitchClient, RequestPayload<unknown>, unknown>({
      useQuery: useGetSwitchClientListQuery,
      defaultPayload: {
        ...defaultSwitchClientPayload
      },
      search: {
        searchString,
        searchTargetFields: defaultSwitchClientPayload.searchTargetFields
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'Switch Clients' }),
      component: <SwitchClientTable tableQuery={result} />
    }
  }
]

function SearchResult ({ searchVal, enableRbac }:
  { searchVal: string | undefined, enableRbac:EnableRbacType }) {
  const { $t } = useIntl()
  const results = searches.map(search => search(searchVal as string, $t, enableRbac))
  const count = results.reduce((count, { result }) => count + (result.data?.totalCount || 0), 0)
  return <Loader states={results.map(({ result }) => ({ ...result, isFetching: false }))}>
    {count
      ? <>
        <PageHeader title={$t(
          { defaultMessage: 'Search Results for "{searchVal}" ({count})' },
          { searchVal, count }
        )} />
        <Collapse
          defaultActiveKey={Object.keys(results)}
        >
          {
            results.map(({ component, title, result: { data } }, index) => data?.totalCount
              ? <Panel key={index} header={`${title} (${data?.totalCount})`}>{component}</Panel>
              : null
            )
          }
        </Collapse>
      </>
      : <>
        <PageHeader title={$t(
          { defaultMessage: 'Hmmmm... we couldn’t find any match for "{searchVal}"' },
          { searchVal }
        )} />
        <NoData />
      </>
    }

  </Loader>
}

export default function SearchResults () {
  const { searchVal } = useParams()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  return <SearchResult
    key={searchVal}
    searchVal={searchVal}
    enableRbac={{
      isWifiRbacEnabled
    }}
  />
}
