import { Form }                                      from 'antd'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { Button, showActionModal } from '@acx-ui/components'

const appDescriptions: Record<string, MessageDescriptor> = {
  google: defineMessage({ defaultMessage: '-The selected Google app will affect the popup '+
  'that users see on their first sign in to the network' }),
  facebook: defineMessage({ defaultMessage: '-The selected Facebook app will '+
  'affect the popup that users see on their first sign in to the network' }),
  linkedin: defineMessage({ defaultMessage: '-The selected LinkedIn app will affect the popup '+
  'that users see on their first sign in to the network' }),
  twitter: defineMessage({ defaultMessage: '-The selected Twitter app will affect the popup '+
  'that users see on their first sign in to the network' })
}
export default function PreviewApp (props:{
  type: string,
  companyDes?: string,
  appPhoto?: string
}) {
  const { $t } = useIntl()
  const getContent = <Form layout='vertical'>
    <Form.Item
      label={<>
        {$t(appDescriptions[props.type])}
      </>}/>
    <Form.Item
      label={<>
        {$t({ defaultMessage:
        '-Actual UI may be different and is not under Ruckus Wireless responsibility' })}
      </>}/>
    <Form.Item children={
      <img src={props.appPhoto} alt='app description'/>
    }/>
  </Form>
  const openModal=()=>{
    showActionModal({
      type: 'confirm',
      content: getContent,
      okCancel: false,
      title: $t({ defaultMessage: 'Preview App' }),
      width: 535

    })
  }
  return (
    <Button onClick={() => openModal()}
      style={{ fontSize: 12 }}
      type='link'
    >{$t({ defaultMessage: 'See example' })}</Button>

  )
}

