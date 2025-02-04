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
  IpSecProposalTypeEnum,
  IpSecPseudoRandomFunctionEnum
} from '@acx-ui/rc/utils'

import { SimpleListTooltip } from '../../../SimpleListTooltip'

import { messageMapping } from './messageMapping'

interface IkeAssociationSettingsFormProps {
  initIpSecData?: Ipsec
}

export default function IkeAssociationSettings (props: IkeAssociationSettingsFormProps) {
  const { initIpSecData } = props
  const MAX_PROPOSALS = 2
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  const [ikeProposalType, setIkeProposalType] = useState(IpSecProposalTypeEnum.DEFAULT)

  const initialAlgValue = {
    encAlg: IpSecEncryptionAlgorithmEnum.AES128,
    authAlg: IpSecIntegrityAlgorithmEnum.SHA1,
    prfAlg: IpSecPseudoRandomFunctionEnum.USE_INTEGRITY_ALG,
    dhGroup: IpSecDhGroupEnum.MODP2048
  }

  useEffect (() => {
    if (initIpSecData?.ikeSecurityAssociation?.ikeProposalType) {
      setIkeProposalType(initIpSecData.ikeSecurityAssociation.ikeProposalType)
    } else {
      setIkeProposalType(form.getFieldValue(['ikeSecurityAssociation', 'ikeProposalType']))
    }
  }, [initIpSecData, form])

  const onProposalTypeChange = (value: IpSecProposalTypeEnum) => {
    setIkeProposalType(value)
    if (value === IpSecProposalTypeEnum.DEFAULT) {
      form.setFieldValue(['ikeSecurityAssociation', 'ikeProposals'], [{}])
    } else {
      form.setFieldValue(['ikeSecurityAssociation', 'ikeProposals'], [ initialAlgValue ])
    }
  }

  const proposalTypeOptions = [
    { label: $t({ defaultMessage: 'Default' }), value: IpSecProposalTypeEnum.DEFAULT },
    { label: $t({ defaultMessage: 'Custom' }), value: IpSecProposalTypeEnum.SPECIFIC }
  ]

  const encryptionOptions = Object.entries(IpSecEncryptionAlgorithmEnum)
    .map(([label, value]) => ({ label, value }))
  const integrityOptions = Object.entries(IpSecIntegrityAlgorithmEnum)
    .map(([label, value]) => ({ label, value }))
  const prfOptions = Object.entries(IpSecPseudoRandomFunctionEnum)
    .map(([label, value]) => ({ label, value }))
  const dhGroupOptions = Object.entries(IpSecDhGroupEnum)
    .map(([label, value]) => ({ label, value }))

  return (
    <>
      <Form.Item
        name={['ikeSecurityAssociation', 'ikeProposalType']}
        label={$t({ defaultMessage: 'Internet Key Exchange (IKE) Proposal' })}
        style={{ width: '300px' }}
        children={
          <Select
            defaultValue={ikeProposalType}
            onChange={onProposalTypeChange}
            options={proposalTypeOptions} />
        }
      />
      {ikeProposalType === IpSecProposalTypeEnum.DEFAULT &&
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
              <td>
                {$t({ defaultMessage: 'Pseudo-random Function:' })}
              </td>
              <td>
                <SimpleListTooltip
                  items={[$t(messageMapping.prf_alg_all_tooltip)]}
                  displayText={$t({ defaultMessage: 'All' })} />
              </td>
            </tr>
            <tr>
              <td>
                {$t({ defaultMessage: 'DH Group:' })}
              </td>
              <td>
                <SimpleListTooltip
                  items={[$t(messageMapping.dh_group_all_tooltip)]}
                  displayText={$t({ defaultMessage: 'All' })} />
              </td>
            </tr>
          </tbody>
        </table>
      }
      {ikeProposalType === IpSecProposalTypeEnum.SPECIFIC &&
        <Form.List name={['ikeSecurityAssociation', 'ikeProposals']} >
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
                        <Select style={{ minWidth: 150 }}
                          data-testid={`select_encryption_${index}`}
                          placeholder={$t({ defaultMessage: 'Select...' })}
                          // defaultValue={IpSecEncryptionAlgorithmEnum.AES128}
                          options={encryptionOptions}
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
                        <Select style={{ minWidth: 150 }}
                          data-testid={`select_integrity_${index}`}
                          placeholder={$t({ defaultMessage: 'Select...' })}
                          // defaultValue={IpSecIntegrityAlgorithmEnum.SHA1}
                          options={integrityOptions}
                        />}
                    />
                    <Form.Item
                      name={[field.name, 'prfAlg']}
                      label={$t({ defaultMessage: 'Pseudo-random Function' })}
                      rules={[
                        { required: true }
                      ]}
                      initialValue={IpSecPseudoRandomFunctionEnum.USE_INTEGRITY_ALG}
                      children={
                        <Select style={{ minWidth: 150 }}
                          data-testid={`select_prf_${index}`}
                          placeholder={$t({ defaultMessage: 'Select...' })}
                          // defaultValue={IpSecPseudoRandomFunctionEnum.USE_INTEGRITY_ALG}
                          options={prfOptions}
                        />}
                    />
                    <Form.Item
                      name={[field.name, 'dhGroup']}
                      label={$t({ defaultMessage: 'DH Group' })}
                      rules={[
                        { required: true }
                      ]}
                      initialValue={IpSecDhGroupEnum.MODP2048}
                      children={
                        <Select style={{ minWidth: 150 }}
                          data-testid={`select_dh_${index}`}
                          placeholder={$t({ defaultMessage: 'Select...' })}
                          // defaultValue={IpSecDhGroupEnum.MODP2048}
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
            </>
          )}
        </Form.List>
      }
    </>
  )
}