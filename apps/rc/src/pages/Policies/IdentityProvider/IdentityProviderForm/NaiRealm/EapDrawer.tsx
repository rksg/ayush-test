import { useEffect, useMemo, useState } from 'react'

import { Col, Form, InputNumber, Row, Space } from 'antd'
import { cloneDeep }                          from 'lodash'
import { useIntl }                            from 'react-intl'

import { Button, Drawer, Select } from '@acx-ui/components'
import { DeleteOutlinedIcon }     from '@acx-ui/icons'
import {
  EapType,
  NaiRealmAuthInfoDisplayMap,
  NaiRealmAuthInfoEnum,
  NaiRealmAuthTypeCredentialDisplayMap,
  NaiRealmAuthTypeCredentialEnum,
  NaiRealmAuthTypeInnerDisplayMap,
  NaiRealmAuthTypeInnerEnum,
  NaiRealmAuthTypeNonEapDisplayMap,
  NaiRealmAuthTypeNonEapEnum,
  NaiRealmAuthTypeTunneledDisplayMap,
  NaiRealmAuthTypeTunneledEnum,
  NaiRealmEapMethodDisplayMap,
  NaiRealmEapMethodEnum
} from '@acx-ui/rc/utils'

import { EAP_AUTH_INFO_MAX_COUNT, EAP_MAX_COUNT } from '../../constants'

type EapDrawerProps = {
  visible: boolean
  setVisible: (visible: boolean) => void
  editIndex: number,
  dataList: EapType[],
  updateDataList: (d: EapType[]) => void
}

const AllowShowAddAnotherLength = EAP_MAX_COUNT - 1
const AuthInfoTypeSelectWidth = '200px'

const initEap: EapType = {
  method: NaiRealmEapMethodEnum.MD5,
  authInfos: []
}

