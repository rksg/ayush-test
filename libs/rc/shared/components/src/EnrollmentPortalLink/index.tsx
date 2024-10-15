import { Typography } from 'antd'


import { ChatbotLink } from '@acx-ui/icons'

export function EnrollmentPortalLink (props: { url: string }) {
  const { Link } = Typography
  const { url } = props
  const id = 'portalLink_' + url
  return <div style={{ display: 'flex' }}>
    <Link id={id} ellipsis={true} href={url} target='_blank' rel='noreferrer'>{url}</Link>
    <div style={{ cursor: 'pointer' }} onClick={()=>document.getElementById(id)?.click()}>
      <ChatbotLink/>
    </div>
  </div>
}