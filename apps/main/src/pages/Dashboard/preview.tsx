import { Space, Divider } from 'antd'

import { Button }       from '@acx-ui/components'
import { EditOutlined } from '@acx-ui/icons'

import * as UI from './styledComponents'


export default function PreviewMode (props: {
  visible: boolean, setVisible:(visible: boolean) => void
}) {
  const { visible, setVisible } = props
  const siderWidth = localStorage.getItem('acx-sider-width') || '200px'

  return (
    visible ? <UI.Preview $siderWidth={siderWidth}>
      <div className='actions'>
        <Space
          style={{ marginLeft: '36px' }}
          split={<Divider type='vertical' style={{ height: '28px' }} />}
        >
          <Button icon={<EditOutlined />} onClick={()=>{setVisible(false)}}>Edit</Button>
          <Button type='primary' onClick={()=>{setVisible(false)}}>Publish</Button>
        </Space>
      </div>
    </UI.Preview> : null
  )
}
