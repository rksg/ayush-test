import { createContext, useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Tabs, Tooltip }                                          from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                             from '@acx-ui/icons'
import { useGetApCapabilitiesQuery, useGetApQuery }               from '@acx-ui/rc/services'
import { ApDeep, ApModel }                                        from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                  from '@acx-ui/react-router-dom'
import { directedMulticastInfo }                                  from '@acx-ui/utils'

import { ApEditContext } from '../index'

import { ApSnmp }            from './ApSnmpTab'
import { DirectedMulticast } from './DirectedMulticast'
//import { ApExternalAntenna } from './ExternalAntenna/ApExternalAntenna'
import { IpSettings }    from './General/IpSettings'
import { LanPorts }      from './LanPorts'
import { MdnsProxyTab }  from './MdnsProxyTab/MdnsProxyTab'
import { ApMesh }        from './MeshTab'
import { RadioSettings } from './RadioTab/RadioSettings'


const { TabPane } = Tabs

export const ApDataContext = createContext({} as {
  apData?: ApDeep,
  apCapabilities?: ApModel
})

export function ApSettingsTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/wifi/${params.serialNumber}/edit/settings/`)
  const { editContextData, setEditContextData } = useContext(ApEditContext)
  const isServicesEnabled = useIsSplitOn(Features.SERVICES)
  const supportDirectedMulticast = useIsSplitOn(Features.DIRECTED_MULTICAST)
  const supportStaticIpSettings = useIsSplitOn(Features.AP_STATIC_IP)
  const supportApSnmp = useIsSplitOn(Features.AP_SNMP)

  const isTierAllowMeshEnhancement = useIsTierAllowed(TierFeatures.BETA_MESH)
  const isFeatureOnMeshEnhancement = useIsSplitOn(Features.MESH_ENHANCEMENTS)
  const supportMeshEnhancement = isTierAllowMeshEnhancement && isFeatureOnMeshEnhancement

  const getAp = useGetApQuery({ params })
  const getApCapabilities = useGetApCapabilitiesQuery({ params })

  const [apData, setApData] = useState<ApDeep>()
  const [apCapabilities, setApCapabilities] = useState<ApModel>()
  const [isSupportMesh, setIsSupportMesh] = useState(false)
  //const [hasExternalAntenna, setHasExternalAntenna] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const data = getAp?.data
    const modelName = data?.model
    const capabilities = getApCapabilities.data

    if (!isLoaded && modelName && capabilities) {
      const curApCapabilities = capabilities.apModels.find(cap => cap.model === modelName)

      setApData(data)
      setApCapabilities(curApCapabilities)
      //setHasExternalAntenna(!!(curApCapabilities?.externalAntenna))
      setIsSupportMesh(!!(curApCapabilities?.supportMesh))

      setIsLoaded(true)
    }

  }, [getAp?.data, getApCapabilities?.data, isLoaded])

  const onTabChange = (tab: string) => {
    setEditContextData && setEditContextData({
      ...editContextData,
      tabTitle: '',
      isDirty: false,
      hasError: false,
      updateChanges: () => {},
      discardChanges: () => {}
    })
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const tabTitleMap = (tabkey: string) => {
    const tabTitle = {
      general: $t({ defaultMessage: 'General' }),
      radio: $t({ defaultMessage: 'Radio' }),
      extAntenna: $t({ defaultMessage: 'External Antenna' }),
      lanPort: $t({ defaultMessage: 'LAN Port' }),
      proxy: $t({ defaultMessage: 'mDNS Proxy' }),
      multicast: $t({ defaultMessage: 'Directed Multicast' }),
      snmp: $t({ defaultMessage: 'AP SNMP' }),
      mesh: $t({ defaultMessage: 'Mesh' })
    }

    const title = tabTitle[tabkey as keyof typeof tabTitle]
    return editContextData?.isDirty && params?.activeSubTab === tabkey
      ? `${title} *` : title
  }

  return (
    <ApDataContext.Provider value={{
      apData,
      apCapabilities
    }}>
      <Tabs
        onChange={onTabChange}
        defaultActiveKey={supportStaticIpSettings? 'general' : 'radio'}
        activeKey={params.activeSubTab}
        type='card'
      >
        {supportStaticIpSettings &&
        <TabPane tab={tabTitleMap('general')} key='general'>
          <IpSettings />
        </TabPane>
        }
        <TabPane tab={tabTitleMap('radio')} key='radio'>
          <RadioSettings />
        </TabPane>
        {/*hasExternalAntenna &&
        <TabPane tab={tabTitleMap('extAntenna')} key='extAntenna'>
          <ApExternalAntenna />
        </TabPane>*/
        }
        <TabPane tab={tabTitleMap('lanPort')} key='lanPort'>
          <LanPorts />
        </TabPane>
        {isServicesEnabled ? <TabPane
          tab={tabTitleMap('proxy')}
          key='proxy'
          children={<MdnsProxyTab />}
        /> : null}
        {supportApSnmp &&
        <TabPane tab={tabTitleMap('snmp')} key='snmp'>
          <ApSnmp />
        </TabPane>
        }
        {supportDirectedMulticast &&
        <TabPane tab={<>
          {tabTitleMap('multicast')}
          <Tooltip title={$t(directedMulticastInfo)} placement='right'>
            <QuestionMarkCircleOutlined
              style={{ marginLeft: '8px', marginBottom: '-3px', height: '16px', width: '16px' }}/>
          </Tooltip>
        </>}
        key='multicast'>
          <DirectedMulticast />
        </TabPane>
        }
        {(supportMeshEnhancement && isSupportMesh) &&
        <TabPane tab={tabTitleMap('mesh')} key='mesh'>
          <ApMesh />
        </TabPane>
        }
      </Tabs>
    </ApDataContext.Provider>
  )
}
