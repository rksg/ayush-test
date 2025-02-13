import React, { useState } from 'react'

import {
  Form,
  Input,
  Select,
  InputNumber,
  Radio,
  Space,
  Button
} from 'antd'
import { FormattedMessage } from 'react-intl'

import {
  GridCol,
  GridRow,
  Modal,
  ModalType,
  SelectionControl,
  StepsFormLegacy,
  Subtitle,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  useAdaptivePolicySetListQuery,
  useLazyGetDpskListQuery,
  useLazyGetEnhancedDpskTemplateListQuery,
  useSearchPersonaGroupListQuery
} from '@acx-ui/rc/services'
import {
  PassphraseFormatEnum,
  transformDpskNetwork,
  DpskNetworkType,
  checkObjectNotExists,
  PolicyDefaultAccess,
  DeviceNumberType,
  unlimitedNumberOfDeviceLabel,
  NEW_MAX_DEVICES_PER_PASSPHRASE,
  OLD_MAX_DEVICES_PER_PASSPHRASE,
  defaultAccessLabelMapping,
  passphraseFormatDescription,
  useConfigTemplateLazyQueryFnSwitcher,
  DpskSaveData,
  TableResult,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { RolesEnum } from '@acx-ui/types'
import { hasRoles }  from '@acx-ui/user'
import { getIntl }   from '@acx-ui/utils'

import { AdaptivePolicySetForm }            from '../../AdaptivePolicySetForm'
import { ExpirationDateSelector }           from '../../ExpirationDateSelector'
import { hasCreateIdentityGroupPermission } from '../../useIdentityGroupUtils'
import { IdentityGroupForm }                from '../../users/IdentityGroupForm'

import { FieldSpace } from './styledComponents'

interface DpskSettingsFormProps {
  modalMode?: boolean,
  editMode?: boolean
}

export default function DpskSettingsForm (props: DpskSettingsFormProps) {
  const { modalMode = false, editMode = false } = props
  const intl = getIntl()
  const form = Form.useFormInstance()
  const passphraseFormat = Form.useWatch<PassphraseFormatEnum>('passphraseFormat', form)
  const id = Form.useWatch<string>('id', form)
  const { Option } = Select
  const [ getDpskList ] = useConfigTemplateLazyQueryFnSwitcher<TableResult<DpskSaveData>>({
    useLazyQueryFn: useLazyGetDpskListQuery,
    useLazyTemplateQueryFn: useLazyGetEnhancedDpskTemplateListQuery
  })
  const { isTemplate } = useConfigTemplate()
  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA) && !isTemplate

  const nameValidator = async (value: string) => {
    const list = (await getDpskList({}).unwrap()).data
      .filter(n => n.id !== id)
      .map(n => ({ name: n.name }))
    return checkObjectNotExists(list, { name: value } , intl.$t({ defaultMessage: 'DPSK service' }))
  }

  const passphraseOptions = Object.keys(PassphraseFormatEnum).map((key =>
    <Option key={key}>{transformDpskNetwork(intl, DpskNetworkType.FORMAT, key)}</Option>
  ))

  return (<>
    <GridRow>
      <GridCol col={{ span: modalMode ? 8 : 6 }}>
        <StepsFormLegacy.Title>{intl.$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
        <Form.Item name='id' noStyle>
          <Input type='hidden' />
        </Form.Item>
        <Form.Item
          name='name'
          label={intl.$t({ defaultMessage: 'Service Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
          validateTrigger={'onBlur'}
        />
        <Subtitle level={3}>
          { intl.$t({ defaultMessage: 'Passphrase Generation Parameters' }) }
        </Subtitle>
        <Form.Item
          name='passphraseFormat'
          label={
            <>
              { intl.$t({ defaultMessage: 'Passphrase Format' }) }
              <Tooltip.Question
                placement='bottom'
                title={<FormattedMessage
                  defaultMessage={`Format options: <br></br><br></br>
                    Most secured - all printable ASCII characters can be used <br></br><br></br>
                    Keyboard friendly - only letters and numbers will be used <br></br><br></br>
                    Numbers only - only numbers will be used
                  `}
                  values={{ br: () => <br /> }}
                />}
              />
            </>
          }
          rules={[{ required: true }]}
          extra={passphraseFormat && intl.$t(passphraseFormatDescription[passphraseFormat])}
        >
          <Select>{passphraseOptions}</Select>
        </Form.Item>
        <Form.Item
          name='passphraseLength'
          rules={[
            {
              required: true,
              message: intl.$t({ defaultMessage: 'Please enter Passphrase Length' })
            },
            {
              type: 'number',
              min: 8,
              max: 63,
              message: intl.$t({ defaultMessage: 'Passphrase Length must be between 8 and 63' })
            }
          ]}
          label={
            <>
              { intl.$t({ defaultMessage: 'Passphrase Length' }) }
              <Tooltip.Question
                // eslint-disable-next-line max-len
                title={intl.$t({ defaultMessage: 'Number of characters in passphrase. Valid range 8-63' })}
                placement='bottom'
              />
            </>
          }
        >
          <InputNumber />
        </Form.Item>
        <ExpirationDateSelector
          inputName={'expiration'}
          label={intl.$t({ defaultMessage: 'Expiration' })}
        />
      </GridCol>
    </GridRow>
    {isCloudpathEnabled && <CloudpathFormItems editMode={editMode} />}
  </>)
}

function CloudpathFormItems ({ editMode }: { editMode?: boolean }) {
  const { $t } = getIntl()
  const form = Form.useFormInstance()
  const deviceNumberType = Form.useWatch('deviceNumberType', form)
  const isPolicyManagementEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isIdentityGroupRequired = useIsSplitOn(Features.DPSK_REQUIRE_IDENTITY_GROUP)
  const policySetId = Form.useWatch<string>('policySetId', form)
  const deviceCountLimit = Form.useWatch<number>('deviceCountLimit', form)
  const dpskDeviceCountLimitToggle =
    useIsSplitOn(Features.DPSK_PER_BOUND_PASSPHRASE_ALLOWED_DEVICE_INCREASED_LIMIT)
  const MAX_DEVICES_PER_PASSPHRASE = dpskDeviceCountLimitToggle
    ? NEW_MAX_DEVICES_PER_PASSPHRASE
    : OLD_MAX_DEVICES_PER_PASSPHRASE

  const { policySetOptions } = useAdaptivePolicySetListQuery(
    { payload: { page: 1, pageSize: '2147483647' } },
    {
      skip: !isPolicyManagementEnabled,
      selectFromResult ({ data }) {
        return {
          policySetOptions: data?.data.map(set => ({ value: set.id, label: set.name }))
        }
      }
    }
  )
  const { identityGroupList } = useSearchPersonaGroupListQuery({
    payload: {
      page: 1, pageSize: 10000, sortField: 'name', sortOrder: 'ASC'
    }
  }, {
    skip: !isIdentityGroupRequired,
    selectFromResult ({ data }) {
      return {
        // return empty list if data?.data is undefined
        // eslint-disable-next-line max-len
        identityGroupList: data?.data.filter(group => editMode || !group.dpskPoolId).map(group => ({ value: group.id, label: group.name }))
      }
    }
  })

  const [identityGroupModelVisible, setIdentityGroupModelVisible] = useState(false)
  const [policyModalVisible, setPolicyModalVisible] = useState(false)

  return (
    <GridRow>
      <GridCol col={{ span: 8 }}>
        <Form.Item
          label={$t({ defaultMessage: 'Devices allowed per passphrase' })}
          rules={[{ required: true }]}
          name='deviceNumberType'
          children={
            <Radio.Group>
              <Space size={'middle'} direction='vertical'>
                <Radio value={DeviceNumberType.UNLIMITED}>
                  {$t(unlimitedNumberOfDeviceLabel)}
                </Radio>
                <FieldSpace>
                  <Radio value={DeviceNumberType.LIMITED}>
                    {$t({ defaultMessage: 'Limited to...' })}
                  </Radio>
                  {deviceNumberType === DeviceNumberType.LIMITED &&
                    <Space size={'middle'} direction='horizontal'>
                      <Form.Item
                        name='deviceCountLimit'
                        initialValue={1}
                        rules={[
                          {
                            required: true,
                            // eslint-disable-next-line max-len
                            message: $t({ defaultMessage: 'Please enter Devices allowed per passphrase' })
                          },
                          {
                            type: 'number',
                            min: 1,
                            max: MAX_DEVICES_PER_PASSPHRASE,
                            message: $t(
                              // eslint-disable-next-line max-len
                              { defaultMessage: 'Number of Devices allowed per passphrase must be between 1 and {max}' },
                              { max: MAX_DEVICES_PER_PASSPHRASE }
                            )
                          }
                        ]}
                        children={<InputNumber min={1} max={MAX_DEVICES_PER_PASSPHRASE} />}
                      />
                      <Form.Item
                        name='deviceCountLimitLabel'
                        children={<div>{$t(
                          // eslint-disable-next-line max-len
                          { defaultMessage: '{deviceCountLimit, plural, one {Device} other {Devices}}' },
                          { deviceCountLimit: deviceCountLimit })
                        }</div>}
                      />
                    </Space>
                  }
                </FieldSpace>
              </Space>
            </Radio.Group>
          }
        />
        {isIdentityGroupRequired &&
          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <Form.Item
              name='identityId'
              label={$t({ defaultMessage: 'Identity Group' })}
              required
              rules={[{ required: true }]}
            >
              <Select style={{ width: 200 }}
                placeholder={$t({ defaultMessage: 'Select...' })}
                allowClear
                options={identityGroupList}
                disabled={editMode}
              />
            </Form.Item>
            {
              (!editMode && hasCreateIdentityGroupPermission()) &&
              <>
                <Space align='center'>
                  <Button
                    id={'AddIdentityGroupButton'}
                    type='link'
                    style={{ marginLeft: '8px', top: '0.25rem' }}
                    onClick={async () => {
                      setIdentityGroupModelVisible(true)
                    }}
                  >
                    {$t({ defaultMessage: 'Add' })}
                  </Button>
                </Space>
                <Modal
                  title={$t({ defaultMessage: 'Add Identity Group' })}
                  visible={identityGroupModelVisible}
                  type={ModalType.ModalStepsForm}
                  children={<IdentityGroupForm
                    callback={(identityGroupId?: string) => {
                      if (identityGroupId) {
                        form.setFieldValue('identityId', identityGroupId)
                      }
                      setIdentityGroupModelVisible(false)
                    }}
                  />}
                  onCancel={() => setIdentityGroupModelVisible(false)}
                  width={1200}
                  destroyOnClose={true}
                />
              </>
            }
          </div>
        }
        {isPolicyManagementEnabled &&
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <Form.Item
                name='policySetId'
                label={$t({ defaultMessage: 'Adaptive Policy Set' })}
                rules={[{ required: false }]}
              >
                <Select style={{ width: 200 }}
                  placeholder={$t({ defaultMessage: 'Select...' })}
                  allowClear
                  options={policySetOptions}
                />
              </Form.Item>
              {
                (hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])) && <>
                  <Button
                    id={'AddPolicySetButton'}
                    type='link'
                    style={{ marginLeft: '8px', top: '0.25rem' }}
                    onClick={async () => {
                      setPolicyModalVisible(true)
                    }}
                  >
                    {$t({ defaultMessage: 'Add' })}
                  </Button>
                  <Modal
                    title={$t({ defaultMessage: 'Add Adaptive Policy Set' })}
                    visible={policyModalVisible}
                    type={ModalType.ModalStepsForm}
                    children={<AdaptivePolicySetForm
                      modalMode
                      modalCallBack={(addedPolicySetId?: string) => {
                        if (addedPolicySetId) {
                          form.setFieldValue('policySetId', addedPolicySetId)
                        }
                        setPolicyModalVisible(false)
                      }}
                    />}
                    onCancel={() => setPolicyModalVisible(false)}
                    width={1200}
                    destroyOnClose={true}
                  />
                </>
              }
            </div>

            {policySetId &&
              <Form.Item
                name='policyDefaultAccess'
                label={$t({ defaultMessage: 'Default Access' })}
                initialValue={PolicyDefaultAccess.ACCEPT}
                rules={[{ required: true }]}
              >
                <SelectionControl
                  options={[
                    {
                      value: PolicyDefaultAccess.ACCEPT,
                      label: $t(defaultAccessLabelMapping[PolicyDefaultAccess.ACCEPT])
                    },
                    {
                      value: PolicyDefaultAccess.REJECT,
                      label: $t(defaultAccessLabelMapping[PolicyDefaultAccess.REJECT])
                    }
                  ]}
                />
              </Form.Item>
            }
          </>
        }
      </GridCol>
    </GridRow>
  )
}
