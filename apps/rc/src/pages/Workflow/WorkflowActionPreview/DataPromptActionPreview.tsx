import { Form, Input, Space, Typography } from 'antd'

import { Card }                    from '@acx-ui/components'
import { DataPromptActionContext } from '@acx-ui/rc/utils'


export default function DataPromptActionPreview (props: DataPromptActionContext) {
  const { title, messageHtml = '', variables } = props

  return (
    <Card>
      <Space align={'center'} direction={'vertical'}>
        <Typography.Title level={3}>{title}</Typography.Title>
        <Typography.Text>
          <div dangerouslySetInnerHTML={{ __html: messageHtml }}/>
        </Typography.Text>
        <Form layout={'vertical'}>
          {variables?.map(({ label, regex, name }) => {
            return <Form.Item key={label} label={label} name={name}>
              <Input/>
            </Form.Item>
          })}

        </Form>
      </Space>
    </Card>
  )
}
