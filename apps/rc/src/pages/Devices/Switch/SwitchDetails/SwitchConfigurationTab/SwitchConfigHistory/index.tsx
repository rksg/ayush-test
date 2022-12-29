import { Button, Modal } from '@acx-ui/components'
import { useState } from 'react'
import { useIntl } from 'react-intl'
// import CodeMirror from '@uiw/react-codemirror'

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
    {/* <CodeMirror
      value="console.log('hello world!');"
      height="200px"
    /> */}
  </>

  return <>
    <Button onClick={showModal}>
      test code mirror
    </Button>
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