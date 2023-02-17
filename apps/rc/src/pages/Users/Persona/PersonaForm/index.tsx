import React, { useEffect, useState } from 'react'

import { Form, FormInstance, Radio, RadioChangeEvent, Space } from 'antd'
import { RcFile }                                             from 'antd/lib/upload'
import Dragger                                                from 'antd/lib/upload/Dragger'
import { useIntl }                                            from 'react-intl'

import { Button, Card, Subtitle } from '@acx-ui/components'
import { Persona }                from '@acx-ui/rc/utils'


import { PersonaContextForm } from './PersonaContextForm'
import { PersonaDevicesForm } from './PersonaDevicesForm'


export enum PersonaCreateMode {
  Manually,
  FromFile
}

export function PersonaForm (props: {
  form: FormInstance,
  defaultValue?: Partial<Persona>
}) {
  const { $t } = useIntl()
  const { form, defaultValue } = props
  const [createMode, setCreateMode] = useState(PersonaCreateMode.Manually)
  const [selectedGroupId, setSelectedGroupId] = useState('')
  // const [importFileName, setImportFileName] = useState<string>()

  useEffect(() => {
    if (defaultValue) {
      form.setFieldsValue(defaultValue)
      setCreateMode(PersonaCreateMode.Manually)

      if (!defaultValue.groupId) return
      setSelectedGroupId(defaultValue?.groupId)
    }
  }, [defaultValue])

  const onCreateModeChange = (e: RadioChangeEvent) => {
    setCreateMode(e.target.value)
  }

  const handlePreview = (file: RcFile) => {
    // TODO: Handle file import and parsing
    // setImportFileName(file.name)
    return !!file
  }

  return (
    <Space direction={'vertical'} size={20} style={{ display: 'flex' }}>
      {!defaultValue?.id &&
        <Radio.Group defaultValue={PersonaCreateMode.Manually} onChange={onCreateModeChange}>
          <Space direction={'vertical'} size={'middle'}>
            <Radio value={PersonaCreateMode.Manually}>
              {$t({ defaultMessage: 'Add manually' })}
            </Radio>
            <Radio value={PersonaCreateMode.FromFile}>
              {$t({ defaultMessage: 'Import from file' })}
            </Radio>
          </Space>
        </Radio.Group>
      }

      <PersonaContextForm
        form={form}
        mode={createMode}
        defaultValue={defaultValue}
        onGroupChange={setSelectedGroupId}
      />

      {(!defaultValue?.id && createMode !== PersonaCreateMode.FromFile) &&
          <>
            <Subtitle level={4}>{$t({ defaultMessage: 'Devices' })}</Subtitle>
            <Form
              form={form}
              name={'personaDevicesForm'}
              layout={'vertical'}
            >
              <Form.Item
                name={'devices'}
                children={<PersonaDevicesForm groupId={selectedGroupId}/>}
              />
            </Form>
          </>
      }

      {createMode === PersonaCreateMode.FromFile &&
        <Space direction={'vertical'} size={30} style={{ display: 'flex' }}>
          <Dragger
            showUploadList={false}
            style={{ width: '100%' }}
            beforeUpload={handlePreview}
          >
            <Card type={'solid-bg'}>
              <Space style={{ width: '100%', justifyContent: 'center' }}>
                Drag & drop file here or<Button type={'primary'}>Browser</Button>
              </Space>
            </Card>
          </Dragger>
          <div>
            • Download template or use file from latest import <br/>
            • File format must be csv
          </div>
        </Space>
      }
    </Space>
  )
}
