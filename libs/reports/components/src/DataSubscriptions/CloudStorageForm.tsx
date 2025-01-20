import React            from 'react'
import { ReactElement } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Select, PageHeader, GridRow, GridCol, Button, ActionsContainer } from '@acx-ui/components'
import { useNavigate }                                                    from '@acx-ui/react-router-dom'

import { generateBreadcrumb } from './utils'



type CloudStorageFormProps = {
  editMode?: boolean
  isRAI?: boolean
}
const CloudStorage: React.FC<CloudStorageFormProps> = ({ isRAI, editMode=false }) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
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
      name: $t({ defaultMessage: 'FTP Server IP/hostname' }),
      component: <Input />
    }, {
      id: 'ftpUserName',
      name: $t({ defaultMessage: 'FTP Username' }),
      component: <Input />
    }, {
      id: 'ftpPassword',
      name: $t({ defaultMessage: 'FTP Password' }),
      component: <Input type='password' />
    }, {
      id: 'ftpPort',
      name: $t({ defaultMessage: 'FTP Port' }),
      component: <Input />
    }],
    sftp: [{
      id: 'sftpHost',
      name: $t({ defaultMessage: 'SFTP Server IP/hostname' }),
      component: <Input />
    }, {
      id: 'sftpUserName',
      name: $t({ defaultMessage: 'SFTP Username' }),
      component: <Input />
    }, {
      id: 'sftpPassword',
      name: $t({ defaultMessage: 'SFTP Password' }),
      component: <Input type='password' />
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
  // To be fetched from api
  const selectedCloudStorage = {
    connectionType: 'azure',
    azureConnectionType: 'Azure Files',
    azureAccountName: 'some name',
    azureAccountKey: 'key',
    azureShareName: 'share name',
    azureCustomerName: 'name'
  }
  const [form] = Form.useForm()
  const selectedConnectionType: string = Form.useWatch('connectionType', form)
  const connectionType = selectedConnectionType || selectedCloudStorage.connectionType
  const comps = storageMap[connectionType as keyof typeof storageMap]
  return <>
    <PageHeader
      title={editMode
        ? $t(
          { defaultMessage: 'Cloud Storage: {type}' },
          { type: selectedCloudStorage.connectionType }
        )
        : $t({ defaultMessage: 'New Cloud Storage' })
      }
      breadcrumb={generateBreadcrumb({ isRAI })}
    />
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ minHeight: '180px' }}>
        <Form
          initialValues={
            editMode ? selectedCloudStorage : { connectionType: 'azure' }
          }
          layout='vertical'
          form={form}
        >
          <Form.Item
            name='connectionType'
            label={$t({ defaultMessage: 'Connection Type' })}
            required
          >
            <Select
              options={[
                { value: 'azure', label: 'Azure' },
                { value: 'ftp', label: 'FTP' },
                { value: 'sftp', label: 'SFTP' }
              ]}
            />
          </Form.Item>
          {comps?.map((item: { id: string, name: string, component: ReactElement }) =>
            <Form.Item
              key={item.id}
              name={item.id}
              label={item.name}
              rules={[{
                required: true,
                message: $t({ defaultMessage: '{label} is required!' }, { label: item.name })
              }]}
            >
              {item.component}
            </Form.Item>)}
        </Form>
      </GridCol>
    </GridRow>
    <GridRow >
      <ActionsContainer>
        <GridCol col={{ span: 12 }} style={{ flexDirection: 'row-reverse' }}>
          <Button
            type='primary'
            style={{ marginLeft: '20px' }}
            onClick={() => {
              console.log(form.getFieldsValue()) // eslint-disable-line no-console
              // TODO Add validations and submit
              form.submit()
            }}
          >
            {$t({ defaultMessage: 'Save' })}
          </Button>
          <Button
            type='default'
            onClick={() => {
              navigate(-1)
            }}
          >{$t({ defaultMessage: 'Cancel' })}</Button>
        </GridCol>
      </ActionsContainer>
    </GridRow>
  </>
}
export default CloudStorage
