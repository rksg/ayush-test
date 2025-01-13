import { Form, Input } from 'antd'

import { useIntl } from 'react-intl'

import { StepsForm, Select } from '@acx-ui/components'
import { ReactElement } from 'react'

const CloudStorage = () => {
  const { $t } = useIntl()
  const storageMap = {
    azure: [{
      id: 'azureConnectionType',
      name: $t({ defaultMessage: 'Azure Connection Type' }),
      component: <Select
        options={[
          { value: 'azureFiles', label: $t({ defaultMessage: 'Azure Files' }) },
          { value: 'azureBlob', label: $t({ defaultMessage: 'Azure Blob' }) }
        ]}
      />
    }, {
      id: 'azureAccountName',
      name: $t({ defaultMessage: 'Azure Account Name' }),
      component: <Input />
    }, {
      id: 'azureAccountKey',
      name: $t({ defaultMessage: 'Azure Account key' }),
      component: <Input />
    }, {
      id: 'azureShareName',
      name: $t({ defaultMessage: 'Azure Share Name' }),
      component: <Input />
    }, {
      id: 'azureCustomerName',
      name: $t({ defaultMessage: 'Azure Customer Name' }),
      component: <Input />
    }],
    ftp: [{
      id: 'ftpHost',
      name: $t({ defaultMessage: 'FTP server IP/hostname' }),
      component: <Input />
    }, {
      id: 'ftpUserName',
      name: $t({ defaultMessage: 'Username' }),
      component: <Input />
    }, {
      id: 'ftppassword',
      name: $t({ defaultMessage: 'passowrd' }),
      component: <Input />
    }],
    sftp: [{
      id: 'sftpHost',
      name: $t({ defaultMessage: 'SFTP server IP/hostname' }),
      component: <Input />
    }, {
      id: 'sftpUserName',
      name: $t({ defaultMessage: 'Username' }),
      component: <Input />
    }, {
      id: 'sftppassword',
      name: $t({ defaultMessage: 'passowrd' }),
      component: <Input />
    }, {
      id: 'sftpPort',
      name: $t({ defaultMessage: 'SFTP Port' }),
      component: <Input />
    }, {
      id: 'sftpPrivateKey',
      name: $t({ defaultMessage: 'SFTP Private Key' }),
      component: <Input />
    }]
  }
  const selectedConnectionType: string = Form.useWatch('connectionType')
  const comps = storageMap[selectedConnectionType as keyof typeof storageMap]
  return <>
    <StepsForm.Title children={$t({ defaultMessage: 'Cloud Storage (First time configuration)' })} />
    <Form.Item name='connectionType' label={$t({ defaultMessage: 'Connection Type' })} required>
      <Select
        options={[
        { value: 'azure', label: 'Azure' },
        { value: 'ftp', label: 'FTP' },
        { value: 'sftp', label: 'SFTP' }
      ]}
      />
    </Form.Item>
    {comps?.map((item: { id: string, name: string, component: ReactElement }) =>
      <Form.Item key={item.id} name={item.id} label={item.name} required>
        {item.component}
      </Form.Item>)}
  </>
}
export default CloudStorage
