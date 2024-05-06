import { Space, List } from 'antd'
import { useIntl }     from 'react-intl'

import { getUserProfile, Roles }              from '@acx-ui/analytics/utils'
import { GridRow, GridCol }                   from '@acx-ui/components'
import { CaretRightList, SearchResultNoData } from '@acx-ui/icons'
import { TenantLink }                         from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

const useLinkData = () => {
  const { $t } = useIntl()
  const { selectedTenant: { role } } = getUserProfile()
  const linkData = role === Roles.BUSINESS_INSIGHTS_USER
    ? [
      { title: 'Data Studio', to: '/dataStudio' },
      { title: 'Reports', to: '/reports' }
    ]
    : [
      { title: 'Dashboard', to: '/dashboard' },
      { title: 'Incidents', to: '/incidents' },
      { title: 'Clients', to: '/users/wifi/clients' },
      { title: 'APs', to: '/devices/wifi' },
      { title: 'Switches', to: '/devices/switch' },
      { title: 'Wi-Fi Networks', to: '/networks/wireless' }
    ]

  const data = linkData.map(val => <TenantLink to={val.to}>
    {$t({ defaultMessage: '{title}' }, { title: val.title })}
  </TenantLink>)
  return data
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
        <SearchResultNoData />
      </GridCol>
    </GridRow>
  </>
}

export default NoData
