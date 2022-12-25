import { Button, cssStr, Modal } from '@acx-ui/components'
import { getIntl } from '@acx-ui/utils'
export function SwitchRequirementsModal (props: {
    // isModalVisible: boolean
}) {
  const { $t } = getIntl()
  return (

    <Modal
      title={$t({ defaultMessage: 'Generate New Password' })}
      visible={true}//{props.isModalVisible}
      okText={$t({ defaultMessage: 'Generate' })}
      destroyOnClose={true}
      footer={[
        <Button
          key='okBtn'
        //   onClick={onClose}
          >
          {$t({ defaultMessage: 'OK' })}
        </Button>
      ]}
    // onCancel={closeModal}
    // onOk={saveModal}
    ></Modal>
  )

}

