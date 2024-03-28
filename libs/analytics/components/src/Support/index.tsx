import { useEffect, useState } from 'react'

import { Form, Checkbox, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { useUpdateAccountMutation }       from '@acx-ui/analytics/services'
import { getUserProfile, setUserProfile } from '@acx-ui/analytics/utils'
import { StepsForm, Loader }              from '@acx-ui/components'

export const Support = () => {
  const { $t } = useIntl()
  const [user, setUser] = useState(getUserProfile())
  const [setSupport, result] = useUpdateAccountMutation()

  useEffect(()=>{
    if(result.data === 'OK') {
      setUserProfile({
        ...user,
        tenants: user.tenants.map(t=>({ ...t, support: !user.selectedTenant.support }))
      })
      setUser(getUserProfile())
    }
  }, [result])

  return <Loader states={[result]}>
    <Form layout='horizontal' labelAlign='left'>
      <StepsForm.DescriptionWrapper>
        <Form.Item>
          <Checkbox
            onChange={()=>setSupport({
              account: user.accountId,
              support: !user.selectedTenant.support
            })}
            checked={user.selectedTenant.support}
            value={user.selectedTenant.support}
          >
            {$t({ defaultMessage: 'Enable access to Ruckus Support' })}
          </Checkbox>
        </Form.Item>
        <Typography.Paragraph className='description descriptionsWrapper greyText'>
          {$t({ defaultMessage: `Enable this when requested by RUCKUS support team.
            By enabling this, you are granting RUCKUS support with temporary
            administrator-level access.` })}
        </Typography.Paragraph>
      </StepsForm.DescriptionWrapper>
    </Form>
  </Loader>
}
