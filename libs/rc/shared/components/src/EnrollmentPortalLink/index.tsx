import { ChatbotLink } from '@acx-ui/icons'

export function EnrollmentPortalLink (props: { url: string }) {
  const { url } = props
  return <div>
    <a href={url} target='_blank' rel='noreferrer'>{url}  <ChatbotLink/></a>
  </div>
}