import { Form, Slider } from 'antd'
import { useIntl }      from 'react-intl'

import { Select }                                                                from '@acx-ui/components'
import { AlgorithmType, CertificateCategoryType, ServerClientCertAlgorithmType } from '@acx-ui/rc/utils'

import { algorithmLabel, onboardSettingsDescription, serverAlgorithmLabel } from '../../contentsMap'

export default function CertificateStrengthSettings (props: {
  certType?: CertificateCategoryType }) {
  const { $t } = useIntl()

  const options = Object.values(AlgorithmType).map(algo => {
    return { value: algo, label: $t(algorithmLabel[algo]) }
  })

  const serverOptions = Object.values(ServerClientCertAlgorithmType).map(algo => {
    return { value: algo, label: $t(serverAlgorithmLabel[algo]) }
  })

  const validateMultipleOfEight = (value: number) => {
    if (value % 8 !== 0) {
      return Promise.reject($t({ defaultMessage: 'Key length must be a multiple of 8' }))
    }
    return Promise.resolve()
  }

  const validateKeyLengthForTemplate = (value: number) => {
    if (![2048, 3072, 4096].includes(value)) {
      return Promise.reject($t({ defaultMessage: 'Key length must be 2048, 3072 or 4096' }))
    }
    return Promise.resolve()
  }

  return (
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Key Length' })}
        name='keyLength'
        extra={$t(onboardSettingsDescription.KEY_LENGTH)}
        rules={[
          { required: true },
          { validator: (_, value) =>
          // eslint-disable-next-line max-len
            props?.certType === CertificateCategoryType.CERTIFICATE_TEMPLATE ? validateKeyLengthForTemplate(value) : validateMultipleOfEight(value) }
        ]}
      >
        <Slider
          tooltipVisible={false}
          style={{ width: '240px' }}
          min={2048}
          max={4096}
          step={props?.certType === CertificateCategoryType.CERTIFICATE_TEMPLATE ? 1024 : 8}
          marks={{ 2048: '2048', 4096: '4096' }}
        />
      </Form.Item>
      <Form.Item
        label={$t({ defaultMessage: 'Algorithm' })}
        name='algorithm'
        rules={[{ required: true }]}
      >
        <Select
          style={{ width: '150px' }}
          placeholder={$t({ defaultMessage: 'Select Algorithm...' })}
          options={props?.certType === CertificateCategoryType.SERVER_CERTIFICATES
            ? serverOptions : options}
        />
      </Form.Item >
    </>
  )
}
