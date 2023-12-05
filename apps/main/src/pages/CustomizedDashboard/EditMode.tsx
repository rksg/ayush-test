import { Space, Divider } from 'antd'
import { useIntl }        from 'react-intl'

import { Button }                                                                                        from '@acx-ui/components'
import { ClockOutlined, DashboardOutlined, DataStudioOutlined, EraserOutlined, EyeOpenOutlined, Reload } from '@acx-ui/icons'

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
            <Button type='text' icon={<DashboardOutlined/>} style={{ marginLeft: '12px' }} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Sections' })}
            </Button>
          </div>
          <Button type='text' icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Timeline Setup' })}
          </Button>
          <div>
            <Button type='text' icon={<Reload />} >
              {$t({ defaultMessage: 'Restore' })}
            </Button>
            <Button type='text' icon={<EraserOutlined />} disabled style={{ marginLeft: '12px' }} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Clear All' })}
            </Button>
          </div>
        </Space>
      </div>
      <div className='sub-toolbar'>
        <Space
          split={<Divider type='vertical' style={{ height: '28px' }} />}
        >
          <Button type='text' icon={<DataStudioOutlined/>} style={{ marginLeft: '36px' }}>
            {$t({ defaultMessage: 'Add Section' })}
          </Button>
          <div>
            <Button type='text' icon={<DashboardOutlined/>} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Remove Section' })}
            </Button>
            <Button type='text' icon={<DashboardOutlined/>} style={{ marginLeft: '12px' }} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Hide Section' })}
            </Button>
          </div>
          <div>
            <Button type='text' icon={<DashboardOutlined/>} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Move up' })}
            </Button>
            <Button type='text' icon={<DashboardOutlined/>} style={{ marginLeft: '12px' }} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Move down' })}
            </Button>
          </div>
          <div>
            <Button type='text' icon={<DashboardOutlined/>} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Add tab' })}
            </Button>
            <Button type='text' icon={<DashboardOutlined/>} style={{ marginLeft: '12px' }} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Remove tab' })}
            </Button>
          </div>
          <div>
            <Button type='text' icon={<DashboardOutlined/>} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Add title' })}
            </Button>
            <Button type='text' icon={<DashboardOutlined/>} style={{ marginLeft: '12px' }} onClick={()=>{setVisible(false)}}>
              {$t({ defaultMessage: 'Add link' })}
            </Button>
          </div>
        </Space>
      </div>
      <div className='modal-content'>
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
            <Button style={{ marginLeft: '20px' }} onClick={()=>{setVisible(false)}}>
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
