import { useContext, useEffect } from 'react'

import { Col, Form, Input, Menu, MenuProps, Row, Space } from 'antd'
import { useIntl }                                       from 'react-intl'
import { useParams }                                     from 'react-router-dom'

import { Button, Dropdown, StepsForm, Tooltip }                                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                                        from '@acx-ui/feature-toggle'
import { useGetPreconfiguredIdentityProviderQuery, useLazyGetIdentityProviderListQuery } from '@acx-ui/rc/services'
import {
  IdentityProviderActionType,
  checkObjectNotExists,
  servicePolicyNameRegExp,
  IdentityProvider
} from '@acx-ui/rc/utils'

import { AddRowIdToIdenetityProvider } from '../utils'

import IdentityProviderFormContext from './IdentityProviderFormContext'
import NaiRealmTable               from './NaiRealm/NaiRealmTable'
import PlmnTable                   from './Plmn/PlmnTable'
import RoamConsortiumOiTable       from './RoamConsortiumOi/RoamConsortiumOiTable'


const IdentityProviderListPayload = {
  searchString: '',
  fields: ['name', 'id'],
  searchTargetFields: ['name'],
  filters: {},
  pageSize: 10000
}

const NetworkIdentifierForm = () => {
  const isSupportPreConfiguredIdp = useIsSplitOn(Features.PRECONFIGURED_HS20_IDP_TOGGLE)
  const { $t } = useIntl()
  const params = useParams()

  const form = Form.useFormInstance()
  const { state, dispatch } = useContext(IdentityProviderFormContext)

  const [getInstanceList] = useLazyGetIdentityProviderListQuery()

  const { data: preconfiguredIdps } = useGetPreconfiguredIdentityProviderQuery({
  }, { skip: !isSupportPreConfiguredIdp })

  const preconfiguredIdpsNote = $t({
    // eslint-disable-next-line max-len
    defaultMessage: 'Import pre-configured settings from your identity provider to simplify setup. Please note that importing will populate and replace the existing configuration below.'
  })

  useEffect(() => {
    if (form && state.name !== '') {
      form.validateFields()
    }
  }, [form, state.name, state.naiRealms])

  const nameValidator = async (value: string) => {
    const payload = { ...IdentityProviderListPayload, searchString: value }
    const list = (await getInstanceList({ params, payload }, true).unwrap()).data
      .filter(n => n.id !== params.policyId)
      .map(n => n.name)

    return checkObjectNotExists(list, value, $t({ defaultMessage: 'Identity Provider' }))
  }

  const handleNameChanged = (name: string) => {
    dispatch({
      type: IdentityProviderActionType.NAME,
      payload: {
        name: name
      }
    })
  }

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const findPreConfiguredIdp = preconfiguredIdps?.find((idp) => idp.name === e.key)
    if (findPreConfiguredIdp) {
      // add RowId
      const findPreConfiguredIdpData = AddRowIdToIdenetityProvider(findPreConfiguredIdp)
      dispatch({
        type: IdentityProviderActionType.LOAD_PRECONFIGURED,
        payload: {
          state: {
            ...findPreConfiguredIdpData
          }
        }
      })
    }
  }

  return (<>
    <Row gutter={20} >
      <Col span={15}>
        <StepsForm.Title>{$t({ defaultMessage: 'Network Identifier' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Profile Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => servicePolicyNameRegExp(value) },
            { validator: (_, value) => nameValidator(value) }
          ]}
          initialValue={state.name}
          validateFirst
          hasFeedback
          children={<Input
            style={{ width: '350px' }}
            onChange={(e => {handleNameChanged(e.target.value)})}/>}
        />
      </Col>
    </Row>
    {isSupportPreConfiguredIdp && <Row gutter={20}>
      <Col span={15} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {$t({ defaultMessage: 'Provider Settings' })}
          </div>
          <Space>
            <PreconfiguredIdpsDropdown idps={preconfiguredIdps} handleMenuClick={handleMenuClick} />
            <Tooltip.Question
              title={preconfiguredIdpsNote}
              placement='right'
              iconStyle={{ width: 16, height: 16 }}/>
          </Space>
        </div>
      </Col>
    </Row>}
    <Row gutter={20} style={{ marginBottom: '16px' }}>
      <Col span={15}>
        <Form.Item
          name='naiRealms'
          label={$t({ defaultMessage: 'NAI Realm' })}
          required
          rules={[
            { validator: () => {
              if (state.naiRealms?.length) return Promise.resolve()
              return Promise.reject($t({
                defaultMessage: 'NAI Realm list must contain at least one entry'
              }))
            } }
          ]}
          children={<NaiRealmTable />}
        />
      </Col>
    </Row>
    <Row gutter={20} style={{ marginBottom: '16px' }}>
      <Col span={15}>
        <Form.Item
          name='plmns'
          label={$t({ defaultMessage: 'PLMN' })}
          children={<PlmnTable />}
        />
      </Col>
    </Row>
    <Row gutter={20} >
      <Col span={15}>
        <Form.Item
          name='roamConsortiumOIs'
          label={$t({ defaultMessage: 'Roaming Consortium OI' })}
          children={<RoamConsortiumOiTable />}
        />
      </Col>
    </Row>
  </>
  )
}

type PreconfiguredIdpsDropdownProps = {
  idps?: IdentityProvider[],
  handleMenuClick: MenuProps['onClick']
}
const PreconfiguredIdpsDropdown = (props: PreconfiguredIdpsDropdownProps) => {
  const { $t } = useIntl()

  const { idps = [], handleMenuClick } = props
  const onMenuClick: MenuProps['onClick'] = (e) => {
    handleMenuClick && handleMenuClick(e)
  }

  const idpsMeun = <Menu
    onClick={onMenuClick}
    items={idps.map(({ name }) => ({ key: name, label: name }))}
  />

  return (
    <Dropdown overlay={idpsMeun}>{() =>
      // eslint-disable-next-line max-len
      <Button type='link'>{ $t({ defaultMessage: 'Import from a Known Identity Provider' }) }</Button>
    }</Dropdown>
  )
}

export default NetworkIdentifierForm