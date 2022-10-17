import { useState } from 'react'

import TextArea    from 'antd/lib/input/TextArea'
import { useIntl } from 'react-intl'

import { Button } from '@acx-ui/components'

import * as UI from '../styledComponents'

export default function PortalTermsModal () {
  const { $t } = useIntl()
  const [visible, setVisible]=useState(false)
  const onClose = () => {
    setVisible(false)
  }
  const footer = [
    <Button
      key='back'
      type='link'
      onClick={onClose}
      children={$t({ defaultMessage: 'Cancel' })}
    />,
    <Button
      key='forward'
      type='secondary'

      children={$t({ defaultMessage: 'OK' })}
    />
  ]
  const getContent = <div>
    <TextArea placeholder={$t({ defaultMessage: 'Paste the text here...' })}
      rows={8}
      style={{ resize: 'none', borderRadius: 0 }}
    ></TextArea>
  </div>

  return (
    <>
      <UI.FieldText>{$t({
        defaultMessage: 'By clicking the connect button, you are accepting the'
      })}&nbsp;&nbsp;
      <UI.FieldTextLink onClick={() => setVisible(true)}>
        {$t({ defaultMessage: 'terms & conditions' })}
      </UI.FieldTextLink></UI.FieldText>
      <UI.Modal
        title={$t({ defaultMessage: 'Terms & Conditions' })}
        visible={visible}
        onCancel={onClose}
        width={400}
        footer={footer}
        closable={false}
        maskClosable={false}
      >
        {getContent}
      </UI.Modal>
    </>


  )
}

