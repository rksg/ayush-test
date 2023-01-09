
import { Loader, Tabs }                          from '@acx-ui/components'
import { useGetPortConfigQuery }                 from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { getIntl }                               from '@acx-ui/utils'

import PortsGeneral from './PortsGeneral'
import SubInterface from './SubInterface'

const { $t } = getIntl()

const Ports = () => {

  const navigate = useNavigate()
  const { activeSubTab, serialNumber } = useParams()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/edit/ports`)
  const { data, isLoading } = useGetPortConfigQuery({ params: { serialNumber: serialNumber } })

  const tabs = {
    'ports-general': {
      title: $t({ defaultMessage: 'Ports General' }),
      content: <PortsGeneral data={data?.ports || []} />
    },
    'sub-interface': {
      title: $t({ defaultMessage: 'Sub-interface' }),
      content: <SubInterface data={data?.ports || []} />
    }
  }

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    <Tabs
      onChange={onTabChange}
      defaultActiveKey='ports-general'
      activeKey={activeSubTab}
      type='card'
    >
      {Object.keys(tabs)
        .map((key) =>
          <Tabs.TabPane tab={tabs[key as keyof typeof tabs].title} key={key}>
            <Loader states={[{ isLoading: isLoading, isFetching: false }]}>
              {tabs[key as keyof typeof tabs].content}
            </Loader>
          </Tabs.TabPane>)}
    </Tabs>
  )
}

export default Ports