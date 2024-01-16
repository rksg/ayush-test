import { useEffect } from 'react'

import { Form, FormItemProps } from 'antd'
import { useIntl }             from 'react-intl'

import { Select }                                  from '@acx-ui/components'
import { ApAntennaTypeEnum, ApAntennaTypeSetting } from '@acx-ui/rc/utils'


export type ApAntennaTypeSelectorProps = {
  formItemProps?: FormItemProps
  model: string
  selectedApAntennaType: ApAntennaTypeSetting
  readOnly?: boolean
  onAntennaTypeChanged?: (antennaTypeModels: ApAntennaTypeSetting) => void
}


export function ApAntennaTypeSelector (props: ApAntennaTypeSelectorProps) {
  const { $t } = useIntl()
  const antennaTypeOptions = [
    { label: $t({ defaultMessage: 'Sector' }), value: ApAntennaTypeEnum.SECTOR },
    { label: $t({ defaultMessage: 'Narrow' }), value: ApAntennaTypeEnum.NARROW }
  ]

  const form = Form.useFormInstance()
  const { model, selectedApAntennaType, readOnly=false, onAntennaTypeChanged } = props

  useEffect(() => {
    if (selectedApAntennaType) {
      const modelData = { antennaType: selectedApAntennaType.antennaType }
      form.setFieldsValue({
        external: {
          apModel: {
            selected: model,
            [model]: modelData
          }
        }
      })
    }
  }, [selectedApAntennaType])

  const handleAntTypeChanged = (value: ApAntennaTypeEnum) => {
    const modelData = {
      model: model,
      antennaType: value
    }

    onAntennaTypeChanged?.(modelData)
  }

  return (
    <Form.Item
      label={$t({ defaultMessage: 'Antenna Type' })}
      name={['external', 'apModel', model, 'antennaType']}>
      <Select options={antennaTypeOptions} disabled={readOnly} onChange={handleAntTypeChanged}/>
    </Form.Item>
  )
}