import { useContext, useEffect, useRef, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space }     from 'antd'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'
import { useParams }                                from 'react-router-dom'

import { Loader, StepsFormLegacy, StepsFormLegacyInstance, showActionModal, AnchorContext } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                           from '@acx-ui/feature-toggle'
import {
  useGetApMeshSettingsQuery,
  useGetVenueMeshQuery,
  useLazyGetMeshUplinkApsQuery,
  useUpdateApMeshSettingsMutation
} from '@acx-ui/rc/services'
import { APMeshSettings, MeshApNeighbor, MeshModeEnum, UplinkModeEnum } from '@acx-ui/rc/utils'
import { TenantLink }                                                   from '@acx-ui/react-router-dom'


import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'

import { MeshUplinkApsTable }                                        from './MeshUplinkApsTable'
import { NoUplinkAPInfo, RadioDescription, VenueMeshNotEnabledInfo } from './styledComponents'

const meshModes = [
  {
    value: MeshModeEnum.AUTO,
    display: defineMessage({ defaultMessage: 'Auto' }) ,
    description: defineMessage({ defaultMessage: 'Mesh role is assigned automatically' })
  }, {
    value: MeshModeEnum.ROOT,
    display: defineMessage({ defaultMessage: 'Root AP' }) ,
    description: defineMessage({ defaultMessage: 'Only runs as Root AP' })
  }, {
    value: MeshModeEnum.MESH,
    display: defineMessage({ defaultMessage: 'Mesh AP' }) ,
    description: defineMessage({ defaultMessage: 'Only runs as Mesh AP' })
  }, {
    value: MeshModeEnum.DISABLED,
    display: defineMessage({ defaultMessage: 'None' }) ,
    description: defineMessage({ defaultMessage: 'Mesh is disabled' })
  }
]

const uplinkModes = [
  {
    value: UplinkModeEnum.SMART,
    display: defineMessage({ defaultMessage: 'Mesh APs automatically select the best uplink' })
  }, {
    value: UplinkModeEnum.MANUAL,
    display: defineMessage({ defaultMessage: 'Select Uplink AP Manually' })
  }
]

const useApMeshSettingsData = (venueId: string | undefined) => {
  const { serialNumber } = useParams()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)

  const { data: venueMeshSettings } = useGetVenueMeshQuery({
    params: { venueId } },
  { skip: !isWifiRbacEnabled })

  let venueMeshEnabled = venueMeshSettings?.enabled

  const getApMesh = useGetApMeshSettingsQuery({
    params: { venueId, serialNumber },
    enableRbac: isWifiRbacEnabled
    // should skip request when venueMeshEnabled === false and using v1 API
  }, { skip: !venueMeshEnabled && isWifiRbacEnabled })

  // get venueMeshEnabled from ApMeshSettings when using non-RBAC API
  if (!isWifiRbacEnabled)
    venueMeshEnabled = getApMesh?.data?.venueMeshEnabled

  return {
    enabled: venueMeshEnabled,
    data: getApMesh.data
  }
}

function SettingMessage () {
  const { venueData: venue } = useContext(ApDataContext)

  return <VenueMeshNotEnabledInfo>
    {<FormattedMessage
    // eslint-disable-next-line max-len
      defaultMessage={'Mesh is not enabled at the <venueSingular></venueSingular> where this AP is installed in (<venuelink></venuelink>). When mesh is enabled at the <venueSingular></venueSingular>, you will be able to set the AP\'s mesh role and select the uplink AP.'}
      values={{
        venuelink: () => venue?
          <TenantLink
            to={`venues/${venue.id}/edit/wifi/networking#Mesh-Network`}>{venue?.name}
          </TenantLink>: ''
      }} />
    }
  </VenueMeshNotEnabledInfo>
}

