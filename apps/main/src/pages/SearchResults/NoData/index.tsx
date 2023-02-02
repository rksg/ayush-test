import { Space, List } from 'antd'
import { useIntl }     from 'react-intl'

import { GridRow, GridCol }                   from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { CaretRightList, SearchResultNoData } from '@acx-ui/icons'
import { TenantLink }                         from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

const useLinkData = () => {
  const { $t } = useIntl()
  const linkData = [
    {
      title: 'Venues',
      to: '/venues'
    },
    {
      title: 'Networks',
      to: '/networks'
    }
  ]
  // feature toggles to be handled
  const devicesToggle = useIsSplitOn(Features.DEVICES)
  if (devicesToggle) {
    linkData.push({
      title: 'APs',
      to: '/devices/wifi'
    })
    linkData.push({
      title: 'Switches',
      to: '/devices/switch'
    })
  }

  const usersToggle = useIsSplitOn(Features.USERS)
  if (usersToggle) {
    linkData.push({
      title: 'Wi-Fi Clients',
      to: '/users/wifi/clients'
    })
    linkData.push({
      title: 'Switch Clients',
      to: '/users/switch/clients'
    })
  }

  // last key is dashboard
  linkData.push({
    title: 'Dashboard',
    to: '/dashboard'
  })

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
