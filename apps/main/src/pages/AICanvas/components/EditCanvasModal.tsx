import { useEffect } from 'react'

import { Col, Form, Input, Radio, Row, Space } from 'antd'

import { GlobeOutlined, LockOutlined }      from '@acx-ui/icons-new'
import { useUpdateCanvasMutation }          from '@acx-ui/rc/services'
import { Canvas, trailingNorLeadingSpaces } from '@acx-ui/rc/utils'
import { getIntl }                          from '@acx-ui/utils'

import * as UI from '../styledComponents'


export function EditCanvasModal (props:{
  visible: boolean,
  handleCancel: () => void
  editCanvas: Canvas
}) {
  const { $t } = getIntl()
  const { visible, handleCancel, editCanvas } = props
  const [form] = Form.useForm()
  const [updateCanvas] = useUpdateCanvasMutation()

  useEffect(() => {
    if(editCanvas){
      form.setFieldsValue({
        name: editCanvas.name,
        visible: editCanvas.visible
      })
    }
  }, [editCanvas])

  const onOk = () => {
    form.submit()
  }

  const onFinish = async (value: { name:string, visible: boolean }) => {
    await updateCanvas({
      params: { canvasId: editCanvas.id },
      payload: {
        ...editCanvas,
        name: value.name,
        visible: value.visible
      }
    })
    handleCancel()
  }

  return <UI.EditCanvasModal
    title={$t({ defaultMessage: 'Edit Canvas' })}
    visible={visible}
    okText={$t({ defaultMessage: 'Apply' })}
    onOk={onOk}
    onCancel={handleCancel}
    width='500px'
  >
    <Row gutter={24}>
      <Col span={22}>
        <Form
          form={form}
          onFinish={onFinish}
          layout='vertical'
        >
          <Form.Item
            label={$t({ defaultMessage: 'Canvas Name' })}
            name='name'
            rules={[
              { required: true },
              { max: 64 },
              { validator: (_, value) => trailingNorLeadingSpaces(value) }
            ]}
            children={<Input />}
          />
          <Form.Item
            name='visible'
            label={$t({ defaultMessage: 'Visibility Type' })}
          >
            <Radio.Group>
              <Space direction='vertical'>
                <Radio value={false}>
                  <div className='label'>
                    {$t({ defaultMessage: 'Make Private' })} <LockOutlined size='sm' />
                  </div>
                  <div className='desp'>
                    {/* eslint-disable-next-line max-len */}
                    {$t({ defaultMessage: 'Hide this canvas from the public. The canvas will be visible to the owner only.' })}
                  </div>
                </Radio>
                <Radio value={true}>
                  <div className='label'>
                    {$t({ defaultMessage: 'Make Public' })} <GlobeOutlined size='sm' />
                  </div>
                  <div className='desp'>
                    {/* eslint-disable-next-line max-len */}
                    {$t({ defaultMessage: 'Publish this canvas for all administrators in this tenant.' })}
                  </div>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  </UI.EditCanvasModal>
}