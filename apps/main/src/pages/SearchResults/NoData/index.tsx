import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { GridRow, GridCol }   from '@acx-ui/components'
import { SearchResultNoData } from '@acx-ui/icons'

import * as UI from './styledComponents'

function NoData () {
  const { $t } = useIntl()
  return <>
    <Space />
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <UI.List>
          {$t({ defaultMessage: 'Check for typos or use a different search term' })}
        </UI.List>
      </GridCol>
      <UI.StyledGridCol col={{ span: 12 }}>
        {$t({ defaultMessage: 'Suggestions' })}
        {/** some form of matching list for links */}
        <li>{$t({ defaultMessage: 'APs' })}</li>
      </UI.StyledGridCol>
      <GridCol col={{ span: 12 }}>
        <SearchResultNoData />
      </GridCol>
    </GridRow>
  </>
}

export default NoData
