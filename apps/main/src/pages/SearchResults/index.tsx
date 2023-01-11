import { IntlShape, useIntl } from 'react-intl'
import { useParams }          from 'react-router-dom'

import { PageHeader, Loader } from '@acx-ui/components'
import {
  ApTable,
  defaultApPayload,
  NetworkTable,
  defaultNetworkPayload,
  eventDefaultPayload,
  EventTable
}           from '@acx-ui/rc/components'
import {
  useApListQuery,
  useEventsQuery,
  useNetworkListQuery,
  useVenuesListQuery
}       from '@acx-ui/rc/services'
import {
  RequestPayload,
  useTableQuery,
  Network,
  Venue,
  AP,
  ApExtraParams,
  Event,
  usePollingTableQuery,
  TABLE_QUERY_LONG_POLLING_INTERVAL
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
    const result = usePollingTableQuery<Event>({
      useQuery: useEventsQuery,
      defaultPayload: {
        ...eventDefaultPayload,
        filters: {},
        searchString,
        searchTargetFields: ['entity_id', 'message', 'apMac', 'clientMac'],
        detailLevel: 'su'
      },
      pagination,
      sorter: {
        sortField: 'event_datetime',
        sortOrder: 'DESC'
      },
      option: { pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL }
    })
    return {
      result,
      title: $t({ defaultMessage: 'Events' }),
      component: <EventTable tableQuery={result} />
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