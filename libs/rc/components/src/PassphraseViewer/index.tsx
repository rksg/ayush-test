import { Input, Space } from 'antd'

import { Button }       from '@acx-ui/components'
import { CopyOutlined } from '@acx-ui/icons'

export function PassphraseViewer (props: { passphrase: string }) {
  const { passphrase } = props
  return (
    <Space direction='horizontal' size={2} onClick={(e)=> {e.stopPropagation()}}>
      <Input.Password readOnly style={{ paddingLeft: 0 }} bordered={false} value={passphrase} />
      <Button
        type='link'
        icon={<CopyOutlined />}
        onClick={() => navigator.clipboard.writeText(passphrase)}
      />
    </Space>
  )
}