export function ApMesh (props: ApEditItemProps) {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const { isAllowEdit=true } = props

  const enableRbac = useIsSplitOn(Features.WIFI_RBAC_API)

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(ApEditContext)

  const { venueData } = useContext(ApDataContext)
  const venueId = venueData?.id
  const { setReadyToScroll } = useContext(AnchorContext)
  const venueMeshSettings = useApMeshSettingsData(venueId)
  const venueMeshEnabled: boolean = !!venueMeshSettings?.enabled

  const [updateApMesh, { isLoading: isUpdateingApMesh } ] = useUpdateApMeshSettingsMutation()
  const [getMeshUplinkAps] = useLazyGetMeshUplinkApsQuery()

  const formRef = useRef<StepsFormLegacyInstance<APMeshSettings>>()
  const uplinkMacRef = useRef<string[]>()

  const [formInitializing, setFormInitializing] = useState(true)
  const [initData, setInitData] = useState({} as APMeshSettings)
  const [meshUplinkAps, setMeshUplinkAps] = useState([] as MeshApNeighbor[])
  const [meshMode, setMeshMode] = useState(MeshModeEnum.AUTO)
  const [uplinkMode, setUplinkMode] = useState(UplinkModeEnum.SMART)
  const [uplinkMac, setUplinkMac] = useState<string[] | undefined>()

  const updateStates = (data: APMeshSettings) => {
    const {
      meshMode,
      uplinkMode=UplinkModeEnum.SMART,
      uplinkMacAddresses
    } = data

    setMeshMode(meshMode)
    setUplinkMode(uplinkMode)
    setUplinkMac(uplinkMacAddresses)
    uplinkMacRef.current = uplinkMacAddresses
  }

  useEffect(() => {
    const meshData = venueMeshSettings.data
    if (venueMeshSettings.enabled === false) {
      setFormInitializing(false)
      return
    }

    if (venueId && meshData) {
      const setData = async () => {
        // get mesh uplink APs
        const params = { tenantId, serialNumber }
        const fields = enableRbac
          ? ['name', 'status', 'meshStatus.neighbors', 'healthStatus', 'venueId', 'serialNumber']
          : ['name', 'deviceStatus', 'neighbors', 'venueId', 'serialNumber']
        const payload = {
          fields: fields,
          filters: {
            venueId: [venueId],
            serialNumber: [serialNumber]
          },
          pageSize: 100,
          page: 1
        }

        const uplinkAp = (await getMeshUplinkAps({ params, payload, enableRbac }, true).unwrap())
        setMeshUplinkAps(uplinkAp.neighbors)

        updateStates(meshData)
        setInitData(meshData)
        setFormInitializing(false)

        setReadyToScroll?.(r => [...(new Set(r.concat('Mesh')))])
      }

      setData()
    }

  }, [venueId, venueMeshSettings.data, venueMeshSettings.enabled])

  const handleUpdateApMesh = async (formData: APMeshSettings) => {
    try {

      const { meshMode: formMeshMode, uplinkMode: formUplinkMode } = formData
      let payload = {
        ...formData
      }

      if (formUplinkMode === UplinkModeEnum.MANUAL &&
          (formMeshMode === MeshModeEnum.AUTO || formMeshMode === MeshModeEnum.MESH)) {
        const selectUplinkMac = uplinkMacRef.current
        if (selectUplinkMac && selectUplinkMac.length > 0) {
          payload = {
            ...formData,
            uplinkMacAddresses: selectUplinkMac
          }
        } else {
          showActionModal({
            type: 'error',
            title: $t({ defaultMessage: 'No Uplink Selected' }),
            content: $t({
              // eslint-disable-next-line max-len
              defaultMessage: 'For manual uplink configuration, you must select at least one uplink access point from the list before you may apply your changes'
            })
          })
          return
        }
      }

      await updateApMesh({ params: { venueId, serialNumber }, payload, enableRbac }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const updateEditContext = (form: StepsFormLegacyInstance, isDirty: boolean) => {
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networking',
      tabTitle: $t({ defaultMessage: 'Networking' }),
      isDirty: isDirty
    })

    setEditNetworkingContextData && setEditNetworkingContextData({
      ...editNetworkingContextData,
      updateMesh: () => handleUpdateApMesh(form?.getFieldsValue()),
      discardMeshChanges: () => handleDiscard()
    })
  }

  const handleDiscard = () => {
    formRef?.current?.setFieldsValue(initData)
  }

  const handleChange = () => {
    updateEditContext(formRef?.current as StepsFormLegacyInstance, true)
  }

  const onMeshModeChanged = (e: RadioChangeEvent) => {
    setMeshMode(e.target.value)
  }

  const onUplinkModeChanged= (e: RadioChangeEvent) => {
    setUplinkMode(e.target.value)
  }

  const handleUplinkSelectChanged = (checked: boolean, mac: string) => {
    let selectMac
    if (uplinkMac) {
      if (checked) {
        selectMac = [...uplinkMac, mac]
      } else {
        selectMac = uplinkMac.filter(uMac => uMac !== mac)
      }
    } else if (checked) {
      selectMac = [ mac ]
    }

    setUplinkMac(selectMac)
    uplinkMacRef.current = selectMac

    formRef?.current?.setFieldValue('uplinkMac', uplinkMac)
    handleChange()
  }

  return (<Loader states={[{
    isLoading: formInitializing,
    isFetching: isUpdateingApMesh
  }]}>
    <StepsFormLegacy
      formRef={formRef}
      onFormChange={handleChange}
    >
      <StepsFormLegacy.StepForm initialValues={initData}>
        {venueMeshEnabled
          ? <>
            <Form.Item
              name='meshMode'
              label={$t({ defaultMessage: 'Mesh Role' })}
              rules={[{ required: true }]}
            >
              <Radio.Group disabled={!isAllowEdit} onChange={onMeshModeChanged}>
                <Space direction='vertical'>
                  {meshModes.map(({ value, display, description }) => (
                    <Radio key={value} value={value}>
                      {$t(display)}
                      <RadioDescription>
                        {$t(description)}
                      </RadioDescription>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>
            {(meshMode === MeshModeEnum.AUTO || meshMode === MeshModeEnum.MESH) &&
          <>
            <Form.Item
              name='uplinkMode'
              label={$t({ defaultMessage: 'Uplink Selection' })}>
              <Radio.Group disabled={!isAllowEdit} onChange={onUplinkModeChanged}>
                <Space direction='vertical'>
                  {uplinkModes.map(({ value, display }) => (
                    <Radio key={value} value={value}>{$t(display)}</Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>
            {uplinkMode === UplinkModeEnum.MANUAL &&
            <div style={{ width: '455px' }}>
              { meshUplinkAps?.length > 0 ?
                <MeshUplinkApsTable
                  disabled={!isAllowEdit}
                  tableData={meshUplinkAps}
                  selected={uplinkMac}
                  onSelectChanged={handleUplinkSelectChanged}
                />
                :
                <NoUplinkAPInfo>
                  {$t({ defaultMessage: 'No uplink APs detected' })}
                </NoUplinkAPInfo>
              }
            </div>
            }
          </>
            }
          </>
          : <SettingMessage />
        }
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </Loader>)
}

