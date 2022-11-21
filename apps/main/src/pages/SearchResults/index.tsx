import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { GridRow, GridCol, PageHeader } from '@acx-ui/components'
import { useVenuesListQuery }           from '@acx-ui/rc/services'
import { useTableQuery }                from '@acx-ui/rc/utils'

import { defaultVenuePayload, VenueTable } from '../Venues/VenuesTable'

import { Collapse } from './styledComponents'

export default function SearchResults () {
  return <SearchWidgets />
}

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

function SearchWidgets () {
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
    setCount(() => venueCount)
  }, [globalSearch, venueCount])

  return (
    <>
      <SearchHeader count={count}/>
      <GridRow>
        <GridCol col={{ span: 24 }} style={{ height: '280px' }}>
          <Collapse
            defaultActiveKey={['venue']}
            expandIconPosition='end'
          >
            <Collapse.Panel
              key='venue'
              header={$t({ defaultMessage: 'Venue ({venueCount})' }, { venueCount })}
            >
              <VenueTable
                globalSearch={globalSearch}
                tableQuery={tableQuery} />
            </Collapse.Panel>
          </Collapse>
        </GridCol>
      </GridRow>
    </>
  )
}
