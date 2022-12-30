import { Button, Modal } from '@acx-ui/components'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import 'codemirror/addon/merge/merge.css'
import 'codemirror/addon/merge/merge.js'
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/mode/overlay'
import { CodeMirrorWidget } from '@acx-ui/rc/components'

export function SwitchConfigHistory () {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)

  const showModal = () => {
    setVisible(true)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const content = <>
  </>

  return <>
    <Button onClick={showModal}>
      test code mirror
    </Button>
    <CodeMirrorWidget />
  
    <Modal
      title={$t({ defaultMessage: 'Configuration Details' })}
      visible={visible}
      onCancel={handleCancel}
      width={800}
      footer={<Button key='back' type='secondary' onClick={handleCancel}>
        {$t({ defaultMessage: 'Close' })}
      </Button>
      }
    >
      {content}
    </Modal>
  </>
}