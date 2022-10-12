/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Form, Row, Select } from 'antd'
import { useIntl }           from 'react-intl'

import { useGetVenueApCapabilitiesQuery, useGetVenueExternalAntennaQuery } from '@acx-ui/rc/services'
import { VenueExternalAntenna, CapabilitiesApModel }                       from '@acx-ui/rc/utils'
import { useParams }                                                       from '@acx-ui/react-router-dom'

import ApModelPlaceholder from '../../../../../assets/images/ap-model-placeholder.png'

import { ExternalAntennaForm } from './ExternalAntennaForm'

const { Option } = Select

export function ExternalAntenna () {
  const { $t } = useIntl()
  const readOnly = false // TODO: !rbacService.isRoleAllowed('UpdateExternalAntennas')
  const imageTitle = $t({ defaultMessage: 'AP external Antenna image' })
  const params = useParams()
  const [handledApExternalAntennas, setHandledApExternalAntennas] = useState([] as VenueExternalAntenna[])
  const [selectOptions, setSelectOptions] = useState([])
  const [selectedApCapabilities, setSelectedApCapabilities] = useState(null as CapabilitiesApModel | null)
  const [selectedApExternalAntenna, setSelectedApExternalAntenna] = useState(null as VenueExternalAntenna | null)
  const { allApModelCapabilities } = useGetVenueApCapabilitiesQuery({ params }, {
    selectFromResult ({ data }) {
      return {
        allApModelCapabilities: data?.apModels
      }
    }
  })
  const { allApExternalAntennas, selected } = useGetVenueExternalAntennaQuery({ params }, {
    selectFromResult ({ data }) {
      let selectoptions = data?.map(item => ({ label: item.model, value: item.model })) || []
      selectoptions.unshift({ label: $t({ defaultMessage: 'No model selected' }), value: '' })
      return {
        allApExternalAntennas: data,
        selected: ''
      }
    }
  })

  useEffect(() => {
    if (allApModelCapabilities && allApExternalAntennas) {
      const apExternalAntennas = JSON.parse(JSON.stringify(allApExternalAntennas))
      const extAntModels = allApExternalAntennas.map(i => i.model)
      const apModelCapabilities = allApModelCapabilities.filter((ap) => {
        return extAntModels.indexOf(ap.model) > -1
      })

      apExternalAntennas.forEach((data:VenueExternalAntenna) => {
        if (data.enable24G === false && data.gain24G === undefined) {
          data.gain24G = apModelCapabilities.filter(ap => ap.model === data.model)[0].externalAntenna.gain24G
        }
        if (data.enable50G === false && data.gain50G === undefined) {
          data.gain50G = apModelCapabilities.filter(ap => ap.model === data.model)[0].externalAntenna.gain50G
        }
      })
      setHandledApExternalAntennas(apExternalAntennas)
      let selectItems = apExternalAntennas.map((item:VenueExternalAntenna) => ({ label: item.model, value: item.model })) || []
      selectItems.unshift({ label: $t({ defaultMessage: 'No model selected' }), value: '' })
      setSelectOptions(selectItems?.map((item:{ label: string, value:string }) =>
        <Option key={item.value}>{item.label}</Option>) ?? [])
    }
  }, [allApModelCapabilities, allApExternalAntennas])

  const filterModelCapabilities = (model: string) => {
    return allApModelCapabilities?.find(modelCapabilities => modelCapabilities.model === model) as unknown as CapabilitiesApModel
  }

  const onSelectModel = (value: string) => {
    if (value && handledApExternalAntennas) {
      const filteredModel = handledApExternalAntennas.filter(ap => ap.model === value)
      setSelectedApExternalAntenna((filteredModel.length) ? filteredModel[0] : null)
      setSelectedApCapabilities(filterModelCapabilities(value))
    } else {
      setSelectedApExternalAntenna(null)
      setSelectedApCapabilities(null)
    }
  }

  return (
    <Form.Item
      name={['external', 'apModel']}
      label={$t({ defaultMessage: 'AP Model' })}
    >
      <Select
        defaultValue={selected}
        style={{ width: '280px', marginBottom: '15px' }}
        onChange={onSelectModel}
        children={selectOptions} />
      {
        selectedApExternalAntenna ?
          <ExternalAntennaForm
            model={selectedApExternalAntenna.model}
            selectedApCapabilities={selectedApCapabilities}
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
    </Form.Item>
  )
}