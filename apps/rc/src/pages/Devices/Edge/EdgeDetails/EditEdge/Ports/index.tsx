import { createContext, useEffect, useState } from 'react'

import { Loader, Tabs }                          from '@acx-ui/components'
import { useGetPortConfigQuery }                 from '@acx-ui/rc/services'
import { EdgePort }                              from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { getIntl }                               from '@acx-ui/utils'

import PortsGeneral from './PortsGeneral'
import SubInterface from './SubInterface'

interface PortsContextType {
  ports: EdgePort[]
  setPorts: React.Dispatch<React.SetStateAction<EdgePort[]>>
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
  const [ports, setPorts] = useState<EdgePort[]>([])
  const { data, isLoading } = useGetPortConfigQuery({ params: { serialNumber: serialNumber } })

  useEffect(() => {
    if(data) {
      setPorts(data.ports)
    }
  }, [data])

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
    </PortsContext.Provider>
  )
}

export const PortsContext = createContext<PortsContextType>({} as PortsContextType)

export default Ports