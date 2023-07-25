import { Form, FormItemProps, Select } from 'antd'
import { useIntl }                     from 'react-intl'
import { useParams }                   from 'react-router-dom'

import { useGetMdnsProxyListQuery } from '@acx-ui/rc/services'
import { MdnsProxyFormData }        from '@acx-ui/rc/utils'

import { MdnsProxyForwardingRulesTable } from '../MdnsProxyForwardingRulesTable'

const { useWatch } = Form

export interface MdnsProxySelectorProps {
  formItemProps?: FormItemProps
  placeholder?: string
}

export function MdnsProxySelector (props: MdnsProxySelectorProps) {
  const { $t } = useIntl()
  const params = useParams()

  const {
    placeholder = $t({ defaultMessage: 'Select mDNS Proxy Services...' })
  } = props

  const formItemProps = {
    name: 'mdnsProxyServiceId',
    label: $t({ defaultMessage: 'mDNS Proxy Service' }),
    ...props.formItemProps
  }

  const selectedServiceId = useWatch<string>(formItemProps.name ?? '')
  const { mdnsProxyList, selectedMdnsProxy } = useGetMdnsProxyListQuery({ params }, {
    selectFromResult ({ data }) {
      return {
        mdnsProxyList: data,
        selectedMdnsProxy: data?.find(s => s.id === selectedServiceId)
      }
    }
  })

  return (
    <>
      <Form.Item {...formItemProps}>
        <Select placeholder={placeholder}>
          {mdnsProxyList && mdnsProxyList.map((mdnsProxy: MdnsProxyFormData) => {
            return <Select.Option key={mdnsProxy.id}>{mdnsProxy.name}</Select.Option>
          })}
        </Select>
      </Form.Item>
      <MdnsProxyForwardingRulesTable
        readonly={true}
        rules={selectedMdnsProxy?.rules}
      />
    </>
  )
}
