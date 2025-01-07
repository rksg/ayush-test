import { createContext, useContext, useEffect, useState } from 'react'

import { Features, useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { EditPortDrawer, SwitchLagModal }                                  from '@acx-ui/rc/components'
import { useGetFlexAuthenticationProfilesQuery }                           from '@acx-ui/rc/services'
import { Lag, StackMember, SwitchPortStatus, SwitchRow, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { useParams }                                                       from '@acx-ui/react-router-dom'

import { SwitchDetailsContext } from '../../..'

import { FrontViewBreakoutPortDrawer } from './FrontViewBreakoutPortDrawer'
import * as UI                         from './styledComponents'
import { Unit }                        from './Unit'

interface SlotMember {
  isStack: boolean
  data: StackMember[]
}

export interface SwitchPanel {
  editPortDrawerVisible: boolean
  setEditPortDrawerVisible: (data: boolean) => void
  breakoutPortDrawerVisible: boolean
  setBreakoutPortDrawerVisible: (data: boolean) => void
  editBreakoutPortDrawerVisible: boolean
  setEditBreakoutPortDrawerVisible: (data: boolean) => void
  selectedPorts: SwitchPortStatus[]
  setSelectedPorts: (data: SwitchPortStatus[]) => void
  breakoutPorts: SwitchPortStatus[]
  setBreakoutPorts: (data: SwitchPortStatus[]) => void
  editLagModalVisible: boolean
  setEditLagModalVisible: (data: boolean) => void
  editLag: Lag[]
  setEditLag: (data: Lag[]) => void
}

export const SwitchPanelContext = createContext({} as SwitchPanel)

export function SwitchFrontRearView (props:{
  stackMember: StackMember[]
}) {
  const { stackMember } = props
  const params = useParams()
  const [editPortDrawerVisible, setEditPortDrawerVisible] = useState(false)
  const [breakoutPortDrawerVisible, setBreakoutPortDrawerVisible] = useState(false)
  const [editBreakoutPortDrawerVisible, setEditBreakoutPortDrawerVisible] = useState(false)
  const [editLagModalVisible, setEditLagModalVisible] = useState(false)
  const [editLag, setEditLag] = useState([] as Lag[])
  const [selectedPorts, setSelectedPorts] = useState([] as SwitchPortStatus[])
  const [breakoutPorts, setBreakoutPorts] = useState([] as SwitchPortStatus[])
  const { serialNumber } = params
  const { switchDetailsContextData } = useContext(SwitchDetailsContext)
  const { switchDetailHeader: switchDetail } = switchDetailsContextData
  const [ slotMember, setSlotMember ] = useState(null as unknown as SlotMember)
  const [ switchList, setSwitchList ] = useState([] as SwitchRow[])
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)

  useEffect(() => {
    if (stackMember && switchDetail) {
      setSwitchList([{
        id: switchDetail.id, firmware: switchDetail?.firmware
      }] as SwitchRow[])
      genSlotViewData()
    }
  }, [stackMember, switchDetail])

  const { authenticationProfiles } = useGetFlexAuthenticationProfilesQuery({
    payload: {
      pageSize: 10000,
      sortField: 'profileName',
      sortOrder: 'ASC'
    }
  }, {
    skip: !isSwitchFlexAuthEnabled,
    selectFromResult: ( { data } ) => ({
      authenticationProfiles: data?.data
    })
  })

  const genSlotViewData = () => {
    if (switchDetail.isStack || switchDetail.formStacking) {
      setSlotMember({
        isStack: true,
        data: stackMember
      })
    } else {
      setSlotMember({
        isStack: false,
        data: [{
          deviceStatus: switchDetail.deviceStatus,
          id: serialNumber,
          model: switchDetail.model,
          serialNumber: switchDetail.serialNumber,
          switchMac: switchDetail.switchMac,
          unitId: switchDetail.unitId || 1,
          unitStatus: '',
          uptime: switchDetail.uptime,
          venueName: switchDetail.venueName
        } as unknown as StackMember]
      })
    }
  }

  return <SwitchPanelContext.Provider value={{
    editPortDrawerVisible,
    setEditPortDrawerVisible,
    breakoutPortDrawerVisible,
    setBreakoutPortDrawerVisible,
    editBreakoutPortDrawerVisible,
    setEditBreakoutPortDrawerVisible,
    selectedPorts,
    setSelectedPorts,
    editLagModalVisible,
    setEditLagModalVisible,
    editLag,
    setEditLag,
    breakoutPorts,
    setBreakoutPorts
  }}>
    {
      slotMember && slotMember.data.map((member, index) => (
        <UI.SwitchFrontRearViewWrapper key={index}>
          <Unit member={member}
            index={index}
            isStack={slotMember.isStack}
            isOnline={member.deviceStatus === SwitchStatusEnum.OPERATIONAL ||
              member.deviceStatus === SwitchStatusEnum.FIRMWARE_UPD_FAIL} />
        </UI.SwitchFrontRearViewWrapper>
      ))
    }
    { editPortDrawerVisible && <EditPortDrawer
      key='edit-port'
      visible={editPortDrawerVisible}
      setDrawerVisible={setEditPortDrawerVisible}
      isCloudPort={selectedPorts.map(item => item.cloudPort).includes(true)}
      isMultipleEdit={selectedPorts?.length > 1}
      isVenueLevel={false}
      selectedPorts={selectedPorts}
      switchList={switchList}
      authProfiles={authenticationProfiles}
    />
    }

    { editLagModalVisible && <SwitchLagModal
      isEditMode={true}
      editData={editLag}
      visible={editLagModalVisible}
      setVisible={setEditLagModalVisible}
      type='drawer'
    />
    }
    {
      breakoutPorts && <FrontViewBreakoutPortDrawer
        portNumber={breakoutPorts[0]?.portIdentifier.split(':')[0]}
        setDrawerVisible={setBreakoutPortDrawerVisible}
        drawerVisible={breakoutPortDrawerVisible}
        breakoutPorts={breakoutPorts}
      />
    }
    { editBreakoutPortDrawerVisible && <EditPortDrawer
      key='edit-breakout-port'
      visible={editBreakoutPortDrawerVisible}
      setDrawerVisible={setEditBreakoutPortDrawerVisible}
      isCloudPort={selectedPorts.map(item => item.cloudPort).includes(true)}
      isMultipleEdit={selectedPorts?.length > 1}
      isVenueLevel={false}
      selectedPorts={selectedPorts}
      switchList={switchList}
      authProfiles={authenticationProfiles}
      onBackClick={() => {
        setBreakoutPortDrawerVisible(true)
        setSelectedPorts([])
      }}
    />
    }
  </SwitchPanelContext.Provider>
}
