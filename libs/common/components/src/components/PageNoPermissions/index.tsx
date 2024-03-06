import { useNavigate } from '@acx-ui/react-router-dom'
import { getIntl } from '@acx-ui/utils'
import { Button } from '../Button'

import { Subtitle } from '../Subtitle'

import { PageStyle } from './styledComponents'

export const PageNoPermissions = () => {
  const { $t } = getIntl()
  const navigate = useNavigate()

  return <PageStyle>
    <Subtitle level={2} style={{marginBottom: '30px', fontWeight: 'normal'}}>
      {$t({ defaultMessage: 'Sorry, you don’t have permissions to view this page' })}
    </Subtitle>
    <Button
      type='link'
      onClick={() => {
        navigate(-1)
      }}>
      {$t({ defaultMessage: 'Go Back' })}
    </Button>
  </PageStyle>
}