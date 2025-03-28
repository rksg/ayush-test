import { useEffect, useState } from 'react'

import { Form, Space } from 'antd'
import { useIntl }     from 'react-intl'

import { Button, Select, Subtitle } from '@acx-ui/components'
import { DeleteOutlinedIcon }       from '@acx-ui/icons'
import {
  Ipsec,
  IpSecDhGroupEnum,
  IpSecEncryptionAlgorithmEnum,
  IpSecIntegrityAlgorithmEnum,
  IpSecProposalTypeEnum
} from '@acx-ui/rc/utils'

import { SimpleListTooltip } from '../../../SimpleListTooltip'

import { messageMapping } from './messageMapping'

interface EspAssociationSettingsFormProps {
  initIpSecData?: Ipsec
}

export default function EspAssociationSettings (props: EspAssociationSettingsFormProps) {
  const { initIpSecData } = props
  const MAX_PROPOSALS = 2
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  const [espProposalType, setEspProposalType] = useState(IpSecProposalTypeEnum.DEFAULT)

  const initialAlgValue = {
    encAlg: IpSecEncryptionAlgorithmEnum.AES128,
    authAlg: IpSecIntegrityAlgorithmEnum.SHA1,
    dhGroup: IpSecDhGroupEnum.MODP2048
  }

  const algorithmValidator = async () => {
    let isValid = true
    let proposalType = form.getFieldValue(['espSecurityAssociation', 'espProposalType'])
    let proposals = form.getFieldValue(['espSecurityAssociation', 'espProposals'])
    if (proposalType === IpSecProposalTypeEnum.SPECIFIC) {
      if (proposals.length === MAX_PROPOSALS) {
        if (proposals[0].encAlg === proposals[1].encAlg &&
          proposals[0].authAlg === proposals[1].authAlg &&
          proposals[0].dhGroup === proposals[1].dhGroup) {
          isValid = false
        }
      }
    }

    return isValid ? Promise.resolve() :
      Promise.reject(
        /* eslint-disable max-len */
        $t({ defaultMessage: 'Combinations of encryption mode, integrity algorithm, and Diffie-Hellman group must be unique. Please select a different combination.' })
      )
  }

  useEffect (() => {
    if (initIpSecData?.espSecurityAssociation?.espProposalType) {
      setEspProposalType(initIpSecData.espSecurityAssociation.espProposalType)
    } else {
      setEspProposalType(form.getFieldValue(['espSecurityAssociation', 'espProposalType']))
    }
  }, [initIpSecData, form])

  const onProposalTypeChange = (value: IpSecProposalTypeEnum) => {
    setEspProposalType(value)
    if (value === IpSecProposalTypeEnum.DEFAULT) {
      form.setFieldValue(['espSecurityAssociation', 'espProposals'], [{}])
    } else {
      form.setFieldValue(['espSecurityAssociation', 'espProposals'], [ initialAlgValue ])
    }
  }

  const proposalTypeOptions = [
    { label: $t({ defaultMessage: 'Default' }), value: IpSecProposalTypeEnum.DEFAULT },
    { label: $t({ defaultMessage: 'Custom' }), value: IpSecProposalTypeEnum.SPECIFIC }
  ]

  const encryptionOptions = [
    { label: $t({ defaultMessage: '3DES' }), value: IpSecEncryptionAlgorithmEnum.THREE_DES },
    { label: $t({ defaultMessage: 'AES128' }), value: IpSecEncryptionAlgorithmEnum.AES128 },
    { label: $t({ defaultMessage: 'AES192' }), value: IpSecEncryptionAlgorithmEnum.AES192 },
    { label: $t({ defaultMessage: 'AES256' }), value: IpSecEncryptionAlgorithmEnum.AES256 }
  ]
  const integrityOptions = Object.entries(IpSecIntegrityAlgorithmEnum)
    .map(([label, value]) => ({ label, value }))
  const dhGroupOptions = Object.entries(IpSecDhGroupEnum)
    .map(([label, value]) => ({ label, value }))

  return (
    <>
      <Form.Item
        name={['espSecurityAssociation', 'espProposalType']}
        label={$t({ defaultMessage: 'Encapsulating Security Payload (ESP) Proposal' })}
        style={{ width: '300px' }}
        children={
          <Select
            onChange={onProposalTypeChange}
            children={proposalTypeOptions.map(({ label, value }) =>
              <Select.Option key={value} value={value}>
                {label}</Select.Option>)} />
        }
      />
      {espProposalType === IpSecProposalTypeEnum.DEFAULT &&
        <table>
          <tbody>
            <tr>
              <td>{$t({ defaultMessage: 'Encryption Mode:' })}</td>
              <td>
                <SimpleListTooltip
                  items={[$t(messageMapping.enc_alg_all_tooltip)]}
                  displayText={$t({ defaultMessage: 'All' })} />
              </td>
            </tr>
            <tr>
              <td>{$t({ defaultMessage: 'Integrity Algorithm:' })}</td>
              <td>
                <SimpleListTooltip
                  items={[$t(messageMapping.auth_alg_all_tooltip)]}
                  displayText={$t({ defaultMessage: 'All' })} />
              </td>
            </tr>
            <tr>
              <td>{$t({ defaultMessage: 'DH Group:' })}</td>
              <td>
                <SimpleListTooltip
                  items={[$t(messageMapping.dh_group_all_tooltip)]}
                  displayText={$t({ defaultMessage: 'All' })} />
              </td>
            </tr>
          </tbody>
        </table>
      }
      {espProposalType === IpSecProposalTypeEnum.SPECIFIC &&
      <Form.List name={['espSecurityAssociation', 'espProposals']}>
        {(fields, { add, remove }) => (
          <>
            {fields?.map((field, index) =>
              <>
                <Subtitle level={4}>{`Proposal #${index + 1}`}</Subtitle>
                <Space key={`proposal_${index}`}>
                  {<Form.Item
                    name={[field.name, 'encAlg']}
                    label={$t({ defaultMessage: 'Encryption Mode' })}
                    rules={[
                      { required: true }
                    ]}
                    initialValue={IpSecEncryptionAlgorithmEnum.AES128}
                    children={
                      <Select style={{ minWidth: 180 }}
                        data-testid={`select_encryption_${index}`}
                        placeholder={$t({ defaultMessage: 'Select...' })}
                        children={encryptionOptions.map(({ label, value }) =>
                          <Select.Option key={value} value={value}>
                            {label}</Select.Option>)}
                      />}
                  /> }
                  <Form.Item
                    name={[field.name, 'authAlg']}
                    label={$t({ defaultMessage: 'Integrity Algorithm' })}
                    rules={[
                      { required: true }
                    ]}
                    initialValue={IpSecIntegrityAlgorithmEnum.SHA1}
                    children={
                      <Select style={{ minWidth: 180 }}
                        data-testid={`select_integrity_${index}`}
                        placeholder={$t({ defaultMessage: 'Select...' })}
                        options={integrityOptions}
                      />}
                  />
                  <Form.Item
                    name={[field.name, 'dhGroup']}
                    label={$t({ defaultMessage: 'DH Group' })}
                    rules={[{ required: true }]}
                    initialValue={IpSecDhGroupEnum.MODP2048}
                    children={
                      <Select style={{ minWidth: 180 }}
                        data-testid={`select_dh_${index}`}
                        placeholder={$t({ defaultMessage: 'Select...' })}
                        options={dhGroupOptions}
                      />}
                  />
                  {fields.length > 1 &&
                    <Button
                      aria-label='delete'
                      type='link'
                      icon={<DeleteOutlinedIcon />}
                      style={{ width: '50px' }}
                      onClick={() => remove(field.name)}
                    />
                  }
                </Space>
              </>
            )}
            {(fields.length < MAX_PROPOSALS) &&
              <Button type='link'
                data-testid='addProposalBtn'
                style={{ textAlign: 'left' }}
                onClick={() => {
                  add(initialAlgValue, fields.length)
                }}>
                {$t({ defaultMessage: 'Add another proposal' })}
              </Button>
            }
            {fields.length === MAX_PROPOSALS &&
              <Form.Item name='combinationValidator'
                style={{ textAlign: 'left', marginTop: '-15px', minHeight: '0px' }}
                rules={[{ validator: () => algorithmValidator() }]}
                // eslint-disable-next-line react/jsx-no-useless-fragment
                children={<></>} />
            }
          </>
        )}
      </Form.List>
      }
    </>
  )
}