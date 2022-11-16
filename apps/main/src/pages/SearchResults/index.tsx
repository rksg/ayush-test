import { Typography } from 'antd'
import { useIntl }    from 'react-intl'
import { useParams }  from 'react-router-dom'

import { GridRow, GridCol, PageHeader } from '@acx-ui/components'

export default function SearchResults () {
  return (
    <>
      <SearchHeader />
      <SearchWidgets />
    </>
  )
}

function SearchHeader () {
  const { searchVal } = useParams()
  const decodedSearchVal = decodeURIComponent(searchVal as string)
  const { $t } = useIntl()
  const count = 1
  return (
    <PageHeader
      title={$t(
        { defaultMessage: 'Search Results for "{decodedSearchVal}" ({count})' },
        { decodedSearchVal, count }
      )}
    />
  )
}
function SearchWidgets () {
  const { $t } = useIntl()
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '280px' }}>
        <Typography.Text>{$t({ defaultMessage: 'Widget 1' })}</Typography.Text>
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ height: '280px' }}>
        <Typography.Text>{$t({ defaultMessage: 'Widget 2' })}</Typography.Text>
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ height: '280px' }}>
        <Typography.Text>{$t({ defaultMessage: 'Widget 3' })}</Typography.Text>
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ height: '280px' }}>
        <Typography.Text>{$t({ defaultMessage: 'Widget 4' })}</Typography.Text>
      </GridCol>
    </GridRow>
  )
}
