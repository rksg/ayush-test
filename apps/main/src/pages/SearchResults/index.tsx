import React, { Fragment, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { GridRow, GridCol, PageHeader }         from '@acx-ui/components'
import { useVenuesListQuery }                   from '@acx-ui/rc/services'
import { RequestPayload, useTableQuery, Venue } from '@acx-ui/rc/utils'

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

const SearchTableWrapper = ({ children, count, title }
: { children: React.ReactNode, count: number, title: string }) => {
  const { $t } = useIntl()
  return <GridCol col={{ span: 24 }} style={{ height: '280px' }}>
    <Collapse
      defaultActiveKey={[title]}
      expandIconPosition='end'
      bordered={false}
    >
      <Panel
        key={title}
        header={$t({ defaultMessage: '{title} ({count})' }, {
          title: title.at(0)?.toUpperCase() + title.slice(1),
          count
        })}
      >
        {children}
      </Panel>
    </Collapse>
  </GridCol>
}

function SearchResult () {
  const globalSearch = useSearchTerm()
  const [count, setCount] = useState(0)

  const searchPayload = {
    ...defaultVenuePayload,
    searchString: globalSearch,
    searchTargetFields: ['name', 'description']
  }

  const tableQuery = useTableQuery<Venue, RequestPayload<unknown>, unknown>({
    useQuery: useVenuesListQuery,
    defaultPayload: searchPayload,
    pagination: {
      pageSize: 5
    }
  })

  const venueCount = tableQuery.data?.totalCount ?? 0

  useEffect(() => {
    // sum all table queries here
    setCount(() => venueCount)
  }, [globalSearch, venueCount])

  return (
    <Fragment key='search-results'>
      <SearchHeader key='search-header' count={count}/>
      <GridRow>
        <SearchTableWrapper
          title='venue'
          count={venueCount}
        >
          <VenueTable
            key={`venue-search-${globalSearch}`}
            globalSearch={globalSearch}
            tableQuery={tableQuery}
          />
        </SearchTableWrapper>
      </GridRow>
    </Fragment>
  )
}

export default function SearchResults () {
  const { searchVal } = useParams()
  return <SearchResult key={searchVal}/>
}