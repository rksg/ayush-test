import { IntlShape, useIntl } from 'react-intl'
import { useParams }          from 'react-router-dom'

import { PageHeader, Loader }          from '@acx-ui/components'
import {
  ApTable,
  defaultApPayload,
  NetworkTable,
  defaultNetworkPayload,
  EventTable,
  SwitchTable,
  defaultSwitchPayload,
  defaultClientPayload,
  ConnectedClientsTable,
  defaultSwitchClientPayload,
  ClientsTable as SwitchClientTable,
  eventDefaultSearch,
  useEventsTableQuery,
  defaultHistoricalClientPayload,
  GlobalSearchHistoricalClientsTable
} from '@acx-ui/rc/components'
import {
  useApListQuery,
  useNetworkListQuery,
  useVenuesListQuery,
  useSwitchListQuery,
  useGetClientListQuery,
  useGetSwitchClientListQuery,
  useGetHistoricalClientListQuery
} from '@acx-ui/rc/services'
import {
  useTableQuery,
  Network,
  Venue,
  AP,
  ApExtraParams,
  SwitchRow,
  ClientList,
  SwitchClient,
  Client
} from '@acx-ui/rc/utils'
import { RequestPayload } from '@acx-ui/types'

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
        ...defaultClientPayload
      },
      search: {
        searchString,
        searchTargetFields: defaultClientPayload.searchTargetFields
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
    const result = useTableQuery<Client, RequestPayload<unknown>, unknown>({
      useQuery: useGetHistoricalClientListQuery,
      defaultPayload: {
        ...defaultHistoricalClientPayload,
        searchString
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'Historical Clients' }),
      component: <GlobalSearchHistoricalClientsTable tableQuery={result} />
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
