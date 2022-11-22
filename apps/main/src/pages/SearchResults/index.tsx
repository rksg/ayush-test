import { Fragment, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { GridRow, GridCol, PageHeader }                   from '@acx-ui/components'
import { CaretDoubleUpOutlined, CaretDoubleDownOutlined } from '@acx-ui/icons'
import { useVenuesListQuery }                             from '@acx-ui/rc/services'
import { useTableQuery }                                  from '@acx-ui/rc/utils'

import { defaultVenuePayload, VenueTable } from '../Venues/VenuesTable'

import { Collapse } from './styledComponents'


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

function SearchResult () {
  const { $t } = useIntl()
  const globalSearch = useSearchTerm()
  const [count, setCount] = useState(0)

  const searchPayload = {
    ...defaultVenuePayload,
    searchString: globalSearch
  }

  const tableQuery = useTableQuery({
    useQuery: useVenuesListQuery,
    defaultPayload: searchPayload
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
        <GridCol col={{ span: 24 }} style={{ height: '280px' }}>
          <Collapse
            defaultActiveKey={['venue']}
            expandIconPosition='end'
            expandIcon={({ isActive }) => (isActive)
              ? <CaretDoubleUpOutlined />
              : <CaretDoubleDownOutlined />
            }
          >
            <Collapse.Panel
              key='venue'
              header={$t({ defaultMessage: 'Venue ({venueCount})' }, { venueCount })}
            >
              <VenueTable
                key={`venue-search-${globalSearch}`}
                globalSearch={globalSearch}
                tableQuery={tableQuery} />
            </Collapse.Panel>
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