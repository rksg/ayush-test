import React, { useCallback, useMemo } from 'react'

import { Form, Input }   from 'antd'
import { FormItemProps } from 'antd/lib/form'
import { useIntl }       from 'react-intl'

import { Select, PageHeader, GridRow, GridCol, Button, ActionsContainer, Loader, showToast } from '@acx-ui/components'
import { useNavigate }                                                                       from '@acx-ui/react-router-dom'
import { getIntl  }                                                                          from '@acx-ui/utils'

import { useSaveStorageMutation, useGetStorageQuery }               from './services'
import { AzureConnectionType, AzureStoragePayload, ConnectionType } from './types'
import { generateBreadcrumb }                                       from './utils'

export const StorageOptions = [
  { value: 'azure', label: 'Azure' },
  { value: 'ftp', label: 'FTP' },
  { value: 'sftp', label: 'SFTP' }
]

type CloudStorageFormProps = {
  editMode?: boolean
}

type StorageFieldProps = {
  id: string,
  name: string,
  component: FormItemProps['children'],
  dependencies?: FormItemProps['dependencies'],
  rules?: FormItemProps['rules']
}

export const getFieldRules = (
  needValidation: boolean,
  selectedConnectionType: ConnectionType,
  crossCheckfieldName?: string
): FormItemProps['rules'] | undefined => {
  const { $t } = getIntl()

  if (!needValidation) {
    // return empty array to avoid being added required rule at the end of the form
    return []
  }

  switch (selectedConnectionType) {
    case ConnectionType.Azure:
      return [{
        required: true,
        message: $t({ defaultMessage: 'Please enter Azure account key' })
      }]
    case ConnectionType.FTP:
      return [{
        required: true,
        message: $t({ defaultMessage: 'Please enter FTP password' })
      }]
    case ConnectionType.SFTP:
      return [
        ({ getFieldValue }) => ({
          validator (_, value: string) {
            if (!value && !getFieldValue(crossCheckfieldName as string)) {
              return Promise.reject($t({
                defaultMessage: 'Please enter SFTP password or private key'
              }))
            }
            return Promise.resolve()
          }
        })
      ]
  }
}

const getStorageMap = (
  needValidation: boolean,
  selectedConnectionType: ConnectionType,
  azureConnectionType: AzureConnectionType
): Record<string, StorageFieldProps[]> => {
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
                value: AzureConnectionType.Files,
                label: $t({ defaultMessage: 'Azure Files' })
              },
              {
                value: AzureConnectionType.Blob,
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
        component: <Input data-testid='azureAccountKey' />,
        rules: getFieldRules(needValidation, selectedConnectionType)
      },
      ...(azureConnectionType === AzureConnectionType.Files
        ? [{
          id: 'azureShareName',
          name: $t({ defaultMessage: 'Azure share name' }),
          component: <Input data-testid='azureShareName' />
        }]
        : []
      ),
      ...(azureConnectionType === AzureConnectionType.Blob
        ? [{
          id: 'azureContainerName',
          name: $t({ defaultMessage: 'Azure container name' }),
          component: <Input data-testid='azureContainerName' />
        }]
        : []
      ),
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
        component: <Input type='password' />,
        rules: getFieldRules(needValidation, selectedConnectionType)
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
        component: <Input data-testid='sftpHost' />
      },
      {
        id: 'sftpPort',
        name: $t({ defaultMessage: 'SFTP port' }),
        component: <Input data-testid='sftpPort' />
      },
      {
        id: 'sftpUserName',
        name: $t({ defaultMessage: 'SFTP username' }),
        component: <Input data-testid='sftpUserName' />
      },
      {
        id: 'sftpPassword',
        name: $t({ defaultMessage: 'SFTP password' }),
        component: <Input type='password' data-testid='sftpPassword' />,
        dependencies: ['sftpPrivateKey'],
        rules: getFieldRules(needValidation, selectedConnectionType, 'sftpPrivateKey')
      },
      {
        id: 'sftpPrivateKey',
        name: $t({ defaultMessage: 'SFTP private key' }),
        component: <Input.TextArea rows={5} data-testid='sftpPrivateKey' />,
        dependencies: ['sftpPassword'],
        rules: getFieldRules(needValidation, selectedConnectionType, 'sftpPassword')
      },
      {
        id: 'sftpStoragePath',
        name: $t({ defaultMessage: 'SFTP storage path' }),
        component: <Input data-testid='sftpStoragePath' />
      }
    ]
  }
}

const CloudStorage: React.FC<CloudStorageFormProps> = ({ editMode=false }) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const azureConnectionType = Form.useWatch('azureConnectionType', form)
  const storage = useGetStorageQuery({}, { skip: !editMode })
  const selectedCloudStorage = storage.data?.config
  const selectedConnectionType: string = Form.useWatch('connectionType', form)
  const connectionType = selectedConnectionType || selectedCloudStorage?.connectionType
  const [updateStorage, { isLoading }] = useSaveStorageMutation()
  const isConnectionTypeChanged = selectedConnectionType !== selectedCloudStorage?.connectionType
    || (selectedCloudStorage?.connectionType === 'azure'
      && azureConnectionType !== (selectedCloudStorage as AzureStoragePayload)?.azureConnectionType)
  const isValidateSecretFields = !editMode || isConnectionTypeChanged
  const storageMap = useMemo(
    () => getStorageMap(isValidateSecretFields,
      selectedConnectionType as ConnectionType,
      azureConnectionType),
    [isValidateSecretFields, selectedConnectionType, azureConnectionType]
  )

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
              ?.map((item: StorageFieldProps) =>
                <Form.Item
                  key={item.id}
                  name={item.id}
                  label={item.name}
                  dependencies={item.dependencies}
                  rules={item.rules ?? [{
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
