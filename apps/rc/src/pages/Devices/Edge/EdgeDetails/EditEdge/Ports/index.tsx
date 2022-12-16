import { createContext, useEffect, useState } from 'react'

import { Tabs }                                  from '@acx-ui/components'
import { EdgePortConfig, EdgePortTypeEnum }      from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { getIntl }                               from '@acx-ui/utils'

import PortsGeneral from './PortsGeneral'
import SubInterface from './SubInterface'

interface PortsContextType {
  ports: EdgePortConfig[]
  setPorts: React.Dispatch<React.SetStateAction<EdgePortConfig[]>>
}

const { $t } = getIntl()

const tabs = {
  'ports-general': {
    title: $t({ defaultMessage: 'Ports General' }),
    content: <PortsGeneral />
  },
  'sub-interface': {
    title: $t({ defaultMessage: 'Sub-interface' }),
    content: <SubInterface />
  }
}

const Ports = () => {

  const navigate = useNavigate()
  const { activeSubTab, serialNumber } = useParams()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/edit/ports`)
  const [ports, setPorts] = useState<EdgePortConfig[]>([])

  useEffect(() => {
    setPorts([
      {
        id: 'port_1',
        portType: EdgePortTypeEnum.WAN,
        name: 'port 1',
        mac: 'AA:AA:AA:AA:AA:AA',
        enabled: true,
        ipMode: 'STATIC',
        ip: '1.1.1.1',
        subnet: '2.2.2.2',
        gateway: '3.3.3.3',
        natEnabled: true
      },
      {
        id: 'port_2',
        portType: EdgePortTypeEnum.LAN,
        name: 'port 2',
        mac: 'BB:BB:BB:BB:BB:BB',
        enabled: true,
        ipMode: 'STATIC',
        ip: '4.4.4.4',
        subnet: '5.5.5.5',
        gateway: '6.6.6.6',
        natEnabled: true
      },
      {
        id: 'port_3',
        portType: EdgePortTypeEnum.UNSPECIFIED,
        name: 'port 3',
        mac: 'CC:CC:CC:CC:CC:CC',
        enabled: true,
        ipMode: 'STATIC',
        ip: '7.7.7.7',
        subnet: '8.8.8.8',
        gateway: '9.9.9.9',
        natEnabled: true
      }
    ])
  }, [])

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    <PortsContext.Provider value={{ ports, setPorts }}>
      <Tabs
        onChange={onTabChange}
        defaultActiveKey='ports'
        activeKey={activeSubTab}
        type='card'
      >
        {Object.keys(tabs)
          .map((key) =>
            <Tabs.TabPane tab={tabs[key as keyof typeof tabs].title} key={key}>
              {tabs[key as keyof typeof tabs].content}
            </Tabs.TabPane>)}
      </Tabs>
    </PortsContext.Provider>
  )
}

export const PortsContext = createContext<PortsContextType>({} as PortsContextType)

export default Ports