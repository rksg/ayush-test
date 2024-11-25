import { useState } from 'react'

import { Space, Divider } from 'antd'
import { useIntl }        from 'react-intl'

import { Button, cssStr }    from '@acx-ui/components'
import { HistoricalOutlined, Plus, RuckusAiDog } from '@acx-ui/icons'

import * as UI from './styledComponents'
import Grid from '../Grid'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

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

  const onClose = () => {
    setDirty(false)
    setSectionsSubVisible(false)
    // setVisible(false)
    navigate(linkToDashboard)
  }

  return (
    <UI.Preview $siderWidth={siderWidth} $subToolbar={sectionsSubVisible || restoreSubVisible}>
      <div className='chat'>
        <div className='header'>
          <div className='title'>
            <RuckusAiDog />
            <span>RUCKUS AI</span>
          </div>
          <div className='actions'>
            <Button icon={<Plus />} onClick={()=>{onClose()}} />
            <Button icon={<HistoricalOutlined />} onClick={()=>{onClose()}} />
          </div>
        </div>
        <div className='content'>
          Hi
        </div>
      </div>
      <div className='canvas'>
        <div className='header'>
          <div className='title'>
            <span>Custom-1</span>
          </div>
          <div className='actions'>
            <Button type='primary' onClick={()=>{onClose()}}>
              {$t({ defaultMessage: 'Publish' })}
            </Button>
            <Button type='primary' onClick={()=>{onClose()}}>
              {$t({ defaultMessage: 'Save' })}
            </Button>
            <Button className='black' onClick={()=>{onClose()}}>
              {$t({ defaultMessage: 'Preview' })}
            </Button>
          </div>
            
        </div>
      </div>
      {/* <div className='modal-content'>
        Hi
      </div> */}
    </UI.Preview>
  )
}
