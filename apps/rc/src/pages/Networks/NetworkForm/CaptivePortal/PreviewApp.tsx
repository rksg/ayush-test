import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, showActionModal } from '@acx-ui/components'


export default function PreviewApp (props:{
  appDescription?: string,
  companyDes?: string,
  appPhoto?: string
}) {
  const { $t } = useIntl()
  const getContent = <Form layout='vertical'>
    <Form.Item
      label={<>
        {$t({ defaultMessage: '{appDes}' }, { appDes: props.appDescription })}
      </>}/>
    <Form.Item
      label={<>
        {$t({ defaultMessage: '{comDes}' }, { comDes: props.companyDes||
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

