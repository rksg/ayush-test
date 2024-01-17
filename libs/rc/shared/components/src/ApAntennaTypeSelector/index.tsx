import { useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { ApAntennaTypeEnum, ApAntennaTypeSettings, VeuneApAntennaTypeSettings } from '@acx-ui/rc/utils'

import { ReadOnlySelect } from './styledComponents'


export type ApAntennaTypeSelectorProps = {
  model?: string
  selectedApAntennaType: VeuneApAntennaTypeSettings | ApAntennaTypeSettings
  readOnly?: boolean
  onAntennaTypeChanged?: (antennaTypeModels: VeuneApAntennaTypeSettings | ApAntennaTypeEnum) => void
}


export function ApAntennaTypeSelector (props: ApAntennaTypeSelectorProps) {
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
  }, [selectedApAntennaType])

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
      <ReadOnlySelect options={antennaTypeOptions}
        bordered={!readOnly}
        showArrow={!readOnly}
        className={readOnly? 'readOnly' : undefined}
        onChange={handleAntTypeChanged} />
    </Form.Item>
  )
}