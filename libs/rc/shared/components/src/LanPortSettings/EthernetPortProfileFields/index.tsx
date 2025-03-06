import { useEffect, useMemo, useState } from 'react'

import { Form, Select, Space } from 'antd'
import { DefaultOptionType }   from 'antd/lib/select'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import {
  useGetEthernetPortProfilesTemplateWithOverwritesQuery,
  useGetEthernetPortProfilesWithOverwritesQuery
} from '@acx-ui/rc/services'
import {
  CapabilitiesApModel,
  EthernetPortAuthType,
  EthernetPortProfileViewData,
  EthernetPortType,
  LanPort,
  useConfigTemplate,
  useConfigTemplateQueryFnSwitcher
} from '@acx-ui/rc/utils'

import EthernetPortProfileDrawer from './EthernetPortProfileDrawer'
import EthernetPortProfileInput  from './EthernetPortProfileInput'

interface EthernetPortProfileFieldsProps {
    index: number,
    isEthernetPortEnabled: boolean,
    selectedPortCaps: LanPort,
    selectedModelCaps: CapabilitiesApModel,
    disabled?: boolean,
    isDhcpEnabled?: boolean,
    hasVni?: boolean,
    readOnly?: boolean,
    useVenueSettings?: boolean,
    serialNumber?: string,
    venueId?: string,
    onGUIChanged?: (fieldName: string) => void,
    onEthernetPortProfileChanged?: (data: EthernetPortProfileViewData) => void
}

const EthernetPortProfileFields = (props:EthernetPortProfileFieldsProps) => {
  const {
    index,
    isDhcpEnabled,
    hasVni,
    readOnly,
    serialNumber,
    onGUIChanged,
    isEthernetPortEnabled,
    selectedModelCaps,
    selectedPortCaps,
    venueId,
    useVenueSettings=false,
    onEthernetPortProfileChanged
  } = props
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const params = useParams()
  const { isTemplate } = useConfigTemplate()

  const ethernetPortProfileId = Form.useWatch( ['lan', index, 'ethernetPortProfileId'] ,form)
  const [ethernetProfileCreateId, setEthernetProfileCreateId] = useState<String>()
  const [currentEthernetPortData, setCurrentEthernetPortData] =
    useState<EthernetPortProfileViewData>()

  const payload = {
    fields: [
      'id','name','isDefault','type','untagId','vlanMembers','authType','authRadiusId',
      'accountingRadiusId','bypassMacAddressAuthentication','supplicantAuthenticationOptions',
      'dynamicVlanEnabled','unauthenticatedGuestVlan','enableAuthProxy','enableAccountingProxy',
      'apSerialNumbers','venueIds','venueActivations','apActivations','apPortOverwrites','vni'
    ],
    sortField: 'name',
    sortOrder: 'ASC',
    pageSize: 1000
  }

  const getEthPortsWithOverwrites = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetEthernetPortProfilesWithOverwritesQuery,
    useTemplateQueryFn: useGetEthernetPortProfilesTemplateWithOverwritesQuery,
    enableRbac: true,
    extraParams: { ...params, venueId },
    payload,
    extraQueryArgs: { selectedModelCaps }
  })

  const {
    ethernetPortDropdownItems,
    ethernetPortListQuery,
    isLoading: isLoadingEthPortList
  } = useMemo(() => {
    const { data: queryResult, ...rest } = getEthPortsWithOverwrites

    return {
      ethernetPortDropdownItems: (queryResult)?
        convertEthernetPortListToDropdownItems(
          queryResult.data, selectedModelCaps, selectedPortCaps
        ) : [],
      ethernetPortListQuery: queryResult,
      ...rest
    }

  }, [getEthPortsWithOverwrites, selectedModelCaps, selectedPortCaps])

  useEffect(()=> {
    if (!isLoadingEthPortList && ethernetPortListQuery?.data) {
      const ethProfile = ethernetPortListQuery.data.find((profile)=> ethernetProfileCreateId ?
        profile.id === ethernetProfileCreateId : profile.id === ethernetPortProfileId)

      setCurrentEthernetPortData(ethProfile)
      if (ethProfile && ethernetProfileCreateId) {
        form.setFieldValue(['lan', index, 'ethernetPortProfileId'], ethernetProfileCreateId)
        setEthernetProfileCreateId(undefined)
      }
    }
  }, [ethernetPortProfileId, ethernetPortListQuery?.data])

  useEffect(() => {
    if (currentEthernetPortData) {
      onEthernetPortProfileChanged?.(currentEthernetPortData)
    }
  }, [currentEthernetPortData])

  return (
    <>
      {(hasVni ? <Form.Item name={['lan', index, 'ethernetPortProfileId']} hidden/> :
        <Space>
          <Form.Item
            name={['lan', index, 'ethernetPortProfileId']}
            label={$t({ defaultMessage: 'Ethernet Port Profile' })}
            children={
              <Select
                disabled={readOnly
                            || isDhcpEnabled
                            || !isEthernetPortEnabled
                            || hasVni}
                options={ethernetPortDropdownItems}
                style={{ width: '260px' }}
                onChange={() => onGUIChanged?.('ethernetPortProfileId')}
              />
            }
          />
          <EthernetPortProfileDrawer
            updateInstance={(createId) => {
              onGUIChanged?.('ethernetPortProfileId')
              setEthernetProfileCreateId(createId)
            }}
            disabled={isDhcpEnabled}
            addBtnVisible={!useVenueSettings}
            currentEthernetPortData={currentEthernetPortData} />
        </Space>
      )}
      {!isTemplate && <EthernetPortProfileInput
        currentEthernetPortData={currentEthernetPortData}
        currentIndex={index}
        onGUIChanged={onGUIChanged}
        isEditable={!readOnly && !!serialNumber && !isDhcpEnabled} />
      }
    </>
  )
}

export const convertEthernetPortListToDropdownItems = (
  ethernetPortList: EthernetPortProfileViewData[],
  selectedModelCaps: CapabilitiesApModel,
  selectedPortCaps: LanPort
): DefaultOptionType[] => {
  return ethernetPortList.filter((m) => {
    // A profile with VNI configuration is hidden and should not be accessible
    if(m.vni) {
      return false
    }
    // Not allow port-based ethernet port when LAN port is single port
    if(selectedModelCaps.lanPorts.length === 1 &&
        m.authType === EthernetPortAuthType.PORT_BASED) {
      return false
    }

    return !(selectedPortCaps.trunkPortOnly && m.type !== EthernetPortType.TRUNK)
  })
    .map(m => ({ label: m.name, value: m.id })) ?? []
}

export default EthernetPortProfileFields
