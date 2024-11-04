/* eslint-disable max-len */
import { Form, FormItemProps, Select } from 'antd'
import { find }                        from 'lodash'
import { useIntl }                     from 'react-intl'

import { EdgeMdnsProxyViewData, MdnsProxyFeatureTypeEnum, MdnsProxyFormData } from '@acx-ui/rc/utils'

import { MdnsProxyForwardingRulesTable } from '../MdnsProxyForwardingRulesTable'

const { useWatch } = Form

export interface MdnsProxySelectorProps {
  mdnsProxyList: MdnsProxyFormData[] | EdgeMdnsProxyViewData[] | undefined
  featureType: MdnsProxyFeatureTypeEnum,
  formItemProps?: FormItemProps
  placeholder?: string
}

export function MdnsProxySelector (props: MdnsProxySelectorProps) {
  const { $t } = useIntl()
  const {
    mdnsProxyList,
    featureType,
    placeholder = $t({ defaultMessage: 'Select mDNS Proxy Services...' })
  } = props

  const formItemProps = {
    name: 'mdnsProxyServiceId',
    label: $t({ defaultMessage: 'mDNS Proxy Service' }),
    ...props.formItemProps
  }

  const selectedServiceId = useWatch<string>(formItemProps.name)
  const selectedMdnsProxy = find(featureType === MdnsProxyFeatureTypeEnum.EDGE
    ? (props.mdnsProxyList as EdgeMdnsProxyViewData[])
    : (props.mdnsProxyList as MdnsProxyFormData[]), { id: selectedServiceId })

  return (
    <>
      <Form.Item {...formItemProps}>
        <Select placeholder={placeholder}>
          {mdnsProxyList?.map((mdnsProxy: MdnsProxyFormData | EdgeMdnsProxyViewData) => {
            const data = featureType === MdnsProxyFeatureTypeEnum.EDGE
              ? (mdnsProxy as EdgeMdnsProxyViewData)
              : (mdnsProxy as MdnsProxyFormData)
            return <Select.Option key={data.id} value={data.id}>{data.name}</Select.Option>
          })}
        </Select>
      </Form.Item>
      <MdnsProxyForwardingRulesTable
        featureType={featureType}
        readonly={true}
        rules={featureType === MdnsProxyFeatureTypeEnum.EDGE
          ? (selectedMdnsProxy as EdgeMdnsProxyViewData)?.forwardingRules
          : (selectedMdnsProxy as MdnsProxyFormData)?.rules}
      />
    </>
  )
}