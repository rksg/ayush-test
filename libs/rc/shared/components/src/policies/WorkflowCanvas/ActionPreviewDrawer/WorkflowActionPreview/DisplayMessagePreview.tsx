import { DisplayMessageAction } from '@acx-ui/rc/utils'

export function DisplayMessagePreview (props: { data?: DisplayMessageAction }) {
  const { data } = props

  return <>
  I am DisplayMessage Preview component
    <div>{data?.title}</div>
  </>
}
