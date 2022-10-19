/* eslint-disable max-len */
import { useContext, useEffect, useState } from 'react'

import { Col, Form, Row, Select } from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'

import { Loader, showToast }                                                                                      from '@acx-ui/components'
import { useGetVenueApCapabilitiesQuery, useGetVenueExternalAntennaQuery, useUpdateVenueExternalAntennaMutation } from '@acx-ui/rc/services'
import { CapabilitiesApModel, ExternalAntenna }                                                                   from '@acx-ui/rc/utils'
import { useParams }                                                                                              from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../..'
import ApModelPlaceholder   from '../../../../../assets/images/ap-model-placeholder.png'

import { ExternalAntennaForm } from './ExternalAntennaForm'

export function ExternalAntennaSection () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const readOnly = false // TODO: !rbacService.isRoleAllowed('UpdateExternalAntennas')
  const imageTitle = $t({ defaultMessage: 'AP external Antenna image' })
  const params = useParams()
  const { editRadioContextData,
    setEditRadioContextData } = useContext(VenueEditContext)
  const [handledApExternalAntennas, setHandledApExternalAntennas] = useState([] as ExternalAntenna[])
  const [selectOptions, setSelectOptions] = useState([])
  const [selectedApCapabilities, setSelectedApCapabilities] = useState(null as CapabilitiesApModel | null)
  const [apiSelectedApExternalAntenna, setApiSelectedApExternalAntenna] = useState(null as ExternalAntenna | null)
  const [selectedApExternalAntenna, setSelectedApExternalAntenna] = useState(null as ExternalAntenna | null)
  const { allApModelCapabilities, isLoadingCapabilities } = useGetVenueApCapabilitiesQuery({ params }, {
    selectFromResult ({ data, isLoading }) {
      return {
        allApModelCapabilities: data?.apModels,
        isLoadingCapabilities: isLoading
      }
    }
  })
  const { data: allApExternalAntennas, isLoading: isLoadingExternalAntenna } = useGetVenueExternalAntennaQuery({ params })
  const [updateVenueExternalAntenna, { isLoading: isUpdatingExternalAntenna }] = useUpdateVenueExternalAntennaMutation()

  const handleUpdateExternalAntenna = async (data: ExternalAntenna[]) => {
    try {
      await updateVenueExternalAntenna({ params, payload: [ ...data ] })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  useEffect(() => {
    setEditRadioContextData({
      ...editRadioContextData,
      updateExternalAntenna: handleUpdateExternalAntenna
    })
  }, [])


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
        data.supportDisable = modelCapabilities.externalAntenna?.supportDisable
        data.coupled = modelCapabilities.externalAntenna?.coupled || undefined
      })
      setHandledApExternalAntennas(apExternalAntennas)
      let selectItems = apExternalAntennas.map((item:ExternalAntenna) => ({ label: item.model, value: item.model })) || []
      selectItems.unshift({ label: $t({ defaultMessage: 'No model selected' }), value: '' })
      setSelectOptions(selectItems)
    }
  }, [allApModelCapabilities, allApExternalAntennas])

  useEffect(()=>{
    if (handledApExternalAntennas.length) {
      const apModelsMap = {} as { [index: string]: ExternalAntenna }
      handledApExternalAntennas.forEach((item:ExternalAntenna) => {
        apModelsMap[item.model] = item
      })
      setEditRadioContextData({
        ...editRadioContextData,
        apiApModels: apModelsMap,
        apModels: apModelsMap
      })
      initForm()
    }
  }, [handledApExternalAntennas])

  const initForm = () => {
    setSelectedApExternalAntenna(null)
    setSelectedApCapabilities(null)
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
      const apiModel = _.get(editRadioContextData?.apiApModels, currentModel) || null
      const findModel = _.get(editRadioContextData?.apModels, currentModel) || null
      setApiSelectedApExternalAntenna(apiModel)
      setSelectedApExternalAntenna(findModel)
      setSelectedApCapabilities(filterModelCapabilities(currentModel))
    } else {
      setSelectedApExternalAntenna(null)
      setSelectedApCapabilities(null)
    }
  }

  return (
    <Loader states={[{
      isLoading: isLoadingCapabilities || isLoadingExternalAntenna,
      isFetching: isUpdatingExternalAntenna }]}
    >
      <Row gutter={24}>
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
          {
            selectedApExternalAntenna && apiSelectedApExternalAntenna ?
              <ExternalAntennaForm
                model={selectedApExternalAntenna.model}
                apiSelectedApExternalAntenna={apiSelectedApExternalAntenna}
                selectedApExternalAntenna={selectedApExternalAntenna}
                readOnly={readOnly}
              /> :
              (
                <Row style={{ marginTop: '60px' }}>
                  <img
                    src={selectedApCapabilities?.lanPortPictureDownloadUrl || ApModelPlaceholder}
                    alt={imageTitle}
                  />
                </Row>
              )
          }
        </Col>
      </Row>
    </Loader>
  )
}