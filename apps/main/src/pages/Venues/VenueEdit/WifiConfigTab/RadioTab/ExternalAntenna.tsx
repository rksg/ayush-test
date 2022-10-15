/* eslint-disable max-len */
import { useContext, useEffect, useState } from 'react'

import { Form, Row, Select } from 'antd'
import _                     from 'lodash'
import { useIntl }           from 'react-intl'

import { useGetVenueApCapabilitiesQuery, useGetVenueExternalAntennaQuery } from '@acx-ui/rc/services'
import { CapabilitiesApModel, ExternalAntenna }                            from '@acx-ui/rc/utils'
import { useParams }                                                       from '@acx-ui/react-router-dom'

import { VenueEditContext } from '../..'
import ApModelPlaceholder   from '../../../../../assets/images/ap-model-placeholder.png'

import { ExternalAntennaForm } from './ExternalAntennaForm'

const { Option } = Select

export function ExternalAntennaTab () {
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
  const { allApModelCapabilities } = useGetVenueApCapabilitiesQuery({ params }, {
    selectFromResult ({ data }) {
      return {
        allApModelCapabilities: data?.apModels
      }
    }
  })
  const { allApExternalAntennas } = useGetVenueExternalAntennaQuery({ params }, {
    selectFromResult ({ data }) {
      let selectoptions = data?.map(item => ({ label: item.model, value: item.model })) || []
      selectoptions.unshift({ label: $t({ defaultMessage: 'No model selected' }), value: '' })
      return {
        allApExternalAntennas: data
      }
    }
  })

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
      setSelectOptions(selectItems?.map((item:{ label: string, value:string }) =>
        <Option key={item.value} value={item.value}>{item.label}</Option>) ?? [])
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
    <>
      <Form.Item
        label={$t({ defaultMessage: 'AP Model' })}
        name={['external', 'apModel', 'selected']}
      >
        <Select
          style={{ width: '280px', marginBottom: '15px' }}
          onChange={onSelectModel}
          children={selectOptions}
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
    </>

  )
}