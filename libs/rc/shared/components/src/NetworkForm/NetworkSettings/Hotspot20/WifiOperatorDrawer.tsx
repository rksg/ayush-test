import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

import { WifiOperatorForm } from '../../../policies/WifiOperator'

interface WifiOperatorDrawerProps {
    visible: boolean,
    setVisible: (v: boolean) => void,
    handleSave: (id?: string) => void
}

const WifiOperatorDrawer = (props: WifiOperatorDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, handleSave } = props

  const content = <WifiOperatorForm modalMode={true} editMode={false} modalCallBack={handleSave} />

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Wi-Fi Operator' })}
      visible={visible}
      width={450}
      children={content}
      onClose={handleClose}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          onCancel={handleClose}
          onSave={async () => handleSave()}
        />
      }
    />
  )
}

export default WifiOperatorDrawer