import { IntlShape, useIntl } from 'react-intl'
import { useParams }          from 'react-router-dom'

import { Loader, PageHeader } from '@acx-ui/components'
import {
  ApTable,
  ConnectedClientsTable,
  defaultRbacClientPayload,
  defaultRbacNetworkPayload,
  eventDefaultSearch,
  EventTable,
  NetworkTable,
  newDefaultApPayload,
  SwitchTable,
  useEventsTableQuery
} from '@acx-ui/rc/components'
import {
  useGetClientsQuery,
  useGetSwitchClientListQuery,
  useNewApListQuery,
  useSwitchListQuery,
  useVenuesListQuery,
  useWifiNetworkListQuery
} from '@acx-ui/rc/services'
import {
  defaultSwitchPayload
}                 from '@acx-ui/rc/switch/utils'
import {
  APExtended,
  ApExtraParams,
  ClientInfo,
  ClientList,
  Network,
  NewAPModelExtended,
  SwitchClient,
  SwitchRow,
  Venue,
  WifiNetwork
} from '@acx-ui/rc/utils'
import {
  defaultSwitchClientPayload,
  ClientsTable as SwitchClientTable
} from '@acx-ui/switch/components'
import { RequestPayload } from '@acx-ui/types'
import {
  useTableQuery
} from '@acx-ui/utils'

import { useDefaultVenuePayload, VenueTable } from '../Venues'

import NoData              from './NoData'
import { Collapse, Panel } from './styledComponents'

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

  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<Network|WifiNetwork, RequestPayload<unknown>, unknown>({
      useQuery: useWifiNetworkListQuery,
      defaultPayload: defaultRbacNetworkPayload,
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

  (searchString: string, $t: IntlShape['$t']) => {
    // eslint-disable-next-line max-len
    const result = useTableQuery<NewAPModelExtended|APExtended, RequestPayload<unknown>, ApExtraParams>({
      useQuery: useNewApListQuery,
      defaultPayload: newDefaultApPayload,
      search: {
        searchString,
        searchTargetFields: newDefaultApPayload.searchTargetFields
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'APs' }),
      component: <ApTable
        tableQuery={result}
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

  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<ClientInfo|ClientList, RequestPayload<unknown>, unknown>({
      useQuery: useGetClientsQuery,
      defaultPayload: {
        ...defaultRbacClientPayload
      },
      search: {
        searchString,
        searchTargetFields: defaultRbacClientPayload.searchTargetFields
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'Wi-Fi Clients' }),
      component: <ConnectedClientsTable tableQuery={result} />
    }
  },

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

function SearchResult ({ searchVal }:
  { searchVal: string | undefined }) {
  const { $t } = useIntl()
  const results = searches.map(search => search(searchVal as string, $t))
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

  return <SearchResult
    key={searchVal}
    searchVal={searchVal}
  />
}
