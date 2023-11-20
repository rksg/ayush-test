import { useEffect, useState } from 'react'

import { useForm } from 'antd/lib/form/Form'
import { Key }     from 'antd/lib/table/interface'
import { useIntl } from 'react-intl'

import { Modal, Table, TableProps } from '@acx-ui/components'
import { useGetAdminListQuery }     from '@acx-ui/rc/services'
import { useParams }                from '@acx-ui/react-router-dom'


export interface EmailRecipientDialogProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: string[]) => void,
  currentEmailList?: string []
}

type EmailRecipientType = {
  id: string;
  email: string;
  name: string
}

export function EmailRecipientDialog (props: EmailRecipientDialogProps) {
  const { $t } = useIntl()
  const params = useParams()
  const [form] = useForm()
  const { visible, onCancel, onSubmit, currentEmailList } = props
  const [selectedRecipientsList, setSelectedRecipientsList] = useState<EmailRecipientType[]>([])

  const { data: adminList, isFetching: fetchingAdmins } =
    useGetAdminListQuery({ params }, { skip: !visible })

  useEffect(() => {

    if (adminList?.length && currentEmailList && currentEmailList.length){
      const existingEmails = adminList.filter(admin => currentEmailList.includes(admin.email) )
      setSelectedRecipientsList(existingEmails)
    }

  }, [adminList, currentEmailList])


  const columns:TableProps<EmailRecipientType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'Email' }),
      key: 'email',
      dataIndex: 'email'
    }
  ]

  const onModalCancel = () => {
    form.resetFields()
    onCancel()
  }

  const onModalSubmit = () => {
    const emailRecipients: string[] = []
    selectedRecipientsList.map(o => emailRecipients.push(o.email))
    setSelectedRecipientsList([])
    onSubmit(emailRecipients)
  }

  const handleRowSelectChange = (selectedRowKeys: Key[], selectedRows: EmailRecipientType[]) => {
    setSelectedRecipientsList(selectedRows)
  }

  return (
    <Modal
      title={$t({ defaultMessage: 'Select Recipients' })}
      subTitle={$t({
        defaultMessage: 'Select the recipients who will receive the event report via email. ' +
      'The recipient list data comes from Administration Notifications.' })}
      visible={visible}
      okText={$t({ defaultMessage: 'Select' })}
      onOk={onModalSubmit}
      okButtonProps={{
        disabled: fetchingAdmins
      }}
      onCancel={onModalCancel}
    >
      <Table
        columns={columns}
        dataSource={adminList}
        rowKey='email'
        rowSelection={{
          type: 'checkbox',
          onChange: handleRowSelectChange,
          getCheckboxProps: (record: EmailRecipientType) => ({
            name: record.name,
            email: record.email
          }),
          selectedRowKeys: currentEmailList
        }}
      />
    </Modal>
  )
}