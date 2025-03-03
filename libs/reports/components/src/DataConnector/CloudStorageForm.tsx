import React, { useCallback } from 'react'
import { ReactElement }       from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Select, PageHeader, GridRow, GridCol, Button, ActionsContainer, Loader, showToast } from '@acx-ui/components'
import { useNavigate }                                                                       from '@acx-ui/react-router-dom'
import { getIntl  }                                                                          from '@acx-ui/utils'

import { useSaveStorageMutation, useGetStorageQuery } from './services'
import { generateBreadcrumb }                         from './utils'


export const StorageOptions = [
  { value: 'azure', label: 'Azure' },
  { value: 'ftp', label: 'FTP' },
  { value: 'sftp', label: 'SFTP' }
]

type CloudStorageFormProps = {
  editMode?: boolean
}
const getStorageMap = () => {
  const { $t } = getIntl()
  return {
    azure: [
      {
        id: 'azureConnectionType',
        name: $t({ defaultMessage: 'Azure connection type' }),
        component: (
          <Select
            options={[
              {
                value: 'azureFiles',
                label: $t({ defaultMessage: 'Azure Files' })
              },
              {
                value: 'azureBlob',
                label: $t({ defaultMessage: 'Azure Blob' })
              }
            ]}
          />
        )
      },
      {
        id: 'azureAccountName',
        name: $t({ defaultMessage: 'Azure account name' }),
        component: <Input data-testid='azureAccountName' />
      },
      {
        id: 'azureAccountKey',
        name: $t({ defaultMessage: 'Azure account key' }),
        component: <Input data-testid='azureAccountKey' />
      },
      {
        id: 'azureShareName',
        name: $t({ defaultMessage: 'Azure share name' }),
        component: <Input data-testid='azureShareName' />
      },
      {
        id: 'azureCustomerName',
        name: $t({ defaultMessage: 'Azure customer name' }),
        component: <Input data-testid='azureCustomerName' />
      },
      {
        id: 'azureStoragePath',
        name: $t({ defaultMessage: 'Azure storage path' }),
        component: <Input data-testid='azureStoragePath' />
      }
    ],
    ftp: [
      {
        id: 'ftpHost',
        name: $t({ defaultMessage: 'FTP server IP/hostname' }),
        component: <Input />
      },
      {
        id: 'ftpPort',
        name: $t({ defaultMessage: 'FTP port' }),
        component: <Input />
      },
      {
        id: 'ftpUserName',
        name: $t({ defaultMessage: 'FTP username' }),
        component: <Input />
      },
      {
        id: 'ftpPassword',
        name: $t({ defaultMessage: 'FTP password' }),
        component: <Input type='password' />
      },
      {
        id: 'ftpStoragePath',
        name: $t({ defaultMessage: 'FTP storage path' }),
        component: <Input />
      }
    ],
    sftp: [
      {
        id: 'sftpHost',
        name: $t({ defaultMessage: 'SFTP server IP/hostname' }),
        component: <Input />
      },
      {
        id: 'sftpPort',
        name: $t({ defaultMessage: 'SFTP port' }),
        component: <Input />
      },
      {
        id: 'sftpUserName',
        name: $t({ defaultMessage: 'SFTP username' }),
        component: <Input />
      },
      {
        id: 'sftpPassword',
        name: $t({ defaultMessage: 'SFTP password' }),
        component: <Input type='password' />
      },
      {
        id: 'sftpPrivateKey',
        name: $t({ defaultMessage: 'SFTP private key' }),
        component: <Input />
      },
      {
        id: 'sftpStoragePath',
        name: $t({ defaultMessage: 'SFTP storage path' }),
        component: <Input />
      }
    ]
  }
}

const CloudStorage: React.FC<CloudStorageFormProps> = ({ editMode=false }) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const storageMap = getStorageMap()
  const storage = useGetStorageQuery({}, { skip: !editMode })
  const selectedCloudStorage = storage.data?.config
  const [form] = Form.useForm()
  const selectedConnectionType: string = Form.useWatch('connectionType', form)
  const connectionType = selectedConnectionType || selectedCloudStorage?.connectionType
  const [updateStorage, { isLoading }] = useSaveStorageMutation()

  const saveStorage = useCallback(() => {
    const data = form.getFieldsValue()
    if (editMode) {
      data.id = storage.data?.id
      data.isEdit = true
    }
    updateStorage(data)
      .unwrap()
      .then(() => {
        showToast({
          type: 'success',
          content: $t({ defaultMessage: 'Storage saved successfully!' })
        })
        navigate(-1)
      })
      .catch(({ data: { error } }) => {
        showToast({ type: 'error', content: error })
      })
  }, [form, editMode, storage.data?.id, navigate, updateStorage, $t])
  const initialValues =
    editMode ? selectedCloudStorage : { connectionType: 'azure' }
  return <>
    <PageHeader
      title={editMode
        ? $t({ defaultMessage: 'Cloud Storage' })
        : $t({ defaultMessage: 'New Cloud Storage' })
      }
      breadcrumb={generateBreadcrumb()}
    />
    <Loader states={[{ isLoading: isLoading || storage.isLoading }]}>
      <GridRow>
        <GridCol col={{ span: 12 }} style={{ minHeight: '180px' }}>
          <Form
            initialValues={initialValues}
            layout='vertical'
            form={form}
          >
            <Form.Item
              name='connectionType'
              label={$t({ defaultMessage: 'Connection type' })}
              required
            >
              <Select
                options={StorageOptions}
              />
            </Form.Item>
            {storageMap[connectionType as keyof typeof storageMap]
              ?.map((item: { id: string, name: string, component: ReactElement }) =>
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
                form
                  .validateFields()
                  .then(() => {
                    saveStorage()
                  })
                  .catch(() => {})
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
    </Loader>
  </>
}
export default CloudStorage
