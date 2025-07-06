import { useRef, useState } from 'react'

import { Typography } from 'antd'
import { QRCodeSVG }  from 'qrcode.react'
import { useIntl }    from 'react-intl'

import { Button, Tooltip }              from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import { ChatbotLink, QrCodeSmallIcon } from '@acx-ui/icons'
import { CopyOutlined }                 from '@acx-ui/icons-new'

export function EnrollmentPortalLink (props: { url: string }) {
  const { Link } = Typography
  const workFlowQrCodeGenerate = useIsSplitOn(Features.WORKFLOW_QRCODE_GENERATE)
  const { url } = props
  const id = 'portalLink_' + url
  const { $t } = useIntl()
  const copyButtonTooltipDefaultText = $t({ defaultMessage: 'Copy URL' })
  const copyButtonTooltipCopiedText = $t({ defaultMessage: 'URL Copied' })
  const [copyButtonTooltip, setCopyTooltip] = useState(copyButtonTooltipDefaultText)
  const qrRef = useRef<HTMLDivElement | null>(null)

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
      const canvasSize = qrSize + border * 2
      const canvas = document.createElement('canvas')
      canvas.width = canvasSize
      canvas.height = canvasSize
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, border, border, qrSize, qrSize)
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob)
            // Download
            const a = document.createElement('a')
            a.href = pngUrl
            a.download = 'qr-code.png'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            // Open in new tab after download
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
      {
        !workFlowQrCodeGenerate && (
          <>
            <Link id={id} ellipsis={true} href={url} target='_blank' rel='noreferrer'>{url}</Link>
            <div style={{ cursor: 'pointer' }} onClick={()=>document.getElementById(id)?.click()}>
              <ChatbotLink/>
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
        )
      }
      {
        workFlowQrCodeGenerate && (
          <div>
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
            <Link id={id} ellipsis={true} href={url} target='_blank' rel='noreferrer'></Link>
            <Button
              ghost
              icon={<ChatbotLink />}
              style={{ top: '-9px' }}
              onClick={() => { document.getElementById(id)?.click() }}
            />
            <Button
              ghost
              icon={<QrCodeSmallIcon />}
              style={{ top: '-9px' }}
              onClick={handleDownloadQr}
              title={$t({ defaultMessage: 'Download QR' })}
            />
            {/* Hidden QR code for download */}
            <div
              ref={qrRef}
              style={{
                position: 'absolute',
                left: -9999,
                top: -9999,
                height: 0,
                width: 0,
                overflow: 'hidden'
              }}
              aria-hidden='true'
            >
              <QRCodeSVG
                value={url}
                size={240}
                bgColor='#ffffff'
                fgColor='#000000'
                level='L'
                includeMargin={false}
              />
            </div>
          </div>
        )
      }
    </div>
  )
}
