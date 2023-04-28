
import { Col, Form, Input, Row, Select } from 'antd'
import { useIntl }                       from 'react-intl'

import { Drawer }                      from '@acx-ui/components'
import { EdgeDhcpOption }              from '@acx-ui/rc/utils'
import { getIntl, validationMessages } from '@acx-ui/utils'

import { dhcpOptions, useDrawerControl } from '..'


interface OptionDrawerProps {
  visible: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  onAddOrEdit: (item: EdgeDhcpOption) => void
  data?: EdgeDhcpOption
  allOptions?: EdgeDhcpOption[]
}

const initOptionData: Partial<EdgeDhcpOption> = {
  id: '0'
}

async function optionValidator (
  value: string,
  dhcpHosts: EdgeDhcpOption[] = [],
  currentId: EdgeDhcpOption['id']
) {
  const { $t } = getIntl()
  const matched = dhcpHosts.find((item) => item.optionId === value && currentId !== item.id)
  if (!matched) return

  const entityName = $t({ defaultMessage: 'Option Name' })
  return Promise.reject($t(validationMessages.duplication, {
    entityName: entityName,
    key: $t({ defaultMessage: 'name' }),
    extra: ''
  }))
}

export const OptionDrawer = (props: OptionDrawerProps) => {

  const { $t } = useIntl()
  const { visible, setVisible, onAddOrEdit, data, allOptions } = props
  const dhcpOptionDropdownOptions = dhcpOptions.map(item => ({
    label: $t(item.name),
    value: item.id
  }))

  const { form, onSubmit, onSave, onClose } = useDrawerControl({
    visible,
    setVisible,
    data,
    initData: initOptionData,
    onAddOrEdit
  })

  const getTitle = () => {
    return $t({ defaultMessage: '{operation} DHCP Option' },
      { operation: !!data ? $t({ defaultMessage: 'Edit' }) :
        $t({ defaultMessage: 'Add' }) })
  }

  const onOptionChange = (optionId: string) => {
    const target = dhcpOptionDropdownOptions.find(item => item.value === optionId)
    form.setFieldValue('optionName', target?.label)
  }

  const drawerContent = <Form
    form={form}
    layout='vertical'
    onFinish={onSubmit}
    initialValues={initOptionData}
  >
    <Form.Item name='id' hidden />

    <Row>
      <Col span={14}>
        <Form.Item
          name='optionId'
          label={$t({ defaultMessage: 'Option Name' })}
          rules={[
            { required: true },
            {
              validator: (_, value) =>
                optionValidator(value, allOptions, form.getFieldValue('id'))
            }
          ]}
          children={
            <Select
              placeholder={$t({ defaultMessage: 'Select...' })}
              options={dhcpOptionDropdownOptions}
              onChange={onOptionChange}
            />
          }
        />
        <Form.Item
          name='optionName'
          children={<Input />}
          hidden
        />
        <Form.Item
          name='optionValue'
          label={$t({ defaultMessage: 'Option Value' })}
          rules={[
            { required: true },
            { max: 64 }
          ]}
          children={<Input />}
        />
      </Col>
    </Row>
  </Form>

  const drawerFooter = <Drawer.FormFooter
    showAddAnother={!!!data}
    buttonLabel={({
      addAnother: $t({ defaultMessage: 'Add another option' }),
      save: !!data ? $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' })
    })}
    onCancel={onClose}
    onSave={onSave}
  />

  return (
    <Drawer
      title={getTitle()}
      visible={visible}
      onClose={onClose}
      mask={true}
      children={drawerContent}
      destroyOnClose={true}
      width={475}
      footer={drawerFooter}
    />
  )
}