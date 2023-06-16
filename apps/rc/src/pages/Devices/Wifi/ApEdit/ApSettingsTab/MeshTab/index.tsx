import { useContext, useEffect, useRef, useState } from 'react'

import { Form, Radio, RadioChangeEvent, Space }     from 'antd'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'
import { useNavigate, useParams }                   from 'react-router-dom'

import { Loader, StepsFormLegacy, StepsFormLegacyInstance, showActionModal }                                              from '@acx-ui/components'
import { useGetApMeshSettingsQuery, useLazyGetMeshUplinkApsQuery, useLazyGetVenueQuery, useUpdateApMeshSettingsMutation } from '@acx-ui/rc/services'
import { APMeshSettings, MeshApNeighbor, MeshModeEnum, UplinkModeEnum, VenueExtended, redirectPreviousPage }              from '@acx-ui/rc/utils'
import { TenantLink, useTenantLink }                                                                                      from '@acx-ui/react-router-dom'

import { ApDataContext } from '..'
import { ApEditContext } from '../..'

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

export function ApMesh () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/')

  const { editContextData, setEditContextData, previousPath } = useContext(ApEditContext)
  const { apData: apDetails } = useContext(ApDataContext)

  const getApMesh = useGetApMeshSettingsQuery({ params: { serialNumber } })
  const [updateApMesh, { isLoading: isUpdateingApMesh } ] = useUpdateApMeshSettingsMutation()
  const [getVenue] = useLazyGetVenueQuery()
  const [getMeshUplinkAps] = useLazyGetMeshUplinkApsQuery()

  const formRef = useRef<StepsFormLegacyInstance<APMeshSettings>>()
  const [formInitializing, setFormInitializing] = useState(true)
  const [initData, setInitData] = useState({} as APMeshSettings)
  const [venue, setVenue] = useState({} as VenueExtended)
  const [meshUplinkAps, setMeshUplinkAps] = useState([] as MeshApNeighbor[])
  const [venueMeshEnabled, setVenueMeshEnabled] = useState(false)
  const [meshMode, setMeshMode] = useState(MeshModeEnum.AUTO)
  const [uplinkMode, setUplinkMode] = useState(UplinkModeEnum.SMART)
  const [uplinkMac, setUplinkMac] = useState<string[] | undefined>()

  useEffect(() => {
    const meshData = getApMesh?.data
    if (apDetails && meshData) {
      const venueId = apDetails.venueId
      const setData = async () => {
        // get venue data
        const venue = (await getVenue({
          params: { tenantId, venueId } }, true).unwrap())
        setVenue(venue)


        // get mesh uplink APs
        const params = { tenantId, serialNumber }
        const payload = {
          fields: ['name', 'deviceStatus', 'neighbors'],
          filters: {
            venueId: [venueId],
            serialNumber: [serialNumber]
          },
          pageSize: 100,
          page: 1
        }

        const uplinkAp = (await getMeshUplinkAps({ params, payload }, true).unwrap())
        setMeshUplinkAps(uplinkAp.neighbors)


        // mesh data
        const {
          venueMeshEnabled=false,
          meshMode,
          uplinkMode=UplinkModeEnum.SMART,
          uplinkMacAddresses
        } = meshData

        setVenueMeshEnabled(venueMeshEnabled)
        setMeshMode(meshMode)
        setUplinkMode(uplinkMode)
        setInitData(meshData)
        setFormInitializing(false)
        setUplinkMac(uplinkMacAddresses)
      }

      setData()
    }

  }, [apDetails, getApMesh?.data])

  const handleUpdateApMesh = async (values: APMeshSettings) => {
    try {
      setEditContextData && setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })

      let payload = {
        ...values
      }

      if (uplinkMode === UplinkModeEnum.MANUAL &&
          (meshMode === MeshModeEnum.AUTO || meshMode === MeshModeEnum.MESH)) {
        if (uplinkMac && uplinkMac.length > 0) {
          payload = {
            ...values,
            uplinkMacAddresses: uplinkMac
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

      await updateApMesh({
        params: { serialNumber },
        payload
      }).unwrap()

    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const updateEditContext = (form: StepsFormLegacyInstance, isDirty: boolean) => {
    setEditContextData && setEditContextData({
      ...editContextData,
      tabTitle: $t({ defaultMessage: 'Mesh' }),
      isDirty: isDirty,
      updateChanges: () => handleUpdateApMesh(form?.getFieldsValue()),
      discardChanges: () => handleDiscard()
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
    if (uplinkMac) {
      if (checked) {
        setUplinkMac([...uplinkMac, mac])
      } else {
        setUplinkMac(uplinkMac.filter(uMac => uMac !== mac))
      }
    } else if (checked) {
      setUplinkMac([ mac ])
    }

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
      onFinish={handleUpdateApMesh}
      onCancel={() =>
        redirectPreviousPage(navigate, previousPath, basePath)
      }
      buttonLabel={{
        submit: $t({ defaultMessage: 'Apply' })
      }}
    >
      <StepsFormLegacy.StepForm initialValues={initData}>
        {venueMeshEnabled? <>
          <Form.Item
            name='meshMode'
            label={$t({ defaultMessage: 'Mesh Role' })}
            rules={[{ required: true }]}
          >
            <Radio.Group onChange={onMeshModeChanged}>
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
              <Radio.Group onChange={onUplinkModeChanged}>
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

        </> : <VenueMeshNotEnabledInfo>
          {<FormattedMessage
            // eslint-disable-next-line max-len
            defaultMessage={'Mesh is not enabled at the venue where this AP is installed in (<venuelink></venuelink>). When mesh is enabled at the venue, you will be able to set the AP\'s mesh role and select the uplink AP.'}
            values={{
              venuelink: () => venue?
                <TenantLink
                  to={`venues/${venue.id}/edit/wifi/networking#Mesh-Network`}>{venue?.name}
                </TenantLink>: ''
            }} />
          }
        </VenueMeshNotEnabledInfo>
        }
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </Loader>)
}
