import { Space, List } from 'antd'
import { useIntl }     from 'react-intl'

import { GridRow, GridCol } from '@acx-ui/components'
import { baseUrlFor }       from '@acx-ui/config'
import { CaretRightList }   from '@acx-ui/icons'
import { TenantLink }       from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

const useLinkData = () => {
  const { $t } = useIntl()
  const linkData = [
    { title: $t({ defaultMessage: '<VenuePlural></VenuePlural>' }), to: '/venues' },
    { title: $t({ defaultMessage: 'Networks' }), to: '/networks' },
    { title: $t({ defaultMessage: 'APs' }), to: '/devices/wifi' },
    { title: $t({ defaultMessage: 'Switches' }), to: '/devices/switch' },
    { title: $t({ defaultMessage: 'Wi-Fi Clients' }), to: '/users/wifi/clients' },
    { title: $t({ defaultMessage: 'Switch Clients' }), to: '/users/switch/clients' },
    { title: $t({ defaultMessage: 'Dashboard' }), to: '/dashboard' }
  ]

  return linkData.map(val => <TenantLink to={val.to}>{ val.title }</TenantLink>)
}

function NoData () {
  const { $t } = useIntl()
  const data = useLinkData()
  return <>
    <Space />
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <UI.List>
          {$t({ defaultMessage: 'Check for typos or use a different search term' })}
        </UI.List>
      </GridCol>
      <UI.StyledGridCol col={{ span: 12 }}>
        <UI.ListWrapper>
          <List
            bordered={false}
            dataSource={data}
            itemLayout='vertical'
            size='small'
            header={$t({ defaultMessage: 'Suggestions' })}
            renderItem={(item) =>
              <List.Item>
                <List.Item.Meta
                  avatar={<CaretRightList />}
                  title={item}
                />
              </List.Item>}
          />
        </UI.ListWrapper>
      </UI.StyledGridCol>
      {/* Hide until we get final image */}
      <GridCol col={{ span: 12 }} style={{ display: 'none' }}>
        <img src={baseUrlFor('/assets/SearchResultNoData.png')} alt='No Data' />
      </GridCol>
    </GridRow>
  </>
}

export default NoData
