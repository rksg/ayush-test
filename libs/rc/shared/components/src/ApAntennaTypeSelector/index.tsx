import { useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Select }                                                               from '@acx-ui/components'
import { ApAntennaTypeEnum, ApAntennaTypeSettings, VenueApAntennaTypeSettings } from '@acx-ui/rc/utils'


export type ApAntennaTypeSelectorProps = {
  model?: string
  selectedApAntennaType: VenueApAntennaTypeSettings | ApAntennaTypeSettings
  readOnly?: boolean
  onAntennaTypeChanged?: (antennaTypeModels: VenueApAntennaTypeSettings | ApAntennaTypeEnum) => void
}

export const ApAntennaTypeSelector = (props: ApAntennaTypeSelectorProps) => {
  const { $t } = useIntl()
  const antennaTypeOptions = [
    { label: $t({ defaultMessage: 'Sector' }), value: ApAntennaTypeEnum.SECTOR },
    { label: $t({ defaultMessage: 'Narrow' }), value: ApAntennaTypeEnum.NARROW }
  ]

  const form = Form.useFormInstance()
  const {
    model,
    selectedApAntennaType,
    readOnly=false,
    onAntennaTypeChanged } = props

  const fieldName = (model) ? ['external', 'apModel', model, 'antennaType'] : 'antennaType'

  useEffect(() => {
    if (selectedApAntennaType) {
      const modelData = { antennaType: selectedApAntennaType.antennaType }
      if (model) {
        form.setFieldsValue({
          external: {
            apModel: {
              selected: model,
              [model]: modelData
            }
          }
        })
      } else {
        form.setFieldsValue(modelData)
      }
    }
  }, [form, model, selectedApAntennaType])

  const handleAntTypeChanged = (value: ApAntennaTypeEnum) => {
    const modelData = model? {
      model: model,
      antennaType: value
    } : value

    onAntennaTypeChanged?.(modelData)
  }

  return (
    <Form.Item
      label={$t({ defaultMessage: 'Antenna Type' })}
      name={fieldName}>
      <Select options={antennaTypeOptions}
        bordered={!readOnly}
        showArrow={!readOnly}
        style={readOnly? { pointerEvents: 'none' } : {}}
        className={readOnly? 'readOnly' : undefined}
        onChange={handleAntTypeChanged} />
    </Form.Item>
  )
}