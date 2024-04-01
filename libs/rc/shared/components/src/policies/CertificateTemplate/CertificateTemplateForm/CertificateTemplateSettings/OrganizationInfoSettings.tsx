import { Form, Input } from 'antd'
import { RuleObject }  from 'antd/lib/form'
import { useIntl }     from 'react-intl'

import { CertificateCategoryType, emailRegExp } from '@acx-ui/rc/utils'

interface FormFieldConfig {
  templateKey?: string[]
  authorityKey: string
  templateLabel?: string
  authorityLabel: string
  placeholder?: string
  rules?: RuleObject[]
  render: boolean
}

export default function OrganizationInfoSettings (props: { type?: CertificateCategoryType }) {
  const { type = CertificateCategoryType.CERTIFICATE_TEMPLATE } = props
  const { $t } = useIntl()
  const formFieldConfig: FormFieldConfig[] = [
    {
      templateKey: ['onboard', 'organizationPattern'],
      authorityKey: 'organization',
      templateLabel: $t({ defaultMessage: 'Organization Pattern' }),
      authorityLabel: $t({ defaultMessage: 'Organization' }),
      placeholder: $t({ defaultMessage: 'Sample Corp. Inc.' }),
      render: true,
      rules: [{ max: 255 }]
    },
    {
      templateKey: ['onboard', 'organizationUnitPattern'],
      authorityKey: 'organizationUnit',
      templateLabel: $t({ defaultMessage: 'Organization Unit Pattern' }),
      authorityLabel: $t({ defaultMessage: 'Organization Unit' }),
      placeholder: $t({ defaultMessage: 'IT' }),
      render: true,
      rules: [{ max: 255 }]
    },
    {
      authorityKey: 'email',
      authorityLabel: $t({ defaultMessage: 'Email Address' }),
      render: type === CertificateCategoryType.CERTIFICATE_AUTHORITY,
      rules: [{ validator: (_: RuleObject, value: string) => emailRegExp(value) }, { max: 255 }]
    },
    {
      authorityKey: 'title',
      authorityLabel: $t({ defaultMessage: 'Title' }),
      render: type === CertificateCategoryType.CERTIFICATE_AUTHORITY,
      rules: [{ max: 255 }]
    },
    {
      templateKey: ['onboard', 'localityPattern'],
      authorityKey: 'locality',
      templateLabel: $t({ defaultMessage: 'Locality Pattern' }),
      authorityLabel: $t({ defaultMessage: 'Locality' }),
      placeholder: $t({ defaultMessage: 'Westminster' }),
      render: true,
      rules: [{ max: 255 }]
    },
    {
      templateKey: ['onboard', 'statePattern'],
      authorityKey: 'state',
      templateLabel: $t({ defaultMessage: 'State Pattern' }),
      authorityLabel: $t({ defaultMessage: 'State' }),
      placeholder: $t({ defaultMessage: 'Colorado' }),
      render: true,
      rules: [{ max: 255 }]
    },
    {
      templateKey: ['onboard', 'countryPattern'],
      authorityKey: 'country',
      templateLabel: $t({ defaultMessage: 'Country Pattern' }),
      authorityLabel: $t({ defaultMessage: 'Country' }),
      placeholder: $t({ defaultMessage: 'US' }),
      render: true,
      rules: [{ max: 255 }]
    }
  ]
  return (
    <>
      {formFieldConfig.map((formField) => {
        const {
          templateKey,
          authorityKey,
          templateLabel,
          authorityLabel,
          placeholder,
          rules,
          render
        } = formField
        if (!render) return null
        const name = type === CertificateCategoryType.CERTIFICATE_TEMPLATE
          ? templateKey
          : authorityKey
        const itemLabel = type === CertificateCategoryType.CERTIFICATE_TEMPLATE
          ? templateLabel
          : authorityLabel

        return (
          <Form.Item
            key={authorityKey}
            name={name}
            label={itemLabel}
            rules={rules}
          >
            <Input placeholder={placeholder} />
          </Form.Item>
        )
      })}
    </>
  )
}
