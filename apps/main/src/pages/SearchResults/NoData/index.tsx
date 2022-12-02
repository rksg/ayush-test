import { Space, List } from 'antd'
import { useIntl }     from 'react-intl'

import { GridRow, GridCol }                       from '@acx-ui/components'
import { CaretRightOutlined, SearchResultNoData } from '@acx-ui/icons'

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
        <UI.StyledSubTitle>{$t({ defaultMessage: 'Suggestions' })}</UI.StyledSubTitle>
        <List
          bordered={false}
          dataSource={[$t({ defaultMessage: 'APs' })]}
          renderItem={(item) => <List.Item><CaretRightOutlined />{item}</List.Item>}
        />
      </UI.StyledGridCol>
      <GridCol col={{ span: 12 }}>
        <SearchResultNoData />
      </GridCol>
    </GridRow>
  </>
}

export default NoData
