import { Form, FormInstance } from 'antd'
import { useIntl }            from 'react-intl'

import { Drawer } from '@acx-ui/components'

import WifiOperatorSettingForm from '../../policies/WifiOperator/WifiOperatorForm/WifiOperatorSettingForm'

interface WifiOperatorDrawerProps {
    visible: boolean,
    drawerForm: FormInstance,
    handleClose: () => void,
    handleSave: () => void
}

const WifiOperatorDrawer = (props: WifiOperatorDrawerProps) => {
  const { $t } = useIntl()
  const { visible, drawerForm, handleClose, handleSave } = props

  const content = <Form layout='vertical' form={drawerForm}>
    <WifiOperatorSettingForm edit={false} />
  </Form>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Wi-Fi Operator' })}
      visible={visible}
      width={450}
      children={content}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          onCancel={() => { handleClose() }}
          onSave={async () => handleSave()}
        />
      }
    />
  )
}

export default WifiOperatorDrawer