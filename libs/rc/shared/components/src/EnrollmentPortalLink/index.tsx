import { useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Button, Tooltip } from '@acx-ui/components'
import { ChatbotLink, QrCodeSmallIcon, CopyOutlined }     from '@acx-ui/icons'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle';

export function EnrollmentPortalLink (props: { url: string }) {
  const { Link } = Typography
  const workFlowQrCodeGenerate = useIsSplitOn(Features.WORKFLOW_QRCODE_GENERATE)
  const { url } = props
  const id = 'portalLink_' + url
  const { $t } = useIntl()
  const copyButtonTooltipDefaultText = $t({ defaultMessage: 'Copy URL' })
  const copyButtonTooltipCopiedText = $t({ defaultMessage: 'URL Copied' })
  const [ copyButtonTooltip, setCopyTooltip ] = useState(copyButtonTooltipDefaultText)
  return <div style={{ display: 'flex'}}>
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
    <Link id={id} ellipsis={true} href={url} target='_blank' rel='noreferrer'></Link>
    <Button
      ghost
      icon={<ChatbotLink size='sm' />}
      style={{ top: '-9px' }}
      onClick={() => {document.getElementById(id)?.click()}}
    />
    {workFlowQrCodeGenerate && (
      <Button
        ghost
        icon={<QrCodeSmallIcon size='sm' />}
        style={{ top: '-9px' }}
        onClick={() => {
          const link = document.createElement('a')
          link.href = url
          link.download = url.split('/').pop() || 'download'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }}
      />
    )}

  </div>
}
