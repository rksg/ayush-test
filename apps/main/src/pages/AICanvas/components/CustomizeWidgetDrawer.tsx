import React, { useEffect, useState } from 'react'

import { Col, Form, Input, Row, Space } from 'antd'
import { useIntl }                      from 'react-intl'

import { Button, Drawer, Select }  from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { useUpdateWidgetMutation } from '@acx-ui/rc/services'
import { WidgetListData }          from '@acx-ui/rc/utils'
import { DateRange, dateRangeMap } from '@acx-ui/utils'

import { WidgetProperty } from './Card'

export interface CustomizeWidgetDrawerProps {
  canvasId: string,
  widget: WidgetListData,
  visible: boolean
  setVisible: (v: boolean) => void
  changeWidgetProperty: (data: WidgetProperty)=> void
}

export default function CustomizeWidgetDrawer (props: CustomizeWidgetDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible, widget, canvasId, changeWidgetProperty } = props
  const [form] = Form.useForm()
  const [updateWidget] = useUpdateWidgetMutation()
  const isCanvasQ2Enabled = useIsSplitOn(Features.CANVAS)
  const [enabledReset, setEnabledReset] = useState(false)
  const [enabledTimeRangeOption, setEnabledTimeRangeOption] = useState(false)

  const onClose = () => {
    setVisible(false)
  }

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue(true)
    await updateWidget({
      params: { canvasId, widgetId: widget.id },
      payload: {
        timeRange: formValues.timeRange,
        name: formValues.name
      }
    }).unwrap().then(()=> {
      changeWidgetProperty({
        timeRange: formValues.timeRange,
        name: formValues.name
      })
    })
    onClose()
  }

  const timeRangeOptions = [{
    label: $t(dateRangeMap[DateRange.last8Hours]),
    value: 'HOUR8'
  }, {
    label: $t(dateRangeMap[DateRange.last24Hours]),
    value: 'DAY1'
  }, {
    label: $t(dateRangeMap[DateRange.last7Days]),
    value: 'DAY7'
  }, {
    label: $t(dateRangeMap[DateRange.last30Days]),
    value: 'DAY30'
  }]

  useEffect(()=> {
    if (widget.timeRange) {
      setEnabledReset(true)
      setEnabledTimeRangeOption(true)
    }
  }, [form, widget])

  return (
    <Drawer
      title={$t({ defaultMessage: 'Customize Widget' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      mask={true}
      maskClosable={true}
      width={400}
      children={
        <Form layout='vertical'
          form={form}
          onFinish={handleSubmit}
        >
          <Form.Item
            label={$t({ defaultMessage: 'Widget Title' })}
            name='name'
            initialValue={widget?.name}
            validateFirst
            rules={[
              { required: true },
              { min: 1 },
              { max: 64 }
            ]}
            children={<Input/>}
          />

          { isCanvasQ2Enabled && widget.defaultTimeRange && (
            <Form.Item>
              <Row justify='space-between' style={{ padding: '0 0 4px' }}>
                <Col>
                  <label style={{ color: 'var(--acx-neutrals-60)' }}>
                    {$t({ defaultMessage: 'Time Range' })}
                  </label>
                </Col>
                <Col>
                  <Button type='link'
                    hidden={!enabledReset}
                    onClick={() => {
                      setEnabledReset(false)
                      setEnabledTimeRangeOption(false)
                      form.setFieldsValue({ timeRange: null })
                    }}>
                    {$t({ defaultMessage: 'Reset to default range' })}
                  </Button>
                </Col>
              </Row>
              <Space style={{ display: 'flex', justifyContent: 'space-between' }}
                hidden={enabledTimeRangeOption}>
                <Space>{widget.defaultTimeRange}</Space>
                <Button type='link'
                  onClick={()=>{
                    setEnabledReset(false)
                    setEnabledTimeRangeOption(true)
                  }}>
                  {$t({ defaultMessage: 'Change' })}
                </Button>
              </Space>
              <Form.Item
                name='timeRange'
                initialValue={widget?.timeRange}
                hidden={!enabledTimeRangeOption}
                children={<Select
                  placeholder={$t({ defaultMessage: 'Select...' })}
                  options={timeRangeOptions}
                  onChange={() => {
                    setEnabledReset(true)
                  }}
                />}
              />
            </Form.Item>
          )}
        </Form>
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'OK' })
          }}
          onCancel={onClose}
          onSave={async () => {
            try {
              await form.validateFields()
              form.submit()
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
    />
  )
}
