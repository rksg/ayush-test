import { useEffect, useState } from 'react'

import { useForm } from 'antd/lib/form/Form'
import { Key }     from 'antd/lib/table/interface'
import { useIntl } from 'react-intl'

import { Loader, Modal, Table, TableProps }  from '@acx-ui/components'
import { useGetNotificationRecipientsQuery } from '@acx-ui/rc/services'
import { NotificationEndpointType }          from '@acx-ui/rc/utils'
import { useParams }                         from '@acx-ui/react-router-dom'


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
  const [emailRecipientsList, setEmailRecipientsList] = useState<EmailRecipientType[]>([])

  const{ data: notificationRecipientsList, isFetching: fetchingAdmins } =
    useGetNotificationRecipientsQuery({ params }, { skip: !visible })

  useEffect(() => {

    if (notificationRecipientsList?.length){
      let _emailRecipientsList: EmailRecipientType[] = []
      notificationRecipientsList?.map(recipient => {
        const recipientDetails = recipient.endpoints
          .filter(endpoint => endpoint.type === NotificationEndpointType.email)
          .map(record => { return {
            id: recipient?.id,
            name: recipient?.description,
            email: record.destination
          }
          })
        _emailRecipientsList.push(...recipientDetails)
      })
      setEmailRecipientsList(_emailRecipientsList)
      if (currentEmailList && currentEmailList.length) {
        const existingEmails =
        _emailRecipientsList.filter(admin => currentEmailList.includes(admin.email))
        setSelectedRecipientsList(existingEmails)
      }
    }

  }, [currentEmailList, notificationRecipientsList])


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

  const handleRowSelectChange = (selectedRowKeys: Key[]) => {
    const _selectedRows = emailRecipientsList.filter(record => selectedRowKeys.includes(record.id))
    setSelectedRecipientsList(_selectedRows)
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
      <Loader states={[{
        isLoading: fetchingAdmins
      }]}>
        <Table
          columns={columns}
          dataSource={emailRecipientsList}
          rowKey='id'
          rowSelection={{
            onChange: handleRowSelectChange,
            type: 'checkbox',
            getCheckboxProps: (record: EmailRecipientType) => ({
              id: record.id,
              name: record.name,
              email: record.email
            }),
            selectedRowKeys: selectedRecipientsList.map(record => record.id)
          }}
        />
      </Loader>
    </Modal>
  )
}