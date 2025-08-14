/* eslint-disable max-len */
import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Radio, Row, Select, Space } from 'antd'
import { get, uniqBy }                          from 'lodash'
import { FormattedMessage, useIntl }            from 'react-intl'

import { AnchorContext, Loader, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import {
  useGetApGroupAntennaTypeQuery,
  useGetApGroupExternalAntennaQuery,
  useGetVenueAntennaTypeQuery,
  useGetVenueExternalAntennaQuery,
  useGetVenueTemplateExternalAntennaQuery,
  useUpdateApGroupAntennaTypeMutation,
  useUpdateApGroupExternalAntennaMutation
} from '@acx-ui/rc/services'
import {
  ApAntennaTypeEnum,
  ApGroupApExternalAntennaSettings,
  CapabilitiesApModel,
  ExternalAntenna,
  VenueApAntennaTypeSettings
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { ApAntennaTypeSelector }            from '../../ApAntennaTypeSelector'
import { ApExtAntennaForm }                 from '../../ApExtAntennaForm'
import {
  useApGroupConfigTemplateMutationFnSwitcher,
  useApGroupConfigTemplateQueryFnSwitcher
} from '../apGroupConfigTemplateApiSwitcher'
import ApModelPlaceholder     from '../assets/images/aps/ap-model-placeholder.png'
import { ApGroupEditContext } from '../context'

type ApGroupWifiConfigItemProps = {
  isAllowEdit?: boolean
}

export function ExternalAntennaSection (props: ApGroupWifiConfigItemProps) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { isAllowEdit=true } = props
  const imageTitle = $t({ defaultMessage: 'AP external Antenna image' })
  const supportAntennaTypeSelection = useIsSplitOn(Features.WIFI_ANTENNA_TYPE_TOGGLE)

  const params = useParams()
  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData,
    venueId,
    apGroupApCaps
  } = useContext(ApGroupEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const allApModelCapabilities = apGroupApCaps?.apModels

  const [handledApExternalAntennas, setHandledApExternalAntennas] = useState([] as ExternalAntenna[])
  const [selectOptions, setSelectOptions] = useState<{ label: string; value: string }[]>([])
  const [selectedApCapabilities, setSelectedApCapabilities] = useState(null as CapabilitiesApModel | null)
  const [apiSelectedApExternalAntenna, setApiSelectedApExternalAntenna] = useState(null as ExternalAntenna | null)
  const [selectedApExternalAntenna, setSelectedApExternalAntenna] = useState(null as ExternalAntenna | null)
  const [antennaTypeModels, setAntennaTypeModels] = useState([] as VenueApAntennaTypeSettings[])
  const [selectedApAntennaType, setSelectedApAntennaType] = useState(null as VenueApAntennaTypeSettings | null)
  const [useVenueSettings, setUseVenueSettings] = useState(true)
  const venueRef = useRef<ExternalAntenna[]>()

  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const { data: allVenueApExternalAntennas, isLoading: isLoadingExternalAntenna } =
    useApGroupConfigTemplateQueryFnSwitcher<ExternalAntenna[]>({
      useQueryFn: useGetVenueExternalAntennaQuery,
      useTemplateQueryFn: useGetVenueTemplateExternalAntennaQuery,
      enableRbac: isUseRbacApi,
      extraParams: { venueId },
      skip: !venueId
    })

  const { data: allApGroupApExternalAntennas, isLoading: isLoadingApGroupExternalAntenna } =
      useApGroupConfigTemplateQueryFnSwitcher<ApGroupApExternalAntennaSettings>({
        useQueryFn: useGetApGroupExternalAntennaQuery,
        useTemplateQueryFn: useGetApGroupExternalAntennaQuery,
        extraParams: { venueId },
        skip: !venueId
      })

  const [updateApGroupExternalAntenna, { isLoading: isUpdatingApGroupExternalAntenna }] =
      useApGroupConfigTemplateMutationFnSwitcher(
        useUpdateApGroupExternalAntennaMutation,
        useUpdateApGroupExternalAntennaMutation
      )

  const { data: antennaTypeSettings } = useGetVenueAntennaTypeQuery({
    params: { ...params, venueId },
    enableRbac: isUseRbacApi
  }, { skip: !supportAntennaTypeSelection })

  const { data: apGroupAntennaTypeSettings } = useGetApGroupAntennaTypeQuery({
    params: { ...params, venueId }
  })

  const [updateApGroupAntennaType, { isLoading: isUpdateApGroupAntennaType }] = useUpdateApGroupAntennaTypeMutation()

  const handleUpdateExternalAntenna = async (data: ExternalAntenna[]) => {
    showActionModal({
      type: 'confirm',
      width: 450,
      title: $t({ defaultMessage: 'External Antenna Settings Change' }),
      content:
      // eslint-disable-next-line max-len
        $t({ defaultMessage: 'Modifying the External Antenna settings will cause all Access Point (AP) devices in this AP Group to reboot. Are you sure you want to continue?' }),
      okText: $t({ defaultMessage: 'Continue' }),
      onOk: async () => {
        try {
          await updateApGroupExternalAntenna({
            params: { ...params, venueId },
            payload: {
              externalAntennaSettings: [ ...data ],
              useVenueSettings
            }
          })
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }
    })
  }

  const handleUpdateAntennaType = async (data: VenueApAntennaTypeSettings[]) => {
    showActionModal({
      type: 'confirm',
      width: 450,
      title: $t({ defaultMessage: 'Antenna Type Change' }),
      content:
      // eslint-disable-next-line max-len
        $t({ defaultMessage: 'Modifying the Antenna type will cause a reboot will cause a reboot of all AP devices within this <venueSingular></venueSingular>. Are you sure you want to continue?' }),
      okText: $t({ defaultMessage: 'Continue' }),
      onOk: async () => {
        try {
          await updateApGroupAntennaType({
            params: { ...params, venueId },
            payload: {
              antennaTypeSettings: [...data ],
              useVenueSettings
            }
          })
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
      }
    })
  }

  const filterModelCapabilities = (model: string) => {
    return allApModelCapabilities?.find(modelCapabilities => modelCapabilities.model === model) as unknown as CapabilitiesApModel
  }

  const handleAntennaSettingsChange = (apExternalAntennas: ExternalAntenna[]) => {
    apExternalAntennas.forEach((data:ExternalAntenna) => {
      const modelCapabilities = filterModelCapabilities(data.model)
      if (data.enable24G === false && data.gain24G === undefined) {
        data.gain24G = modelCapabilities?.externalAntenna?.gain24G || null
      }
      if (data.enable50G === false && data.gain50G === undefined) {
        data.gain50G = modelCapabilities?.externalAntenna?.gain50G || null
      }
      data.supportDisable = modelCapabilities?.externalAntenna?.supportDisable
      data.coupled = modelCapabilities?.externalAntenna?.coupled || undefined
    })
    setHandledApExternalAntennas(apExternalAntennas)
    let selectItems = apExternalAntennas.map((item:ExternalAntenna) => ({ label: item.model, value: item.model })) || []
    selectItems.unshift({ label: $t({ defaultMessage: 'No model selected' }), value: '' })

    if (supportAntennaTypeSelection && antennaTypeSettings && antennaTypeSettings.length > 0 && apGroupAntennaTypeSettings && apGroupAntennaTypeSettings.antennaTypeSettings.length > 0) {
      const antennaTypeSettingsUpdated = apGroupAntennaTypeSettings.useVenueSettings ? antennaTypeSettings : apGroupAntennaTypeSettings.antennaTypeSettings
      setAntennaTypeModels(antennaTypeSettingsUpdated)
      antennaTypeSettingsUpdated.forEach((item: VenueApAntennaTypeSettings) => {
        selectItems.push({ label: item.model, value: item.model })
      })
      uniqBy(selectItems, 'value')
    }

    setSelectOptions(selectItems)
    const anchorItemName = supportAntennaTypeSelection? 'Antenna' : 'External-Antenna'
    setReadyToScroll?.(r => [...(new Set(r.concat(anchorItemName)))])
  }

  useEffect(() => {
    if (allApModelCapabilities && allVenueApExternalAntennas && allApGroupApExternalAntennas && apGroupAntennaTypeSettings) {
      venueRef.current = allVenueApExternalAntennas
      const allApExternalAntennas = allApGroupApExternalAntennas.useVenueSettings ? allVenueApExternalAntennas : allApGroupApExternalAntennas.externalAntennaSettings
      const apExternalAntennas = JSON.parse(JSON.stringify(allApExternalAntennas))

      handleAntennaSettingsChange(apExternalAntennas)
    }
  }, [allApModelCapabilities, allVenueApExternalAntennas, allApGroupApExternalAntennas, supportAntennaTypeSelection, antennaTypeSettings, apGroupAntennaTypeSettings])

  useEffect(() => {
    const apModelsMap = {} as { [index: string]: ExternalAntenna }
    const antennaTypeModelsMap = {} as { [index: string]: VenueApAntennaTypeSettings }

    const externalAntennaLength = handledApExternalAntennas.length
    const antennaTypeModelsLength = antennaTypeModels.length

    if (handledApExternalAntennas.length) {
      handledApExternalAntennas.forEach((item:ExternalAntenna) => {
        apModelsMap[item.model] = item
      })
    }

    if (antennaTypeModels.length) {
      antennaTypeModels.forEach((item: VenueApAntennaTypeSettings) => {
        antennaTypeModelsMap[item.model] = item
      })
    }

    if (externalAntennaLength || antennaTypeModelsLength) {
      setEditRadioContextData({
        ...editRadioContextData,
        apiApModels: apModelsMap,
        apModels: apModelsMap,
        apModelAntennaTypes: antennaTypeModelsMap
      })
      initForm()
    }
  }, [handledApExternalAntennas, antennaTypeModels])

  useEffect(() => {
    if (allApGroupApExternalAntennas) {
      setUseVenueSettings(allApGroupApExternalAntennas.useVenueSettings)
      form.setFieldValue('useVenueOrApGroupSettingsExternalAntenna', allApGroupApExternalAntennas.useVenueSettings)
    }
  }, [allApGroupApExternalAntennas])

  const initForm = () => {
    setSelectedApExternalAntenna(null)
    setSelectedApCapabilities(null)
    setSelectedApAntennaType(null)
    form.setFieldsValue({
      external: {
        apModel: {
          selected: ''
        }
      }
    })
  }

  const displayVenueSettingOrApGroupAndCustomize = () => {
    return (
      <Row gutter={20}>
        <Col span={12}>
          <Space style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            paddingBottom: '20px' }}
          >
            <Form.Item
              name={['useVenueOrApGroupSettingsExternalAntenna']}
              initialValue={useVenueSettings}
              valuePropName='value'
              style={{ marginBottom: '35px', width: '300px' }}
              children={
                <Radio.Group
                  data-testid='apGroup-radioSettings'
                  disabled={!allApGroupApExternalAntennas}
                  onChange={(e) => {
                    setUseVenueSettings(e.target.value)
                    const allApExternalAntennas = e.target.value ? allVenueApExternalAntennas : allApGroupApExternalAntennas?.externalAntennaSettings
                    const apExternalAntennas = JSON.parse(JSON.stringify(allApExternalAntennas))
                    handleAntennaSettingsChange(apExternalAntennas)
                  }}
                >
                  <Space direction='vertical'>
                    <Radio value={true} data-testid='apGroup-useVenueSettings'>
                      <FormattedMessage
                        defaultMessage={'Use inherited settings from <VenueSingular></VenueSingular>'}
                      />
                    </Radio>
                    <Radio value={false} data-testid='apGroup-customize'>
                      <FormattedMessage
                        defaultMessage={'Customize settings'}
                      />
                    </Radio>
                  </Space>
                </Radio.Group>
              }
            />
          </Space>
        </Col>
      </Row>
    )
  }

  const onSelectModel = (currentModel: string) => {
    if (currentModel) {
      const apiModel = get(editRadioContextData?.apiApModels, currentModel) || null
      const findModel = get(editRadioContextData?.apModels, currentModel) || null
      const findAntennaTypeModel = get(editRadioContextData?.apModelAntennaTypes, currentModel) || null
      setApiSelectedApExternalAntenna(apiModel)
      setSelectedApExternalAntenna(findModel)
      setSelectedApCapabilities(filterModelCapabilities(currentModel))
      setSelectedApAntennaType(findAntennaTypeModel)
    } else {
      setSelectedApExternalAntenna(null)
      setSelectedApCapabilities(null)
      setSelectedApAntennaType(null)
    }
  }

  const handleExternalAntennasChanged = (newExtAntSettings: ExternalAntenna) => {
    const model = newExtAntSettings.model
    const apExtAntennaSettings = {
      ...editRadioContextData.apModels,
      [model]: newExtAntSettings
    }
    setEditRadioContextData({
      ...editRadioContextData,
      apModels: apExtAntennaSettings,
      updateExternalAntenna: handleUpdateExternalAntenna
    })

    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: true
    })
  }

  const handleAntennaTypesChanged = (newApModelAntennaTypes: VenueApAntennaTypeSettings | ApAntennaTypeEnum) => {
    const newAntTypes = (newApModelAntennaTypes as VenueApAntennaTypeSettings)
    const model = newAntTypes.model
    const apModelAntennaTypes = {
      ...editRadioContextData.apModelAntennaTypes,
      [model]: newAntTypes
    }
    setEditRadioContextData({
      ...editRadioContextData,
      apModelAntennaTypes,
      updateAntennaType: handleUpdateAntennaType
    })

    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: true
    })

  }

  return (
    <Loader states={[{
      isLoading: isLoadingExternalAntenna || isLoadingApGroupExternalAntenna,
      isFetching: isUpdatingApGroupExternalAntenna || isUpdateApGroupAntennaType }]}
    >
      {displayVenueSettingOrApGroupAndCustomize()}
      <Row gutter={24} data-testid='external-antenna-section'>
        <Col span={8}>
          <Form.Item
            label={$t({ defaultMessage: 'AP Model' })}
            name={['external', 'apModel', 'selected']}
          >
            <Select
              onChange={onSelectModel}
              options={selectOptions}
            />
          </Form.Item>
          {selectedApAntennaType &&
            <ApAntennaTypeSelector
              model={selectedApAntennaType.model}
              selectedApAntennaType={selectedApAntennaType}
              readOnly={!isAllowEdit || useVenueSettings}
              onAntennaTypeChanged={handleAntennaTypesChanged}/>
          }
          {(selectedApExternalAntenna && apiSelectedApExternalAntenna) &&
            <ApExtAntennaForm
              model={selectedApExternalAntenna?.model}
              apiSelectedApExternalAntenna={apiSelectedApExternalAntenna}
              selectedApExternalAntenna={selectedApExternalAntenna}
              readOnly={!isAllowEdit || useVenueSettings}
              onExternalAntennaChanged={handleExternalAntennasChanged}
            />
          }
          {(!selectedApAntennaType && !selectedApExternalAntenna) &&
            <img style={{ marginTop: '60px' }}
              src={selectedApCapabilities?.lanPortPictureDownloadUrl || ApModelPlaceholder}
              alt={imageTitle}
            />
          }
        </Col>
      </Row>
    </Loader>
  )
}
