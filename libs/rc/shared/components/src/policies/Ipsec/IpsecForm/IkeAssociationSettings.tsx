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
  loadIkeSettings: boolean
  setLoadIkeSettings: (state: boolean) => void
}

export default function IkeAssociationSettings (props: IkeAssociationSettingsFormProps) {
  const { initIpSecData, loadIkeSettings, setLoadIkeSettings } = props
  const MAX_PROPOSALS = 2
  const form = Form.useFormInstance()
  const { $t } = useIntl()
  let proposalType = form.getFieldValue(['ikeSecurityAssociation', 'ikeProposalType'])
  const [ikeProposalType, setIkeProposalType] = useState(proposalType
    ? proposalType : initIpSecData?.ikeSecurityAssociation?.ikeProposalType)

  const initialAlgValue = {
    encAlg: IpSecEncryptionAlgorithmEnum.AES128,
    authAlg: IpSecIntegrityAlgorithmEnum.SHA1,
    prfAlg: IpSecPseudoRandomFunctionEnum.USE_INTEGRITY_ALG,
    dhGroup: IpSecDhGroupEnum.MODP2048
  }

  const algorithmValidator = async () => {
    let isValid = true
    let proposalType = form.getFieldValue(['ikeSecurityAssociation', 'ikeProposalType'])
    let proposals = form.getFieldValue(['ikeSecurityAssociation', 'ikeProposals'])
    if (proposalType === IpSecProposalTypeEnum.SPECIFIC) {
      if (proposals.length === MAX_PROPOSALS) {
        if (proposals[0].encAlg === proposals[1].encAlg &&
          proposals[0].authAlg === proposals[1].authAlg &&
          proposals[0].prfAlg === proposals[1].prfAlg &&
          proposals[0].dhGroup === proposals[1].dhGroup) {
          isValid = false
        }
      }
    }

    return isValid ? Promise.resolve() :
      Promise.reject(
        /* eslint-disable max-len */
        $t({ defaultMessage: 'Combinations of encryption mode, integrity algorithm, pseudo-random function and Diffie-Hellman group must be unique. Please select a different combination.' })
      )
  }

  useEffect (() => {
    let ikeProposalSelection = form.getFieldValue(['ikeSecurityAssociation', 'ikeProposalType'])
    setIkeProposalType(ikeProposalSelection)

    if (loadIkeSettings && initIpSecData) {
      if (initIpSecData?.ikeSecurityAssociation?.ikeProposalType) {
        setIkeProposalType(initIpSecData.ikeSecurityAssociation.ikeProposalType)
      } else {
        setIkeProposalType(form.getFieldValue(['ikeSecurityAssociation', 'ikeProposalType']))
      }
    }
    setLoadIkeSettings(false)
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

  const encryptionOptions = [
    { label: $t({ defaultMessage: '3DES' }), value: IpSecEncryptionAlgorithmEnum.THREE_DES },
    { label: $t({ defaultMessage: 'AES128' }), value: IpSecEncryptionAlgorithmEnum.AES128 },
    { label: $t({ defaultMessage: 'AES192' }), value: IpSecEncryptionAlgorithmEnum.AES192 },
    { label: $t({ defaultMessage: 'AES256' }), value: IpSecEncryptionAlgorithmEnum.AES256 }
  ]
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
            onChange={onProposalTypeChange}
            children={proposalTypeOptions.map(({ label, value }) =>
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>)} />
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
                <Space direction='vertical' key={`proposal_${index}`}>
                  <Subtitle level={4}>{`Proposal #${index + 1}`}</Subtitle>
                  <Space>
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
                          children={encryptionOptions.map(({ label, value }) =>
                            <Select.Option key={value} value={value}>
                              {label}
                            </Select.Option>)}
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
                        <Select style={{ minWidth: 180 }}
                          data-testid={`select_prf_${index}`}
                          placeholder={$t({ defaultMessage: 'Select...' })}
                          options={prfOptions}
                        />}
                    />
                    <Form.Item
                      name={[field.name, 'dhGroup']}
                      label={$t({ defaultMessage: 'DH Group' })}
                      rules={[{ required: true }]}
                      initialValue={IpSecDhGroupEnum.MODP2048}
                      children={
                        <Select style={{ minWidth: 150 }}
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
                </Space>
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