const EapDrawer = (props: EapDrawerProps) => {
  const { $t } = useIntl()

  const [form] = Form.useForm()

  const { visible, setVisible, editIndex, dataList, updateDataList } = props
  const isEditMode = (editIndex !== -1)

  const title = isEditMode
    ? $t({ defaultMessage: 'Edit EAP Method' })
    : $t({ defaultMessage: 'Add EAP Method' })


  const EapMethodOptions = useMemo(() => {
    return Object.entries(NaiRealmEapMethodDisplayMap).map(([enumKey, displayText]) => ({
      value: enumKey as NaiRealmEapMethodEnum,
      label: $t(displayText)
    }))
  }, [])

  const EapAuthInfoOptions = useMemo(() => {
    return Object.entries(NaiRealmAuthInfoDisplayMap).map(([enumKey, displayText]) => ({
      value: enumKey as NaiRealmAuthInfoEnum,
      label: $t(displayText)
    }))
  }, [])

  const EapAuthTypeNonEapOptions = useMemo(() => {
    return Object.entries(NaiRealmAuthTypeNonEapDisplayMap).map(([enumKey, displayText]) => ({
      value: enumKey as NaiRealmAuthTypeNonEapEnum,
      label: $t(displayText)
    }))
  }, [])

  const EapAuthTypeInnerOptions = useMemo(() => {
    return Object.entries(NaiRealmAuthTypeInnerDisplayMap).map(([enumKey, displayText]) => ({
      value: enumKey as NaiRealmAuthTypeInnerEnum,
      label: $t(displayText)
    }))
  }, [])

  const EapAuthTypeCredentialOptions = useMemo(() => {
    return Object.entries(NaiRealmAuthTypeCredentialDisplayMap).map(([enumKey, displayText]) => ({
      value: enumKey as NaiRealmAuthTypeCredentialEnum,
      label: $t(displayText)
    }))
  }, [])

  const EapAuthTypeTunneledOptions = useMemo(() => {
    return Object.entries(NaiRealmAuthTypeTunneledDisplayMap).map(([enumKey, displayText]) => ({
      value: enumKey as NaiRealmAuthTypeTunneledEnum,
      label: $t(displayText)
    }))
  }, [])

  const [ authInfoTypes, setAuthInfoTypes ] = useState([
    NaiRealmAuthInfoEnum.Expanded,
    NaiRealmAuthInfoEnum.Expanded,
    NaiRealmAuthInfoEnum.Expanded,
    NaiRealmAuthInfoEnum.Expanded ])


  useEffect(() => {
    if (visible && form) {
      const authInfosInfo = [
        NaiRealmAuthInfoEnum.Expanded,
        NaiRealmAuthInfoEnum.Expanded,
        NaiRealmAuthInfoEnum.Expanded,
        NaiRealmAuthInfoEnum.Expanded
      ]

      if (isEditMode) {
        const eap = cloneDeep(dataList?.[editIndex]!)
        eap.authInfos?.forEach((authInfo, index) => {
          authInfosInfo[index] = authInfo.info
        })
        form.setFieldsValue(eap)
      }

      setAuthInfoTypes(authInfosInfo)
    }

  }, [editIndex, visible, form, isEditMode, dataList])

  const updateAuthInfoType = async (v: NaiRealmAuthInfoEnum, index: number) => {
    const newData = cloneDeep(authInfoTypes)
    newData[index] = v
    setAuthInfoTypes(newData)
  }

  const content = (
    <Form form={form}
      layout='vertical'
      preserve={visible && isEditMode}
      initialValues={cloneDeep(initEap)}
    >
      <Form.Item
        name='method'
        label={$t({ defaultMessage: 'EAP Method' })}
        style={{ width: '455px' }}
        rules={[{ required: true }]}
        children={<Select options={EapMethodOptions} />}
      />

      <Form.List name='authInfos' >
        {(fields, { add, remove }) => (
          <Row >
            {
              fields.map((field, index) =>
                <Space key={`authInfo-${index}`}>
                  <Col>
                    <Form.Item
                      name={[index, 'info']}
                      label={$t({ defaultMessage: 'Auth Type' })}
                      style={{ width: '250px' }}
                      initialValue={NaiRealmAuthInfoEnum.Expanded}
                      rules={[{ required: true }]}
                      children={<Select options={EapAuthInfoOptions}
                        onChange={(v) => updateAuthInfoType(v, index)}
                      />}
                    />
                  </Col>
                  {(authInfoTypes[index] === NaiRealmAuthInfoEnum.Expanded ||
                      authInfoTypes[index] === NaiRealmAuthInfoEnum.Expanded_Inner) &&
                      <Col>
                        <Space style={{ width: AuthInfoTypeSelectWidth }}>
                          <Form.Item
                            name={[index, 'vendorId']}
                            label={$t({ defaultMessage: 'Vendor ID' })}
                            style={{ width: '85px' }}
                            rules={[{ required: true }]}
                            children={<InputNumber
                              controls={false}
                              min={0}
                              max={16777215}
                              precision={0}
                            />}
                          />
                          <Form.Item
                            name={[index, 'vendorType']}
                            label={$t({ defaultMessage: 'Vendor Type' })}
                            rules={[{ required: true }]}
                            children={<InputNumber
                              style={{ width: '110px' }}
                              controls={false}
                              min={0}
                              max={4294967295}
                              precision={0}
                            />}
                          />
                        </Space>
                      </Col>
                  }
                  {authInfoTypes[index] === NaiRealmAuthInfoEnum.Non_Eap &&
                      <Col>
                        <Form.Item
                          name={[index, 'nonEapAuth']}
                          label={$t({ defaultMessage: 'SubType' })}
                          style={{ width: AuthInfoTypeSelectWidth }}
                          rules={[{ required: true }]}
                          children={<Select options={EapAuthTypeNonEapOptions} />}
                        />
                      </Col>
                  }
                  {authInfoTypes[index] === NaiRealmAuthInfoEnum.Inner &&
                    <Col>
                      <Form.Item
                        name={[index, 'eapInnerAuth']}
                        label={$t({ defaultMessage: 'SubType' })}
                        style={{ width: AuthInfoTypeSelectWidth }}
                        rules={[
                          { required: true }
                        ]}
                        children={<Select options={EapAuthTypeInnerOptions} />}
                      />
                    </Col>
                  }
                  {authInfoTypes[index] === NaiRealmAuthInfoEnum.Credential &&
                    <Col>
                      <Form.Item
                        name={[index, 'credentialType']}
                        label={$t({ defaultMessage: 'SubType' })}
                        style={{ width: AuthInfoTypeSelectWidth }}
                        rules={[{ required: true }]}
                        children={<Select options={EapAuthTypeCredentialOptions} />}
                      />
                    </Col>
                  }
                  {authInfoTypes[index] === NaiRealmAuthInfoEnum.Tunneled &&
                    <Col>
                      <Form.Item
                        name={[index, 'tunneledType']}
                        label={$t({ defaultMessage: 'SubType' })}
                        style={{ width: AuthInfoTypeSelectWidth }}
                        rules={[{ required: true }]}
                        children={<Select options={EapAuthTypeTunneledOptions} />}
                      />
                    </Col>
                  }
                  {
                    <Col style={{ textAlign: 'end' }}>
                      <Button
                        aria-label='delete'
                        type='link'
                        size='large'
                        icon={<DeleteOutlinedIcon />}
                        style={{ width: '50px' }}
                        onClick={() => remove(field.name)}
                      />
                    </Col>
                  }
                </Space>
              )
            }
            <Col span={24}>
              {fields.length < EAP_AUTH_INFO_MAX_COUNT &&
                  <Button
                    type='link'
                    onClick={() => add()}
                    children={$t({ defaultMessage: 'Add another Auth' })}
                  />
              }
            </Col>
          </Row>
        )}
      </Form.List>
    </Form>
  )

  const onClose = () => {
    form.resetFields()
    setVisible(false)
  }

  const onSave = async (addAnotherChecked: boolean) => {
    try {
      await form.validateFields()
      const { method, authInfos } = form.getFieldsValue()

      const newData = (isEditMode)
        ? dataList.map((value, index) => {
          return (index === editIndex)? { method, authInfos, rowId: editIndex } : value
        })
        : [...dataList, { method, authInfos, rowId: dataList?.length || 0 }]

      updateDataList(newData)

      form.submit()

      if (!addAnotherChecked || dataList.length >= AllowShowAddAnotherLength) {
        onClose()
      } else {
        form.resetFields()
      }
    } catch (error) {
      if (error instanceof Error) throw error
    }
  }

  return (
    <Drawer
      title={title}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={content}
      width={'550px'}
      footer={
        <Drawer.FormFooter
          showAddAnother={!isEditMode && dataList.length < AllowShowAddAnotherLength}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another EAP Method' }),
            save: isEditMode? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={onSave}
        />
      }
    />
  )
}

export default EapDrawer