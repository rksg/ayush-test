/* eslint-disable max-len */
import { useContext, useEffect, useState } from 'react'

import { Col, Form, Row, Select } from 'antd'
import { get, uniqBy }            from 'lodash'
import { useIntl }                from 'react-intl'

import { AnchorContext, Loader }                   from '@acx-ui/components'
import { Features, useIsSplitOn }                  from '@acx-ui/feature-toggle'
import { ApAntennaTypeSelector }                   from '@acx-ui/rc/components'
import {
  useGetVenueAntennaTypeQuery,
  useGetVenueExternalAntennaQuery,
  useGetVenueTemplateExternalAntennaQuery,
  useUpdateVenueAntennaTypeMutation,
  useUpdateVenueExternalAntennaMutation,
  useUpdateVenueTemplateExternalAntennaMutation
} from '@acx-ui/rc/services'
import {
  ApAntennaTypeEnum,
  CapabilitiesApModel,
  ExternalAntenna,
  useConfigTemplate,
  VeuneApAntennaTypeSettings } from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { VenueUtilityContext }                        from '..'
import { VenueEditContext, VenueWifiConfigItemProps } from '../..'
import ApModelPlaceholder                             from '../../../assets/images/aps/ap-model-placeholder.png'
import {
  useVenueConfigTemplateMutationFnSwitcher,
  useVenueConfigTemplateQueryFnSwitcher
} from '../../../venueConfigTemplateApiSwitcher'

import { ExternalAntennaForm } from './ExternalAntennaForm'

export function ExternalAntennaSection (props: VenueWifiConfigItemProps) {
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
    setEditRadioContextData } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const { venueApCaps, isLoadingVenueApCaps } = useContext(VenueUtilityContext)
  const allApModelCapabilities = venueApCaps?.apModels

  const [handledApExternalAntennas, setHandledApExternalAntennas] = useState([] as ExternalAntenna[])
  const [selectOptions, setSelectOptions] = useState([])
  const [selectedApCapabilities, setSelectedApCapabilities] = useState(null as CapabilitiesApModel | null)
  const [apiSelectedApExternalAntenna, setApiSelectedApExternalAntenna] = useState(null as ExternalAntenna | null)
  const [selectedApExternalAntenna, setSelectedApExternalAntenna] = useState(null as ExternalAntenna | null)
  const [antennaTypeModels, setAntennaTypeModels] = useState([] as VeuneApAntennaTypeSettings[])
  const [selectedApAntennaType, setSelectedApAntennaType] = useState(null as VeuneApAntennaTypeSettings | null)

  const { isTemplate } = useConfigTemplate()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isConfigTemplateRbacEnabled = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedRbacEnabled = isTemplate ? isConfigTemplateRbacEnabled : isUseRbacApi

  const { data: allApExternalAntennas, isLoading: isLoadingExternalAntenna } =
    useVenueConfigTemplateQueryFnSwitcher<ExternalAntenna[]>({
      useQueryFn: useGetVenueExternalAntennaQuery,
      useTemplateQueryFn: useGetVenueTemplateExternalAntennaQuery,
      enableRbac: isUseRbacApi
    })

  const [updateVenueExternalAntenna, { isLoading: isUpdatingExternalAntenna }] =
    useVenueConfigTemplateMutationFnSwitcher(
      useUpdateVenueExternalAntennaMutation,
      useUpdateVenueTemplateExternalAntennaMutation
    )

  const { data: antennaTypeSettings } = useGetVenueAntennaTypeQuery({
    params,
    enableRbac: isUseRbacApi
  }, { skip: !supportAntennaTypeSelection })

  const [updateVenueAntennaType, { isLoading: isUpdateAntennaType }] = useUpdateVenueAntennaTypeMutation()

  const handleUpdateExternalAntenna = async (data: ExternalAntenna[]) => {
    try {
      await updateVenueExternalAntenna({
        params,
        payload: [ ...data ],
        enableRbac: resolvedRbacEnabled
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleUpdateAntennaType = async (data: VeuneApAntennaTypeSettings[]) => {
    try {
      await updateVenueAntennaType({ params, payload: [ ...data ], enableRbac: isUseRbacApi })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const filterModelCapabilities = (model: string) => {
    return allApModelCapabilities?.find(modelCapabilities => modelCapabilities.model === model) as unknown as CapabilitiesApModel
  }

  useEffect(() => {
    if (allApModelCapabilities && allApExternalAntennas) {
      const apExternalAntennas = JSON.parse(JSON.stringify(allApExternalAntennas))

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

      if (supportAntennaTypeSelection && antennaTypeSettings && antennaTypeSettings.length > 0) {
        setAntennaTypeModels(antennaTypeSettings)
        antennaTypeSettings.forEach((item: VeuneApAntennaTypeSettings) => {
          selectItems.push({ label: item.model, value: item.model })
        })
        uniqBy(selectItems, 'value')
      }

      setSelectOptions(selectItems)
      const anchorItemName = supportAntennaTypeSelection? 'Antenna' : 'External-Antenna'
      setReadyToScroll?.(r => [...(new Set(r.concat(anchorItemName)))])
    }
  }, [allApModelCapabilities, allApExternalAntennas, supportAntennaTypeSelection, antennaTypeSettings])

  useEffect(() => {
    const apModelsMap = {} as { [index: string]: ExternalAntenna }
    const antennaTypeModelsMap = {} as { [index: string]: VeuneApAntennaTypeSettings }

    const externalAntennaLength = handledApExternalAntennas.length
    const antennaTypeModelsLength = antennaTypeModels.length

    if (handledApExternalAntennas.length) {
      handledApExternalAntennas.forEach((item:ExternalAntenna) => {
        apModelsMap[item.model] = item
      })
    }

    if (antennaTypeModels.length) {
      antennaTypeModels.forEach((item: VeuneApAntennaTypeSettings) => {
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

  const handleExternalAntennasChanged = (apModels: { [index: string]: ExternalAntenna }) => {

    setEditRadioContextData({
      ...editRadioContextData,
      apModels,
      updateExternalAntenna: handleUpdateExternalAntenna
    })

    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: true
    })
  }

  const handleAntennaTypesChanged = (newApModelAntennaTypes: VeuneApAntennaTypeSettings | ApAntennaTypeEnum) => {
    const newAntTypes = (newApModelAntennaTypes as VeuneApAntennaTypeSettings)
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
      isLoading: isLoadingVenueApCaps || isLoadingExternalAntenna,
      isFetching: isUpdatingExternalAntenna || isUpdateAntennaType }]}
    >
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
              readOnly={!isAllowEdit}
              onAntennaTypeChanged={handleAntennaTypesChanged}/>
          }
          {(selectedApExternalAntenna && apiSelectedApExternalAntenna) &&
            <ExternalAntennaForm
              model={selectedApExternalAntenna?.model}
              apiSelectedApExternalAntenna={apiSelectedApExternalAntenna}
              selectedApExternalAntenna={selectedApExternalAntenna}
              readOnly={!isAllowEdit}
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
