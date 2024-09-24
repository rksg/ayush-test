import { ChatbotLink } from '@acx-ui/icons'

export function EnrollmentPortalLink (props: { url: string }) {
  const { url } = props
  return <div>
    <a href={url} target='_blank' rel='noreferrer'>
      {url.length > 55 ? url.substring(0, 55) + '...' : url}
      <ChatbotLink/>
    </a>
  </div>
}