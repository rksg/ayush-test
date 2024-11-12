import { useState } from 'react'

import { Space, Divider } from 'antd'
import { useIntl }        from 'react-intl'

import { Button, cssStr }                                                                                                                                                                from '@acx-ui/components'
import { ArrowDown, ArrowUp, ClockOutlined, DashboardOutlined, DataStudioOutlined, DeleteOutlined, EraserOutlined, EyeOpenOutlined, EyeSlashOutlined, Link, Plus, Reload, Text } from '@acx-ui/icons'

import * as UI from './styledComponents'
import Grid from '../Grid'

const enum ToolbarItems {
  AddWidgets,
  Sections,
  Timeline,
  Restore,
  Clear
}

export default function EditMode (props: {
  visible: boolean, setVisible:(visible: boolean) => void
}) {
  const { $t } = useIntl()
  const { visible, setVisible } = props
  const [ sectionsSubVisible, setSectionsSubVisible ] = useState(false)
  const [ restoreSubVisible, setRestoreSubVisible ] = useState(false)
  const [ dirty, setDirty ] = useState(false)
  const siderWidth = localStorage.getItem('acx-sider-width') || cssStr('--acx-sider-width')
  const onClickToolbar = (item?: ToolbarItems) => {
    if(!dirty){
      setDirty(true)
    }
    if(item !== ToolbarItems.Sections){
      setSectionsSubVisible(false)
    }
    if(item !== ToolbarItems.Restore){
      setRestoreSubVisible(false)
    }
    switch(item) {
      case ToolbarItems.Sections:
        setSectionsSubVisible(true)
        break
      case ToolbarItems.Restore:
        setRestoreSubVisible(true)
        break
      default:
        // setVisible(false)
    }
  }
  const onClose = () => {
    setDirty(false)
    setSectionsSubVisible(false)
    setVisible(false)
  }
  const sectionsSubToolbar = () => {
    return <div className={'sub-toolbar ' + (dirty ? 'animation' : '')}
      style={{ display: sectionsSubVisible ? 'block':'none' }}
    >
      <Space split={<Divider type='vertical' style={{ height: '28px' }} />}>
        <Button type='text' icon={<Plus/>} style={{ marginLeft: '36px' }}>
          {$t({ defaultMessage: 'Add Section' })}
        </Button>
        <div>
          <Button type='text' icon={<DeleteOutlined/>}>
            {$t({ defaultMessage: 'Remove Section' })}
          </Button>
          <Button type='text' icon={<EyeSlashOutlined/>} style={{ marginLeft: '12px' }}>
            {$t({ defaultMessage: 'Hide Section' })}
          </Button>
          <Button type='text' icon={<EyeOpenOutlined/>} style={{ marginLeft: '12px' }}>
            {$t({ defaultMessage: 'Show Section' })}
          </Button>
        </div>
        <div>
          <Button type='text' icon={<ArrowUp/>}>
            {$t({ defaultMessage: 'Move up' })}
          </Button>
          <Button type='text' icon={<ArrowDown/>} style={{ marginLeft: '12px' }}>
            {$t({ defaultMessage: 'Move down' })}
          </Button>
        </div>
        <div>
          <Button type='text' icon={<Plus/>}>
            {$t({ defaultMessage: 'Add tab' })}
          </Button>
          <Button disabled type='text' icon={<DeleteOutlined/>} style={{ marginLeft: '12px' }}>
            {$t({ defaultMessage: 'Remove tab' })}
          </Button>
        </div>
        <div>
          <Button type='text' icon={<Text/>}>
            {$t({ defaultMessage: 'Add title' })}
          </Button>
          <Button type='text' icon={<Link/>} style={{ marginLeft: '12px' }}>
            {$t({ defaultMessage: 'Add link' })}
          </Button>
        </div>
      </Space>
    </div>
  }
  const restoreSubToolbar = () => {
    return <div className={'sub-toolbar ' + (dirty ? 'animation' : '')}
      style={{ display: restoreSubVisible ? 'block':'none' }} >
      <Space split={<Divider type='vertical' style={{ height: '28px' }} />}>
        <Button type='text' style={{ marginLeft: '36px' }}>
          {$t({ defaultMessage: 'Last Published Version' })}
        </Button>
        <Button type='text'>
          {$t({ defaultMessage: 'RUCKUS default dashboard' })}
        </Button>
      </Space>
    </div>
  }

  return (
    <UI.Preview $siderWidth={siderWidth} $subToolbar={sectionsSubVisible || restoreSubVisible}>
      <div className='toolbar'>
        <Space
          style={{ marginLeft: '36px' }}
          split={<Divider type='vertical' style={{ height: '28px' }} />}
        >
          <div>
            <Button type='text'
              icon={<DataStudioOutlined/>}
              onClick={()=>{onClickToolbar(ToolbarItems.AddWidgets)}}>
              {$t({ defaultMessage: 'Add Widget' })}
            </Button>
            <Button type='text'
              icon={<DashboardOutlined/>}
              style={{ marginLeft: '12px' }}
              onClick={()=>{onClickToolbar(ToolbarItems.Sections)}}>
              {$t({ defaultMessage: 'Sections' })}
            </Button>
          </div>
          <Button type='text' icon={<ClockOutlined />} onClick={()=>{onClickToolbar(ToolbarItems.Timeline)}}>
            {$t({ defaultMessage: 'Timeline Setup' })}
          </Button>
          <div>
            <Button type='text' icon={<Reload />} onClick={()=>{onClickToolbar(ToolbarItems.Restore)}}>
              {$t({ defaultMessage: 'Restore' })}
            </Button>
            <Button type='text'
              icon={<EraserOutlined />}
              style={{ marginLeft: '12px' }}
              onClick={()=>{onClickToolbar(ToolbarItems.Clear)}}>
              {$t({ defaultMessage: 'Clear All' })}
            </Button>
          </div>
        </Space>
      </div>
      { sectionsSubVisible && sectionsSubToolbar() }
      { restoreSubVisible && restoreSubToolbar() }
      <div className='modal-content'>
        <Grid />
      </div>
      <div className='actions'>
        <Space
          style={{ marginLeft: '36px' }}
          split={<Divider type='vertical' style={{ height: '28px' }} />}
        >
          <div>
            <Button type='primary' onClick={()=>{onClose()}}>
              {$t({ defaultMessage: 'Publish' })}
            </Button>
            <Button style={{ marginLeft: '20px' }} onClick={()=>{onClose()}}>
              {$t({ defaultMessage: 'Cancel' })}
            </Button>
          </div>
          <Button icon={<EyeOpenOutlined />} onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Preview' })}
          </Button>
        </Space>
      </div>
    </UI.Preview>
  )
}
