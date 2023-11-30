import { Space, Divider } from 'antd'
import { useIntl } from 'react-intl'
import { Button }       from '@acx-ui/components'
import { ClockOutlined, DashboardOutlined, DataStudioOutlined, EyeOpenOutlined } from '@acx-ui/icons'

import * as UI from './styledComponents'

export default function EditMode (props: {
  visible: boolean, setVisible:(visible: boolean) => void
}) {
  const { $t } = useIntl()
  const { visible, setVisible } = props
  const siderWidth = localStorage.getItem('acx-sider-width') || '200px'

  return (
    visible ? <UI.Preview $siderWidth={siderWidth}>
      <div className='toolbar'>
        <Space
          style={{ marginLeft: '36px' }}
          split={<Divider type='vertical' style={{ height: '28px' }} />}
        >
          <div>
            <Button type='text' icon={<DataStudioOutlined/>}>
              {$t({ defaultMessage: 'Add Widget' })}
            </Button>
            <Button type='text' icon={<DashboardOutlined/>} disabled style={{marginLeft: '16px'}} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Sections' })}
            </Button>
          </div>
          <Button type='text' icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Timeline Setup' })}
          </Button>
          <div>
            <Button type='text' onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Restore' })}
            </Button>
            <Button type='text' style={{marginLeft: '16px'}} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Clear All' })}
            </Button>
          </div>
        </Space>
      </div>
      <div className="modal-content">
        {/* <p>Some text in the Modal..</p> */}
      </div>
      <div className='actions'>
        <Space
          style={{ marginLeft: '36px' }}
          split={<Divider type='vertical' style={{ height: '28px' }} />}
        >
          <div>
            <Button type='primary' onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Publish' })}
            </Button>
            <Button style={{marginLeft: '16px'}} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Cancel' })}
            </Button>
          </div>
          <Button icon={<EyeOpenOutlined />} onClick={()=>{setVisible(false)}}>
            {$t({ defaultMessage: 'Preview' })}
          </Button>
        </Space>
      </div>
    </UI.Preview> : null
  )
}
