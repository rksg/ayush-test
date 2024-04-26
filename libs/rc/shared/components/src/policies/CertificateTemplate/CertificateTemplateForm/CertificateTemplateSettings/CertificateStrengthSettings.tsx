import { Form, Slider } from 'antd'
import { useIntl }      from 'react-intl'

import { Select }        from '@acx-ui/components'
import { AlgorithmType } from '@acx-ui/rc/utils'

import { algorithmLabel } from '../../contentsMap'

export default function CertificateStrengthSettings () {
  const { $t } = useIntl()

  const options = Object.values(AlgorithmType).map(algo => {
    return { value: algo, label: $t(algorithmLabel[algo]) }
  })

  const validateMultipleOfEight = (value: number) => {
    if (value % 8 !== 0) {
      return Promise.reject($t({ defaultMessage: 'Key length must be a multiple of 8' }))
    }
    return Promise.resolve()
  }

  return (
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Key Length' })}
        name='keyLength'
        rules={[
          { required: true },
          { validator: (_, value) => validateMultipleOfEight(value) }
        ]}
      >
        <Slider
          tooltipVisible={false}
          style={{ width: '240px' }}
          min={512}
          max={4096}
          step={8}
          marks={{ 512: '512', 4096: '4096' }}
        />
      </Form.Item>
      <Form.Item
        label={$t({ defaultMessage: 'Algorithm' })}
        name='algorithm'
        rules={[{ required: true }]}
      >
        <Select
          placeholder={$t({ defaultMessage: 'Select Algorithm...' })}
          options={options}
        />
      </Form.Item >
    </>
  )
}
