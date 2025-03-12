import { useEffect } from 'react'

import { Form, Input, InputNumber } from 'antd'
import { Rule }                     from 'antd/lib/form'
import { StoreValue }               from 'antd/lib/form/interface'
import moment                       from 'moment'
import { useIntl }                  from 'react-intl'
import { useParams }                from 'react-router-dom'

import { Collapse, DatePicker, Drawer, Select }                                          from '@acx-ui/components'
import { CollapseInactive, CollapseActive }                                              from '@acx-ui/icons'
import { useAddSpecificTemplateScepKeyMutation, useEditSpecificTemplateScepKeyMutation } from '@acx-ui/rc/services'
import {
  ChallengePasswordType,
  EXPIRATION_DATE_FORMAT,
  ScepKeyCommonNameType,
  ScepKeyData
} from '@acx-ui/rc/utils'

import { challengePasswordTypeLabel, scepKeyCommonNameTypeLabel, scepKeysDescription } from '../contentsMap'
import { CollapseWrapper, CollapseTitle, DrawerTitle, Description }                    from '../styledComponents'

export default function ScepDrawer
(props: { scepData?: ScepKeyData, visible: boolean, onClose: ()=>void }) {
  const { $t } = useIntl()
  const { scepData, visible, onClose } = props
  const [form] = Form.useForm()
  const params = useParams()
  const [ addScepKey ] = useAddSpecificTemplateScepKeyMutation()
  const [ editScepKey ] = useEditSpecificTemplateScepKeyMutation()
  const challengePasswordType = Form.useWatch('challengePasswordType', form)

  const commonNameOptions = Object.values(ScepKeyCommonNameType).map((value) =>
    ({ label: $t(scepKeyCommonNameTypeLabel[value as ScepKeyCommonNameType]), value }))
  const challengePasswordOptions = Object.values(ChallengePasswordType).map((value) =>
    ({ label: $t(challengePasswordTypeLabel[value as ChallengePasswordType]), value }))

  const validateSubnets = (getFieldValue: (name: string) => StoreValue) => {
    return (_: Rule, value: string) => {
      const allowedSubnets = getFieldValue('allowedSubnets') as string
      const blockedSubnets = getFieldValue('blockedSubnets') as string

      // eslint-disable-next-line max-len
      const subnetRegex = /^(\*|((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\/([0-9]|[12][0-9]|3[0-2]))?)$/

      // Validate each subnet in the value field
      if (value) {
        const subnets = value.split(';').map(subnet => subnet.trim())

        for (const subnet of subnets) {
          if (!subnetRegex.test(subnet)) {
            return Promise.reject(new Error($t({ defaultMessage: 'Invalid subnet format' })))
          }
        }
      }

      // Check for overlap between allowedSubnets and blockedSubnets
      if (allowedSubnets && blockedSubnets) {
        const allowedList = allowedSubnets.split(';').map(subnet => subnet.trim())
        const blockedList = blockedSubnets.split(';').map(subnet => subnet.trim())

        // Check if any subnet exists in both allowed and blocked lists
        const overlappingSubnets = allowedList.filter(subnet => blockedList.includes(subnet))

        if (overlappingSubnets.length > 0) {
          // eslint-disable-next-line max-len
          return Promise.reject(new Error($t({ defaultMessage: 'Same subnet values cannot be given in allowed and blocked' })))
        }
      }

      return Promise.resolve()
    }
  }


  const onSubmit = async () => {
    try {
      await form.validateFields()
      const payload = { ...form.getFieldsValue(),
        challengePassword:
          challengePasswordType !== ChallengePasswordType.STATIC ?
            null : form.getFieldValue('challengePassword'),
        expirationDate: moment(form.getFieldValue('expirationDate')).endOf('day').utc()
      }
      if (!scepData) {
        await addScepKey({ params, payload })
      } else {
        await editScepKey({ params: { ...params, scepKeysId: scepData.id }, payload })
      }
      onClose()
    } catch (e) {

    }
  }

  useEffect(() => {
    if (!visible) {
      return
    }
    form.resetFields()
    const { expirationDate, ...rest } = scepData || {}
    const initialValues = scepData ? { ...rest, expirationDate: moment(expirationDate) } : {
      challengePasswordType: ChallengePasswordType.NONE,
      challengePassword: '',
      allowedSubnets: '*',
      overrideDays: 0,
      cnValue1: ScepKeyCommonNameType.USERNAME,
      cnValue2: ScepKeyCommonNameType.IGNORE,
      cnValue3: ScepKeyCommonNameType.IGNORE,
      expirationDate: moment().add(2, 'months')
    }
    form.setFieldsValue(initialValues)
  }, [visible])

  return (
    <Drawer
      title={scepData?
        $t({ defaultMessage: 'Edit SCEP Key' }):
        $t({ defaultMessage: 'Add SCEP Key' })}
      visible={visible}
      onClose={onClose}
      closable={true}
      forceRender={true}
      width={520}
      footer={<Drawer.FormFooter
        buttonLabel={{
          save: scepData
            ? $t({ defaultMessage: 'Save' })
            : $t({ defaultMessage: 'Add' })
        }}
        onCancel={onClose}
        onSave={onSubmit}
      />}
    >
      <Form layout='vertical' form={form}>
        <DrawerTitle>
          {$t({ defaultMessage: 'SCEP Key Information' })}</DrawerTitle>
        <Form.Item
          style={{ marginTop: 8 }}
          name='name'
          label={$t({ defaultMessage: 'Name' })}
          rules={[{ required: true, max: 255, min: 2 }]}
        >
          <Input onKeyPress={(e) => {
            if (e.key === ' ') {
              e.preventDefault()
            }
          }}/>
        </Form.Item>
        <Form.Item
          name='challengePasswordType'
          label={$t({ defaultMessage: 'Challenge Password Type' })}
          rules={[{ required: true }]}
        >
          <Select
            options={challengePasswordOptions}
            placeholder={$t({ defaultMessage: 'Select...' })}
          >
          </Select>
        </Form.Item>
        { challengePasswordType === ChallengePasswordType.STATIC &&
          <Form.Item
            name='challengePassword'
            label={$t({ defaultMessage: 'Challenge Password' })}
            rules={[{ required: true, min: 4, max: 255 }]}
          >
            <Input />
          </Form.Item>
        }
        { challengePasswordType === ChallengePasswordType.MICROSOFT &&
          <>
            <Form.Item
              name='intuneTenantId'
              label={$t({ defaultMessage: 'Microsoft Intune Tenant ID' })}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name='azureApplicationId'
              label={$t({ defaultMessage: 'Azure Application ID' })}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name='azureApplicationKey'
              label={$t({ defaultMessage: 'Azure Application Key' })}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </>
        }
        <CollapseWrapper>
          <Collapse
            expandIcon={({ isActive }) => isActive ?
              <CollapseInactive width={10} /> : <CollapseActive width={10} />}
            ghost
          >
            <Collapse.Panel key={1}
              forceRender={true}
              header={<CollapseTitle>{$t({ defaultMessage: 'Validity Information' })}
              </CollapseTitle>}>
              <Description style={{ marginTop: 8 }}>
                {$t(scepKeysDescription.VALIDITY_INFO)}</Description>
              <Form.Item
                name='expirationDate'
                label={$t({ defaultMessage: 'Expiration Date' })}
                rules={[{ required: true }]}
              >
                <DatePicker
                  format={EXPIRATION_DATE_FORMAT}
                  disabledDate={(current) => {
                    return current && current < moment().endOf('day')
                  }}
                />
              </Form.Item>
              <Form.Item
                name='allowedSubnets'
                label={$t({ defaultMessage: 'Allowed Subnets' })}
                rules={[{ validator: validateSubnets(form.getFieldValue) }]}
              >
                <Input/>
              </Form.Item>
              <Form.Item
                name='blockedSubnets'
                label={$t({ defaultMessage: 'Blocked Subnets' })}
                rules={[{ validator: validateSubnets(form.getFieldValue) }]}
              >
                <Input/>
              </Form.Item>
            </Collapse.Panel>
          </Collapse>
        </CollapseWrapper>
        <CollapseWrapper>
          <Collapse
            expandIcon={({ isActive }) => isActive ?
              <CollapseInactive width={10} /> : <CollapseActive width={10} />}
            ghost
          >
            <Collapse.Panel key={1}
              forceRender={true}
              header={<CollapseTitle>{$t({ defaultMessage: 'Configuration Information' })}
              </CollapseTitle>}>
              <Description style={{ marginTop: 8 }}>
                {$t(scepKeysDescription.CONFIG_INFO)}</Description>
              <Form.Item
                style={{ marginTop: 8, display: 'inline-block' }}
                name='overrideDays'
                label={$t({ defaultMessage: 'Days of Access' })}
                rules={[{ required: true, type: 'number', min: 0, max: 365 }]}
              >
                <InputNumber min={0}/>
              </Form.Item>
              <Description style={{ marginTop: 38, marginLeft: 10, display: 'inline-block' }}>
                {$t({ defaultMessage: 'Days' })}
              </Description>
              <Form.Item
                name='cnValue1'
                label={$t({ defaultMessage: 'Common Name #1 Mapping' })}
                rules={[{ required: true }]}
              >
                <Select
                  options={commonNameOptions}
                  placeholder={$t({ defaultMessage: 'Select...' })}/>
              </Form.Item>
            </Collapse.Panel>
          </Collapse>
        </CollapseWrapper>
      </Form >
    </Drawer>
  )
}
