import { useEffect, useState } from 'react'

import { Checkbox, Form, Switch } from 'antd'
import { CheckboxChangeEvent }    from 'antd/es/checkbox'
import { useIntl }                from 'react-intl'
import styled                     from 'styled-components'

import { Drawer, Subtitle }                                             from '@acx-ui/components'
import { useGetMspAggregationsQuery, useUpdateMspAggregationsMutation } from '@acx-ui/msp/services'
import { SpaceWrapper }                                                 from '@acx-ui/rc/components'

interface PreferenceDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const Label = styled.span`
  font-size: var(--acx-body-4-font-size);
  line-height: 40px;
`

export const PreferenceDrawer = (props: PreferenceDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible } = props
  const [ mspAggregationChecked, setMspAggregationChecked ] = useState(false)
  const [ ecExclusionChecked, setEcExclusionChecked ] = useState(false)
  const [form] = Form.useForm()

  const { data: mspAggregations } = useGetMspAggregationsQuery({ })

  const [updateMspAggregations] = useUpdateMspAggregationsMutation()

  useEffect(() => {
    setMspAggregationChecked(mspAggregations?.aggregation === true)
    setEcExclusionChecked(mspAggregations?.ecExclusionEnabled === true)
  }, [mspAggregations])

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const onSubmit = async () => {
    const payload = {
      aggregation: mspAggregationChecked,
      ecExclusionEnabled: ecExclusionChecked
    }
    try {
      await form.validateFields()
      updateMspAggregations({ payload })
        .then(() => {
          setVisible(false)
        })
      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleAggregationsChange = (e: CheckboxChangeEvent) => {
    setMspAggregationChecked(e.target.checked)
  }

  const formContent = <Form layout='vertical'form={form} >
    <Label>
      {$t({ defaultMessage: 'Select the notifications you wish to receive:' })}
    </Label>

    <Subtitle level={5}>
      {$t({ defaultMessage: 'Aggregations' })}
    </Subtitle>

    <Form.Item>
      <SpaceWrapper full justifycontent='flex-start'>
        <Checkbox
          onChange={handleAggregationsChange}
          checked={mspAggregationChecked}
        >
          {$t({ defaultMessage: 'Network device firmware updates weekly (AP & Switch)' })}
        </Checkbox>
      </SpaceWrapper>
    </Form.Item>
    {mspAggregationChecked && <Form.Item
      noStyle
      valuePropName='checked'>
      <Switch
        style={{ marginLeft: '20px', marginTop: '-5px' }}
        checked={ecExclusionChecked}
        onClick={(checked) => { setEcExclusionChecked(checked) }}
      />
      <div><label>
        {$t({ defaultMessage: 'All customers do not receive this type of' })}
      </label></div>
      <div><label style={{ marginLeft: '57px' }}>
        {$t({ defaultMessage: 'notifications from RUCKUS One' })}
      </label></div>
    </Form.Item>}
  </Form>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Notification Preference' })}
      width={401}
      visible={visible}
      onClose={onClose}
      children={formContent}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Apply' })
          }}
          onCancel={onClose}
          onSave={onSubmit}
        />
      }
    />
  )
}
