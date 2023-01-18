import { IntlShape, useIntl } from 'react-intl'
import { useParams }          from 'react-router-dom'

import { PageHeader, Loader }         from '@acx-ui/components'
import {
  ApTable,
  defaultApPayload,
  NetworkTable,
  defaultNetworkPayload,
  EventTable,
  eventDefaultPayload,
  SwitchTable,
  defaultSwitchPayload,
  defaultClientPayload,
  ConnectedClientsTable,
  defaultSwitchClientPayload,
  ClientsTable as SwitchClientTable
} from '@acx-ui/rc/components'
import {
  useApListQuery,
  useEventsQuery,
  useNetworkListQuery,
  useVenuesListQuery,
  useSwitchListQuery,
  useGetClientListQuery,
  useGetSwitchClientListQuery
} from '@acx-ui/rc/services'
import {
  RequestPayload,
  useTableQuery,
  Network,
  Venue,
  AP,
  ApExtraParams,
  Event,
  SwitchRow,
  ClientList,
  SwitchClient
} from '@acx-ui/rc/utils'

import { useDefaultVenuePayload, VenueTable } from '../Venues/VenuesTable'

import NoData              from './NoData'
import { Collapse, Panel } from './styledComponents'


const pagination = { pageSize: 5, showSizeChanger: false }

const searches = [
  (searchString: string, $t: IntlShape['$t']) => {
    const venuePayload = useDefaultVenuePayload()
    const result = useTableQuery<Venue, RequestPayload<unknown>, unknown>({
      useQuery: useVenuesListQuery,
      defaultPayload: {
        ...venuePayload,
        searchString,
        searchTargetFields: ['name', 'description']
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'Venues' }),
      component: <VenueTable tableQuery={result} />
    }
  },
  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<Network, RequestPayload<unknown>, unknown>({
      useQuery: useNetworkListQuery,
      defaultPayload: {
        ...defaultNetworkPayload,
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
    const result = useTableQuery<AP, RequestPayload<unknown>, ApExtraParams>({
      useQuery: useApListQuery,
      defaultPayload: {
        ...defaultApPayload,
        searchString,
        searchTargetFields: ['name', 'model', 'IP', 'apMac', 'tags', 'serialNumber']
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'APs' }),
      component: <ApTable tableQuery={result} />
    }
  },
  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<Event>({
      useQuery: useEventsQuery,
      defaultPayload: {
        ...eventDefaultPayload,
        filters: {},
        searchString,
        searchTargetFields: ['entity_id', 'message', 'apMac', 'clientMac']
      },
      pagination,
      sorter: {
        sortField: 'event_datetime',
        sortOrder: 'DESC'
      }
    })
    return {
      result,
      title: $t({ defaultMessage: 'Events' }),
      component: <EventTable tableQuery={result} />
    }
  },
  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<SwitchRow, RequestPayload<unknown>, unknown>({
      useQuery: useSwitchListQuery,
      defaultPayload: {
        ...defaultSwitchPayload,
        searchString,
        searchTargetFields: ['name', 'model', 'ipAddress', 'switchMac']
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'Switches' }),
      component: <SwitchTable tableQuery={result} />
    }
  },
  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<ClientList, RequestPayload<unknown>, unknown>({
      useQuery: useGetClientListQuery,
      defaultPayload: {
        ...defaultClientPayload
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'Wi-Fi Clients' }),
      component: <ConnectedClientsTable tableQuery={result} searchString={searchString} />
    }
  },
  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<SwitchClient, RequestPayload<unknown>, unknown>({
      useQuery: useGetSwitchClientListQuery,
      defaultPayload: {
        ...defaultSwitchClientPayload
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'Switch Clients' }),
      component: <SwitchClientTable tableQuery={result} searchString={searchString} />
    }
  }
]

function SearchResult ({ searchVal }: { searchVal: string | undefined }) {
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
  return <SearchResult key={searchVal} searchVal={searchVal} />
}
