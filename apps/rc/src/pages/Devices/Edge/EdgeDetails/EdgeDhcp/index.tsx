import { useEffect, useState } from 'react'

import { Form, Space, Switch }    from 'antd'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { showActionModal, Tabs }    from '@acx-ui/components'
import {
  useGetDhcpHostStatsQuery,
  useGetDhcpPoolStatsQuery,
  usePatchEdgeDhcpServiceMutation
} from '@acx-ui/rc/services'
import {
  DhcpPoolStats,
  EdgeDhcpHostStatus,
  RequestPayload,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import Leases           from './Leases'
import ManageDhcpDrawer from './ManageDhcpDrawer'
import Pools            from './Pools'
import * as UI          from './styledComponents'

const EdgeDhcp = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, serialNumber } = useParams()
  const [isDhcpServiceActive, setIsDhcpServiceActive] = useState(false)
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/edge-details/dhcp`)
  const [updateEdgeDhcpService] = usePatchEdgeDhcpServiceMutation()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const getDhcpPoolStatsPayload = {
    fields: [
      'id',
      'dhcpId',
      'poolName',
      'subnetMask',
      'poolRange',
      'gateway',
      'edgeIds'
    ],
    filters: { edgeIds: [serialNumber] },
    sortField: 'name',
    sortOrder: 'ASC'
  }
  const poolTableQuery = useTableQuery<DhcpPoolStats, RequestPayload<unknown>, unknown>({
    useQuery: useGetDhcpPoolStatsQuery,
    defaultPayload: getDhcpPoolStatsPayload
  })

  const getDhcpHostStatsPayload = {
    filters: { edgeId: [serialNumber], hostStatus: [EdgeDhcpHostStatus.ONLINE] },
    sortField: 'name',
    sortOrder: 'ASC'
  }
  const { data: dhcpHostStats } = useGetDhcpHostStatsQuery({ payload: getDhcpHostStatsPayload })

  useEffect(() => {
    setIsDhcpServiceActive((poolTableQuery.data?.totalCount || 0) > 0)
  }, [poolTableQuery.data?.totalCount])

  const tabs = {
    pools: {
      title: $t({ defaultMessage: 'Pools' }),
      content: <Pools tableQuery={poolTableQuery} />
    },
    leases: {
      title: $t(
        { defaultMessage: 'Leases ( {count} online )' },
        { count: dhcpHostStats?.totalCount || 0 }
      ),
      content: <Leases />
    }
  }

  const handleActiveSwitch = (checked: boolean) => {
    if(checked) {
      setDrawerVisible(true)
    } else {
      showActionModal({
        type: 'confirm',
        title: $t({ defaultMessage: 'Deactive DHCP Service' }),
        content: $t({ defaultMessage: 'Are you sure you want to deactive DHCP service?' }),
        onOk: () => {
          if((poolTableQuery.data?.totalCount || 0) > 0) {
            const params = { id: poolTableQuery.data?.data[0].dhcpId }
            const edgeIds = poolTableQuery.data?.data[0].edgeIds || []
            const payload = {
              edgeIds: [
                ...edgeIds.filter(id => id !== serialNumber)
              ]
            }
            updateEdgeDhcpService({ params, payload })
          }
        }
      })
    }
  }

  const tabBarExtraContent = {
    right:
    <Space size='large' align='baseline'>
      <Form.Item
        label={$t({ defaultMessage: 'DHCP Service state' })}
        children={
          <Switch checked={isDhcpServiceActive} onChange={handleActiveSwitch} />
        }
      />
      <UI.SettingIcon
        data-testid='setting-icon'
        disabled={!isDhcpServiceActive}
        onClick={()=> isDhcpServiceActive && setDrawerVisible(true)}
      />
    </Space>
  }

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    <>
      <ManageDhcpDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        inUseService={poolTableQuery.data?.data[0]?.dhcpId}
      />
      <Tabs
        onChange={onTabChange}
        defaultActiveKey='pools'
        activeKey={activeSubTab}
        tabBarExtraContent={tabBarExtraContent}
        type='card'
      >
        {Object.keys(tabs)
          .map((key) =>
            <Tabs.TabPane tab={tabs[key as keyof typeof tabs].title} key={key}>
              {tabs[key as keyof typeof tabs].content}
            </Tabs.TabPane>)}
      </Tabs>
    </>
  )
}

export default EdgeDhcp
