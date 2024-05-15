import { Space, List } from 'antd'
import { useIntl }     from 'react-intl'

import { GridRow, GridCol }                   from '@acx-ui/components'
import { CaretRightList, SearchResultNoData } from '@acx-ui/icons'
import { TenantLink }                         from '@acx-ui/react-router-dom'
import type { RaiPermission }                 from '@acx-ui/user'
import { hasPermission }                      from '@acx-ui/user'

import * as UI from './styledComponents'

const useLinkData = () => {
  const { $t } = useIntl()
  const links: { title: string, to: string, permission: RaiPermission }[] = [
    { title: 'Data Studio', to: '/dataStudio', permission: 'READ_DATA_STUDIO' },
    { title: 'Reports', to: '/reports', permission: 'READ_REPORTS' },
    { title: 'Dashboard', to: '/dashboard', permission: 'READ_DASHBOARD' },
    { title: 'Incidents', to: '/incidents', permission: 'READ_INCIDENTS' },
    { title: 'Clients', to: '/users/wifi/clients', permission: 'READ_WIRELESS_CLIENTS_LIST' },
    { title: 'APs', to: '/devices/wifi', permission: 'READ_ACCESS_POINTS_LIST' },
    { title: 'Switches', to: '/devices/switch', permission: 'READ_SWITCH_LIST' },
    { title: 'Wi-Fi Networks', to: '/networks/wireless', permission: 'READ_WIFI_NETWORKS_LIST' }
  ]
  return links.reduce((elements, { title, to, permission }) => {
    if (hasPermission({ permission })) {
      elements.push(<TenantLink to={to}>{$t({ defaultMessage: '{title}' }, { title })}</TenantLink>)
    }
    return elements
  }, [] as React.ReactNode[])
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
