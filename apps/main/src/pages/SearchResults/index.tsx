import { IntlShape, useIntl } from 'react-intl'
import { useParams }          from 'react-router-dom'

import { PageHeader, Loader } from '@acx-ui/components'
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
  ClientsTable as SwitchClientTable,
  eventDefaultSearch
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
      title: $t({ defaultMessage: 'Venues' }),
      component: <VenueTable tableQuery={result} searchable={false} />
    }
  },
  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<Network, RequestPayload<unknown>, unknown>({
      useQuery: useNetworkListQuery,
      defaultPayload: {
        ...defaultNetworkPayload
      },
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
    const result = useTableQuery<AP, RequestPayload<unknown>, ApExtraParams>({
      useQuery: useApListQuery,
      defaultPayload: {
        ...defaultApPayload
      },
      search: {
        searchString,
        searchTargetFields: defaultApPayload.searchTargetFields
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'APs' }),
      component: <ApTable tableQuery={result} searchable={false} />
    }
  },
  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<Event>({
      useQuery: useEventsQuery,
      defaultPayload: {
        ...eventDefaultPayload,
        filters: {}
      },
      pagination,
      search: {
        searchString,
        searchTargetFields: eventDefaultSearch.searchTargetFields
      },
      sorter: {
        sortField: 'event_datetime',
        sortOrder: 'DESC'
      }
    })
    return {
      result,
      title: $t({ defaultMessage: 'Events' }),
      component: <EventTable tableQuery={result} searchables={false} filterables={false} />
    }
  },
  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<SwitchRow, RequestPayload<unknown>, unknown>({
      useQuery: useSwitchListQuery,
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
    const result = useTableQuery<ClientList, RequestPayload<unknown>, unknown>({
      useQuery: useGetClientListQuery,
      defaultPayload: {
        ...defaultClientPayload,
        searchString
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
        ...defaultSwitchClientPayload,
        searchString
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
