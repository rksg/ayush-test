import { Space, List } from 'antd'
import { useIntl }     from 'react-intl'

import { GridRow, GridCol }   from '@acx-ui/components'
import { baseUrlFor }         from '@acx-ui/config'
import { CaretRightList }     from '@acx-ui/icons'
import { TenantLink }         from '@acx-ui/react-router-dom'
import type { RaiPermission } from '@acx-ui/user'
import { hasPermission }      from '@acx-ui/user'

import * as UI from './styledComponents'

const useLinkData = () => {
  const { $t } = useIntl()
  const links: { title: string, to: string, permission: RaiPermission }[] = [{
    title: $t({ defaultMessage: 'Data Studio' }),
    to: '/dataStudio',
    permission: 'READ_DATA_STUDIO'
  }, {
    title: $t({ defaultMessage: 'Reports' }),
    to: '/reports',
    permission: 'READ_REPORTS'
  }, {
    title: $t({ defaultMessage: 'Dashboard' }),
    to: '/dashboard',
    permission: 'READ_DASHBOARD'
  }, {
    title: $t({ defaultMessage: 'Incidents' }),
    to: '/incidents',
    permission: 'READ_INCIDENTS'
  }, {
    title: $t({ defaultMessage: 'Clients' }),
    to: '/users/wifi/clients',
    permission: 'READ_WIRELESS_CLIENTS_LIST'
  }, {
    title: $t({ defaultMessage: 'Health' }),
    to: '/health',
    permission: 'READ_HEALTH'
  }, {
    title: $t({ defaultMessage: 'APs' }),
    to: '/devices/wifi',
    permission: 'READ_ACCESS_POINTS_LIST'
  }, {
    title: $t({ defaultMessage: 'Switches' }),
    to: '/devices/switch',
    permission: 'READ_SWITCH_LIST'
  }, {
    title: $t({ defaultMessage: 'Wi-Fi Networks' }),
    to: '/networks/wireless',
    permission: 'READ_WIFI_NETWORKS_LIST'
  }]
  return links.reduce((elements, { title, to, permission }) => {
    if (hasPermission({ permission })) {
      elements.push(<TenantLink to={to}>{title}</TenantLink>)
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
        <img src={baseUrlFor('/assets/SearchResultNoData.png')} alt='No Data' />
      </GridCol>
    </GridRow>
  </>
}

export default NoData
