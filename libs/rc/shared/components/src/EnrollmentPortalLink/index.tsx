import { useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Button, Tooltip } from '@acx-ui/components'
import { ChatbotLink }     from '@acx-ui/icons'
import { CopyOutlined }    from '@acx-ui/icons-new'

export function EnrollmentPortalLink (props: { url: string }) {
  const { Link } = Typography
  const { url } = props
  const id = 'portalLink_' + url
  const { $t } = useIntl()
  const copyButtonTooltipDefaultText = $t({ defaultMessage: 'Copy URL' })
  const copyButtonTooltipCopiedText = $t({ defaultMessage: 'URL Copied' })
  const [ copyButtonTooltip, setCopyTooltip ] = useState(copyButtonTooltipDefaultText)
  return <div style={{ display: 'flex' }}>
    <Link id={id} ellipsis={true} href={url} target='_blank' rel='noreferrer'>{url}</Link>
    <div style={{ cursor: 'pointer' }} onClick={()=>document.getElementById(id)?.click()}>
      <ChatbotLink/>
    </div>
    <Tooltip title={copyButtonTooltip}>
      <Button
        ghost
        icon={<CopyOutlined size='sm' />}
        style={{ top: '-9px' }}
        onMouseOut={() => setCopyTooltip(copyButtonTooltipDefaultText)}
        onClick={() => {
          navigator.clipboard.writeText(url)
          setCopyTooltip(copyButtonTooltipCopiedText)
        }}
      />
    </Tooltip>
  </div>
}