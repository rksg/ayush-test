import { useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, Tooltip, PasswordInput } from '@acx-ui/components'
import { CopyOutlined }                   from '@acx-ui/icons'

export function PassphraseViewer (props: { passphrase: string }) {
  const { $t } = useIntl()
  const { passphrase } = props
  const copyButtonTooltipDefaultText = $t({ defaultMessage: 'Copy Passphrase' })
  const copyButtonTooltipCopiedText = $t({ defaultMessage: 'Passphrase Copied' })
  const [ copyButtonTooltip, setCopyTooltip ] = useState(copyButtonTooltipDefaultText)
  return (
    <Space direction='horizontal' size={2} onClick={(e)=> {e.stopPropagation()}}>
      <PasswordInput readOnly style={{ paddingLeft: 0 }} bordered={false} value={passphrase} />
      <Tooltip title={copyButtonTooltip}>
        <Button
          type='link'
          icon={<CopyOutlined />}
          onMouseOut={() => setCopyTooltip(copyButtonTooltipDefaultText)}
          onClick={() => {
            navigator.clipboard.writeText(passphrase)
            setCopyTooltip(copyButtonTooltipCopiedText)
          }}
        />
      </Tooltip>
    </Space>
  )
}
