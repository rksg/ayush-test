import React            from 'react'
import { ReactElement } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Select, PageHeader, GridRow, GridCol, Button, ActionsContainer } from '@acx-ui/components'
import { useNavigate }                                                    from '@acx-ui/react-router-dom'

import { generateBreadcrumb } from './utils'



type CloudStorageFormProps = {
  editMode?: boolean
}
const CloudStorage: React.FC<CloudStorageFormProps> = ({ editMode=false }) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const storageMap = {
    azure: [{
      id: 'azureConnectionType',
      name: $t({ defaultMessage: 'Azure connection type' }),
      component: <Select
        options={[
          { value: 'azureFiles', label: $t({ defaultMessage: 'Azure Files' }) },
          { value: 'azureBlob', label: $t({ defaultMessage: 'Azure Blob' }) }
        ]}
      />
    }, {
      id: 'azureAccountName',
      name: $t({ defaultMessage: 'Azure account name' }),
      component: <Input />
    }, {
      id: 'azureAccountKey',
      name: $t({ defaultMessage: 'Azure account key' }),
      component: <Input />
    }, {
      id: 'azureShareName',
      name: $t({ defaultMessage: 'Azure share Name' }),
      component: <Input />
    }, {
      id: 'azureCustomerName',
      name: $t({ defaultMessage: 'Azure customer Name' }),
      component: <Input />
    }],
    ftp: [{
      id: 'ftpHost',
      name: $t({ defaultMessage: 'FTP server IP/hostname' }),
      component: <Input />
    }, {
      id: 'ftpPort',
      name: $t({ defaultMessage: 'FTP port' }),
      component: <Input />
    }, {
      id: 'ftpUserName',
      name: $t({ defaultMessage: 'FTP username' }),
      component: <Input />
    }, {
      id: 'ftpPassword',
      name: $t({ defaultMessage: 'FTP password' }),
      component: <Input type='password' />
    }],
    sftp: [{
      id: 'sftpHost',
      name: $t({ defaultMessage: 'SFTP server IP/hostname' }),
      component: <Input />
    }, {
      id: 'sftpPort',
      name: $t({ defaultMessage: 'SFTP port' }),
      component: <Input />
    }, {
      id: 'sftpUserName',
      name: $t({ defaultMessage: 'SFTP username' }),
      component: <Input />
    }, {
      id: 'sftpPassword',
      name: $t({ defaultMessage: 'SFTP password' }),
      component: <Input type='password' />
    }, {
      id: 'sftpPrivateKey',
      name: $t({ defaultMessage: 'SFTP private key' }),
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
      breadcrumb={generateBreadcrumb()}
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
            label={$t({ defaultMessage: 'Connection type' })}
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
