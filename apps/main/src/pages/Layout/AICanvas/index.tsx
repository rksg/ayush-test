import { useState } from 'react'

import { Space, Divider } from 'antd'
import { useIntl }        from 'react-intl'

import { Button, cssStr }                                                                                                                                                                from '@acx-ui/components'
import { RuckusAiDog } from '@acx-ui/icons'

import * as UI from './styledComponents'
import Grid from '../Grid'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

const enum ToolbarItems {
  AddWidgets,
  Sections,
  Timeline,
  Restore,
  Clear
}

export default function AICanvas (
//   props: {
//   visible: boolean, setVisible:(visible: boolean) => void
// }
) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  // const { visible, setVisible } = props
  const [ sectionsSubVisible, setSectionsSubVisible ] = useState(false)
  const [ restoreSubVisible, setRestoreSubVisible ] = useState(false)
  const [ dirty, setDirty ] = useState(false)
  const siderWidth = localStorage.getItem('acx-sider-width') || cssStr('--acx-sider-width')
  const linkToDashboard = useTenantLink('/dashboard')
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
    // setVisible(false)
    navigate(linkToDashboard)
  }

  return (
    <UI.Preview $siderWidth={siderWidth} $subToolbar={sectionsSubVisible || restoreSubVisible}>
      <div className='toolbar'>
        <RuckusAiDog />
      </div>
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
          <Button onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Preview' })}
          </Button>
        </Space>
      </div>
    </UI.Preview>
  )
}
