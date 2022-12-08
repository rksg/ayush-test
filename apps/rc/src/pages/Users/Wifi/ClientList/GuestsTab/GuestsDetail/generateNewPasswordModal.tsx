import { Checkbox, Typography } from 'antd'

import { cssStr, Modal, Table, TableProps } from '@acx-ui/components'
import { Guest }                            from '@acx-ui/rc/utils'
import { getIntl }                          from '@acx-ui/utils'

import { CheckboxLabel, EnvelopClosedOutlinedIcon, MobilePhoneOutlinedIcon, PrinterOutlinedIcon } from '../styledComponents'


export function GenerateNewPasswordModal (props: {
  generateModalVisible: boolean,
  setGenerateModalVisible: (visible: boolean) => void,
  guestDetail: Guest }) {

  const closeModal = () => {
    props.setGenerateModalVisible(false)
  }
  const { $t } = getIntl()
  return (<Modal
    title={$t({ defaultMessage: 'Generate New Password' })}
    visible={props.generateModalVisible}
    // width={900}
    // cancelButtonProps={{ style: { display: 'none' } }}
    okText={$t({ defaultMessage: 'Generate' })}
    destroyOnClose={true}
    // onOk={closeModal}
    onCancel={closeModal}
  >
    <Typography.Text style={{
      display: 'block', marginBottom: '20px',
      color: cssStr('--acx-neutrals-60')
    }}>
      {$t({ defaultMessage: 'How would you like to give the new password to the guest:' })}
    </Typography.Text>
    <Checkbox.Group style={{ display: 'grid', rowGap: '20px', marginBottom: '20px' }}>
      <Checkbox value='SMS'
        style={{ alignItems: 'start' }}
        // disabled={phoneNumberError}
      >
        <MobilePhoneOutlinedIcon />
        <CheckboxLabel>{$t({ defaultMessage: 'Send to Phone' })}</CheckboxLabel>
      </Checkbox>
      <Checkbox
        value='MAIL'
        style={{ marginLeft: '0px', alignItems: 'start' }}
        // disabled={emailError}
      >
        <EnvelopClosedOutlinedIcon />
        <CheckboxLabel>{$t({ defaultMessage: 'Send to Email' })}</CheckboxLabel>
      </Checkbox>
      <Checkbox
        value='PRINT'
        style={{ marginLeft: '0px', alignItems: 'start' }}
      >
        <PrinterOutlinedIcon />
        <CheckboxLabel>{$t({ defaultMessage: 'Print Guest pass' })}</CheckboxLabel>
      </Checkbox>
    </Checkbox.Group>
  </Modal>)
}
