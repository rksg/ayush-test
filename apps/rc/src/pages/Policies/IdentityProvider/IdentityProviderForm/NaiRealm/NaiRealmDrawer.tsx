import { useContext, useEffect, useMemo, useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer, Select }   from '@acx-ui/components'
import {
  EapType,
  IdentityProviderActionType,
  NaiRealmEcodingDisplayMap,
  NaiRealmEcodingEnum, NaiRealmType,
  servicePolicyNameRegExp
} from '@acx-ui/rc/utils'

import IdentityProviderFormContext from '../IdentityProviderFormContext'

import EapTable from './EapTable'



type NaiRealmDrawerProps = {
  visible: boolean
  setVisible: (visible: boolean) => void
  editIndex: number
}

const NaiRealmDrawer = (props: NaiRealmDrawerProps) => {
  const { $t } = useIntl()

  const [form] = Form.useForm()
  const { state, dispatch } = useContext(IdentityProviderFormContext)
  const [ eapMethods, setEapMethods ] = useState<EapType[]>()
  const { visible, setVisible, editIndex } = props
  const isEditMode = (editIndex !== -1)

  const title = isEditMode
    ? $t({ defaultMessage: 'Edit Realm' })
    : $t({ defaultMessage: 'Add Realm' })


  const realmEcodingOptions = useMemo(() => {
    return Object.entries(NaiRealmEcodingDisplayMap).map(([enumKey, displayText]) => ({
      value: enumKey as NaiRealmEcodingEnum,
      label: $t(displayText)
    }))
  }, [])

  useEffect(() => {
    if (form) {
      let naiRealm = {
        name: '',
        encoding: NaiRealmEcodingEnum.RFC4282
      } as NaiRealmType

      if (isEditMode) {
        naiRealm = state.naiRealms?.[editIndex]!
      }
      form.setFieldsValue(naiRealm)
      setEapMethods(naiRealm.eap)
    }

  }, [editIndex, form, isEditMode, state])


  const nameDuplicationValidator = async (value: string) => {
    const { naiRealms } = state
    const existNames = (naiRealms)
      ? naiRealms.filter(r=> (r.rowId !== editIndex)).map(r => r.name)
      : []

    return (existNames.includes(value))
      ? Promise.reject($t({ defaultMessage: 'The Realm Name already exists' }))
      : Promise.resolve()
  }

  const content = (
    <Form form={form}
      layout='vertical'
    >
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'Realm Name' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 32 },
          { validator: (_, value) => servicePolicyNameRegExp(value) },
          { validator: (_, value) => nameDuplicationValidator(value) }
        ]}
        validateFirst
        children={<Input />}
      />
      <Form.Item
        name='encoding'
        label={$t({ defaultMessage: 'Encoding' })}
        children={<Select options={realmEcodingOptions} />}
      />
      <Form.Item
        name='eap'
        label={$t({ defaultMessage: 'EAP Methods' })}
        children={<EapTable data={eapMethods} setData={setEapMethods} />}
      />
    </Form>
  )

  const onClose = () => {
    setVisible(false)
  }

  const onSave = async (addAnotherRuleChecked: boolean) => {
    try {
      await form.validateFields()
      const { name, encoding } = form.getFieldsValue()

      if (isEditMode) {
        dispatch({
          type: IdentityProviderActionType.UPDATE_REALM,
          payload: {
            name: name,
            encoding: encoding,
            eap: eapMethods,
            rowId: editIndex
          }
        })
      } else {
        const index = state.plmns?.length || 0
        dispatch({
          type: IdentityProviderActionType.ADD_REALM,
          payload: {
            name: name,
            encoding: encoding,
            eap: eapMethods,
            rowId: index
          }
        })
      }

      form.submit()
      form.resetFields()

      if (!addAnotherRuleChecked) {
        onClose()
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
      width={'450px'}
      footer={
        <Drawer.FormFooter
          showAddAnother={!isEditMode}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another Realm' }),
            save: isEditMode? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={onSave}
        />
      }
    />
  )
}

export default NaiRealmDrawer