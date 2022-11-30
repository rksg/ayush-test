import { IntlShape, useIntl } from 'react-intl'
import { useParams }          from 'react-router-dom'

import { PageHeader, Loader }                            from '@acx-ui/components'
import { CollapseActive, CollapseInactive }              from '@acx-ui/icons'
import { NetworkTable, defaultNetworkPayload }           from '@acx-ui/rc/components'
import { useNetworkListQuery, useVenuesListQuery }       from '@acx-ui/rc/services'
import { Network, RequestPayload, useTableQuery, Venue } from '@acx-ui/rc/utils'

import { defaultVenuePayload, VenueTable } from '../Venues/VenuesTable'

import { Collapse, Panel } from './styledComponents'

const pagination = { pageSize: 5 }

const searches = [
  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<Venue, RequestPayload<unknown>, unknown>({
      useQuery: useVenuesListQuery,
      defaultPayload: {
        ...defaultVenuePayload,
        searchString,
        searchTargetFields: ['name', 'description']
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'Venues' }),
      component: <VenueTable tableQuery={result} globalSearch={searchString} />
    }
  },
  (searchString: string, $t: IntlShape['$t']) => {
    const result = useTableQuery<Network, RequestPayload<unknown>, unknown>({
      useQuery: useNetworkListQuery,
      defaultPayload: {
        ...defaultNetworkPayload,
        searchString,
        searchTargetFiled: ['name', 'description']
      },
      pagination
    })
    return {
      result,
      title: $t({ defaultMessage: 'Networks' }),
      component: <NetworkTable tableQuery={result} globalSearch={searchString} />
    }
  }
]

function SearchResult () {
  const { $t } = useIntl()
  const { searchVal } = useParams()
  const results = searches.map(search => search(searchVal as string, $t))
  const count = results.reduce((count, { result }) => count + (result.data?.totalCount || 0), 0)
  return <Loader states={results.map(({ result }) => result)}>
    <PageHeader title={$t(
      { defaultMessage: 'Search Results for "{searchVal}" ({count})' },
      { searchVal, count }
    )} />
    <Collapse
      defaultActiveKey={Object.keys(results)}
      expandIconPosition='end'
      expandIcon={({ isActive }) => (isActive)
        ? <CollapseActive />
        : <CollapseInactive />
      }
      bordered={false}
    >
      {count
        ? results.map(({ component, title, result: { data } }, index) => data?.totalCount
          ? <Panel key={index} header={`${title} (${data?.totalCount})`}>{component}</Panel>
          : null
        )
        : <div>todo: empty search result</div>
      }
    </Collapse>
  </Loader>
}

export default function SearchResults () {
  const { searchVal } = useParams()
  return <SearchResult key={searchVal}/>
}