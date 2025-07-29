import { useRef, useState } from 'react'

import { Typography } from 'antd'
import { QRCodeSVG }  from 'qrcode.react'
import { useIntl }    from 'react-intl'

import { Button, Tooltip }        from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { ChatbotLink }            from '@acx-ui/icons'
import { CopyOutlined }           from '@acx-ui/icons-new'

import { StyledChatbotLink, StyledQRLink } from './styledComponents'

export function EnrollmentPortalLink (props: { url: string, name: string }) {
  const { Link } = Typography
  const workFlowQrCodeGenerate = useIsSplitOn(Features.WORKFLOW_QRCODE_GENERATE)
  const { url, name } = props
  const id = 'portalLink_' + url
  const { $t } = useIntl()
  const copyButtonTooltipDefaultText = $t({ defaultMessage: 'Copy URL' })
  const copyButtonTooltipCopiedText = $t({ defaultMessage: 'URL Copied' })
  const [copyButtonTooltip, setCopyTooltip] = useState(copyButtonTooltipDefaultText)
  const qrCodeTooltipDefaultText = $t({ defaultMessage: 'Download a QR code with the URL' })
  const [qrCodeTooltip, setQrCodeTooltip] = useState(qrCodeTooltipDefaultText)
  const openUrlTooltipDefaultText = $t({ defaultMessage: 'Open the URL in a new tab or window' })
  const [openUrlTooltip, setOpenUrlTooltip] = useState(qrCodeTooltipDefaultText)
  const qrRef = useRef<HTMLDivElement | null>(null)
  const maxLabelLength = 25
  const truncatedWorkflowName =
    name.length > maxLabelLength ? name.slice(0, maxLabelLength) + '...' : name

  const handleDownloadQr = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const serializer = new XMLSerializer()
    let source = serializer.serializeToString(svg)
    if (!source.startsWith('<?xml')) {
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source
    }
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    const img = new window.Image()
    img.onload = () => {
      const border = 20
      const qrSize = 360
      const labelHeight = 40
      const canvas = document.createElement('canvas')
      canvas.width = qrSize + border * 2
      canvas.height = qrSize + border * 2 + labelHeight
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        // Use truncatedWorkflowName for the label
        ctx.fillStyle = '#000'
        ctx.font = '20px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(truncatedWorkflowName, canvas.width / 2, border)
        ctx.drawImage(img, border, border + labelHeight, qrSize, qrSize)
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob)
            const link = document.createElement('a')
            // Use truncatedWorkflowName for the filename
            link.href = pngUrl
            link.download = truncatedWorkflowName + '.png'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            setTimeout(() => {
              window.open(pngUrl, '_blank')
              URL.revokeObjectURL(pngUrl)
            }, 500)
          }
          URL.revokeObjectURL(url)
        }, 'image/png')
      }
    }
    img.src = url
  }

  return (
    <div style={{ display: 'flex' }}>
      {!workFlowQrCodeGenerate && (
        <>
          <Link id={id} ellipsis={true} href={url} target={'_blank'} rel={'noreferrer'}>{url}</Link>
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => document.getElementById(id)?.click()}
          >
            <ChatbotLink />
          </div>
          <Tooltip title={copyButtonTooltip}>
            <Button
              ghost
              icon={<CopyOutlined />}
              style={{ top: '-9px' }}
              onMouseOut={() => setCopyTooltip(copyButtonTooltipDefaultText)}
              onClick={() => {
                navigator.clipboard.writeText(url)
                setCopyTooltip(copyButtonTooltipCopiedText)
              }}
            />
          </Tooltip>
        </>
      )}
      {workFlowQrCodeGenerate && (
        <div>
          <Tooltip title={copyButtonTooltip}>
            <Button
              type={'link'}
              icon={
                <CopyOutlined />
              }
              onMouseOut={() => setCopyTooltip(copyButtonTooltipDefaultText)}
              onClick={(event) => {
                navigator.clipboard.writeText(url)
                setCopyTooltip(copyButtonTooltipCopiedText)
                event.stopPropagation()
              }}
            />
          </Tooltip>
          <Link id={id} ellipsis={true} href={url} target={'_blank'} rel={'noreferrer'}></Link>
          <Tooltip title={openUrlTooltip}>
            <Button
              type={'link'}
              icon={
                <StyledChatbotLink />
              }
              onMouseOut={() => setOpenUrlTooltip(openUrlTooltipDefaultText)}
              onClick={(event) => {
                document.getElementById(id)?.click()
                event.stopPropagation()
              }}
            />
          </Tooltip>
          <Tooltip title={qrCodeTooltip}>
            <Button
              type={'link'}
              icon={
                <StyledQRLink />
              }
              onMouseOut={() => setQrCodeTooltip(qrCodeTooltipDefaultText)}
              onClick={handleDownloadQr}
            />
          </Tooltip>
          {/* Hidden QR code for download */}
          <div ref={qrRef} style={{ display: 'none' }} aria-hidden='true'>
            <label style={{ display: 'block', textAlign: 'center', marginBottom: 8 }}>
              {truncatedWorkflowName}</label>
            <QRCodeSVG
              value={JSON.stringify({ name, url })}
              size={240}
              bgColor={'#ffffff'}
              fgColor={'#000000'}
              level={'L'}
              includeMargin={false}
            />
          </div>
        </div>
      )}
    </div>
  )
}
