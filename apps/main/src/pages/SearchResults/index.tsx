import React, { Fragment, useEffect, useState } from 'react'

import { IntlShape, useIntl } from 'react-intl'
import { useParams }          from 'react-router-dom'

import { GridRow, GridCol, PageHeader }                  from '@acx-ui/components'
import { CollapseActive, CollapseInactive }              from '@acx-ui/icons'
import { NetworkTable }                                  from '@acx-ui/rc/components'
import { useNetworkListQuery, useVenuesListQuery }       from '@acx-ui/rc/services'
import { Network, RequestPayload, useTableQuery, Venue } from '@acx-ui/rc/utils'

import { defaultVenuePayload, VenueTable } from '../Venues/VenuesTable'

import { Collapse, Panel } from './styledComponents'


function useSearchTerm () {
  const { searchVal } = useParams()
  const decodedVal = decodeURIComponent(searchVal as string)
  return decodedVal
}

function SearchHeader ({ count }: { count: number }) {
  const searchVal = useSearchTerm()
  const { $t } = useIntl()
  return (
    <PageHeader
      title={$t(
        { defaultMessage: 'Search Results for "{searchVal}" ({count})' },
        { searchVal, count }
      )}
    />
  )
}

const useGetPanelHeader = ({ count, title, $t }
  : { count: number, title: string, $t: IntlShape['$t'] }) => {
  return $t({ defaultMessage: '{title} ({count})' }, { title, count })
}

function SearchResult () {
  const { $t } = useIntl()
  const globalSearch = useSearchTerm()
  const [count, setCount] = useState(0)

  const searchVenuePayload = {
    ...defaultVenuePayload,
    searchString: globalSearch,
    searchTargetFields: ['name', 'description']
  }

  const venueQuery = useTableQuery<Venue, RequestPayload<unknown>, unknown>({
    useQuery: useVenuesListQuery,
    defaultPayload: searchVenuePayload,
    pagination: {
      pageSize: 5
    }
  })

  const networkQuery = useTableQuery<Network, RequestPayload<unknown>, unknown>({
    useQuery: useNetworkListQuery,
    defaultPayload: {
      ...NetworkTable.defaultNetworkPayload,
      searchString: globalSearch
    },
    pagination: {
      pageSize: 5
    }
  })

  const venueCount = venueQuery.data?.totalCount ?? 0
  const networkCount = networkQuery.data?.totalCount ?? 0

  useEffect(() => {
    // sum all table queries here
    setCount(() => venueCount + networkCount)
  }, [globalSearch, networkCount, venueCount])

  return (
    <Fragment key='search-results'>
      <SearchHeader key='search-header' count={count}/>
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ height: '280px' }}>
          <Collapse
            defaultActiveKey={['1', '2']}
            expandIconPosition='end'
            expandIcon={({ isActive }) => (isActive)
              ? <CollapseActive />
              : <CollapseInactive />
            }
            bordered={false}
          >
            <Panel
              header={useGetPanelHeader({ title: 'Venue', count: venueCount, $t })}
              key='1'
            >
              <VenueTable
                key={`venue-search-${globalSearch}`}
                globalSearch={globalSearch}
                tableQuery={venueQuery}
              />
            </Panel>
            <Panel
              header={useGetPanelHeader({ title: 'Networks', count: networkCount, $t })}
              key='2'
            >
              <NetworkTable
                key={`network-search-${globalSearch}`}
                tableQuery={networkQuery}
                globalSearch={globalSearch}
              />
            </Panel>
          </Collapse>
        </GridCol>
      </GridRow>
    </Fragment>
  )
}

export default function SearchResults () {
  const { searchVal } = useParams()
  return <SearchResult key={searchVal}/>
}