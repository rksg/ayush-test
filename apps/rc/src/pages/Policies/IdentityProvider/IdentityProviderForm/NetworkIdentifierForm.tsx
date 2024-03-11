import { useContext } from 'react'

import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'
import { useParams }             from 'react-router-dom'

import { StepsForm }                           from '@acx-ui/components'
import { useLazyGetIdentityProviderListQuery } from '@acx-ui/rc/services'
import {
  IdentityProviderActionType,
  checkObjectNotExists,
  servicePolicyNameRegExp
} from '@acx-ui/rc/utils'


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
  const { $t } = useIntl()
  const params = useParams()

  //const form = Form.useFormInstance()
  const { state, dispatch } = useContext(IdentityProviderFormContext)

  const [getInstanceList] = useLazyGetIdentityProviderListQuery()

  /*
  useEffect(() => {
    if (form && state.naiRealms) {
      form.validateFields()
    }
  }, [form, state.naiRealms])
  */

  const nameValidator = async (value: string) => {
    const payload = { ...IdentityProviderListPayload, searchString: value }
    const list = (await getInstanceList({ params, payload }, true).unwrap()).data
      .filter(n => n.id !== params.profileId)
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

  return (<Row gutter={20}>
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
      <Form.Item
        name='plmns'
        label={$t({ defaultMessage: 'PLMN' })}
        children={<PlmnTable />}
      />
      <Form.Item
        name='roamConsortiumOIs'
        label={$t({ defaultMessage: 'Roaming Consortium OI' })}
        children={<RoamConsortiumOiTable />}
      />
    </Col>
  </Row>
  )
}

export default NetworkIdentifierForm