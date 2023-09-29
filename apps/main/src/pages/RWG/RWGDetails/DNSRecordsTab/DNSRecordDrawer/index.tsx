import { useEffect } from 'react'

import { Form, Input, Select } from 'antd'
import { useIntl }             from 'react-intl'
import { useParams }           from 'react-router-dom'

import { Drawer, Loader }                                      from '@acx-ui/components'
import { useAddUpdateDnsRecordMutation, useGetDNSRecordQuery } from '@acx-ui/rc/services'
import {
  trailingNorLeadingSpaces,
  DNSRecord,
  DNSDataType,
  URLProtocolRegExp
} from '@acx-ui/rc/utils'


export interface DNSRecordsProps {
  isEdit: boolean,
  visible: boolean,
  dnsRecordId?: string,
  onClose: () => void
}

export function DNSRecordDrawer (props: DNSRecordsProps) {
  const { $t } = useIntl()
  const { isEdit, visible, dnsRecordId, onClose } = props
  const { tenantId, gatewayId } = useParams()
  const [form] = Form.useForm<DNSRecord>()

  const options = Array.from(Object.values(DNSDataType), (entry) => ({
    name: entry,
    value: entry
  }))

  const { data: dnsDetail, isFetching: isDnsDetailFetching } =
      useGetDNSRecordQuery({ params: { tenantId, gatewayId, dnsRecordId } },
        { skip: !gatewayId || !dnsRecordId })

  const [updateDNSRecord] = useAddUpdateDnsRecordMutation()

  useEffect(() => {

    if (form && dnsDetail) {
      form.resetFields()
      form.setFieldsValue(dnsDetail)
    }

  })


  const handleEditDNSRecord = async (formValues: DNSRecord) => {
    try {
      // update dns record
      const formData = { ...formValues, id: dnsRecordId }
      await updateDNSRecord({ params: { tenantId, gatewayId }, payload: formData }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }


  const handleAddDNSRecord = async (formValues: DNSRecord) => {
    try {
    // update dns record
      await updateDNSRecord({ params: { tenantId, gatewayId }, payload: formValues }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleOnFinish = async (values: DNSRecord) => {
    try {
      isEdit ? await handleEditDNSRecord(values) : await handleAddDNSRecord(values)
      onClose()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }

  const onSave = async () => {
    try {
      await form.validateFields()
      await handleOnFinish(form.getFieldsValue())
    } catch (e) {
      return Promise.resolve()
    }
  }

  return (
    <Drawer
      destroyOnClose
      width={'480px'}
      visible={visible}
      title={isEdit
        ? $t({ defaultMessage: 'Edit DNS Record' })
        : $t({ defaultMessage: 'Add DNS Record' })
      }
      children={
        <Loader
          states={[
            { isLoading: false, isFetching: isDnsDetailFetching }
          ]}
        >
          <Form
            preserve={false}
            name='dnsRecordForm'
            form={form}
            layout={'vertical'}
            scrollToFirstError={true}
          >
            <Form.Item
              name={'name'}
              label={$t({ defaultMessage: 'DNS Record Name' })}
              hasFeedback
              validateFirst
              validateTrigger={['onBlur']}
              children={<Input />}
              rules={[
                { required: true },
                { max: 235 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) }
              ]}
            />
            <Form.Item
              name={'dataType'}
              label={$t({ defaultMessage: 'Type' })}
              children={
                <Select
                  allowClear
                  options={options}
                />
              }
              rules={[
                { required: true }
              ]}
            />
            <Form.Item
              name='host'
              label={$t({ defaultMessage: 'Host' })}
              rules={[
                { type: 'string', required: true },
                { min: 2, transform: (value) => value.trim() },
                { max: 64, transform: (value) => value.trim() },
                { validator: (_, value) => URLProtocolRegExp(value) }
              ]}
              children={<Input />}
            />
            <Form.Item
              name={'data'}
              label={$t({ defaultMessage: 'Data' })}
              rules={[
                { required: true },
                { max: 255 },
                { validator: (_, value) => trailingNorLeadingSpaces(value) }
              ]}
              children={<Input />}
            />
            <Form.Item
              name={'ttl'}
              label={$t({ defaultMessage: 'TTL' })}
              rules={[{
                required: true,
                type: 'number',
                max: 255, min: 1,
                transform: Number,
                message: $t({
                  defaultMessage: 'Maximum TTL must be between 1 and 255'
                })
              }]}
              children={<Input type='number'/>}
            />
          </Form>
        </Loader>
      }
      footer={<Drawer.FormFooter
        buttonLabel={{
          save: isEdit
            ? $t({ defaultMessage: 'Apply' })
            : $t({ defaultMessage: 'Add' })
        }}
        onSave={onSave}
        onCancel={onClose}
      />}
      onClose={onClose}
    />
  )
}
