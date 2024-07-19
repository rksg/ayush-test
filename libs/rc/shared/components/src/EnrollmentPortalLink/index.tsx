import { ChatbotLink } from '@acx-ui/icons'

export function EnrollmentPortalLink (props: { name: string, url: string }) {
  const { url, name } = props
  return <div>
    <a href={url} target='_blank' rel='noreferrer'>{name}  <ChatbotLink/></a>
  </div>
}