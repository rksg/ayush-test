import { Button }  from 'antd'
import { useIntl } from 'react-intl'

import {
  OntDetailsAction,
  DrawerKey,
  OltOnt
} from '@acx-ui/olt/utils'
import { noDataDisplay } from '@acx-ui/utils'

import * as UI from './styledComponents'

export const OntInfoHeader = (props: {
  ontDetails: OltOnt
  dispatch: React.Dispatch<OntDetailsAction>
}) => {
  const { $t } = useIntl()
  const { ontDetails, dispatch } = props

  const handleDrawerOpen = (drawer: DrawerKey) => {
    dispatch({ type: 'OPEN_DRAWER', payload: drawer })
  }

  return <UI.OntHeader>
    <UI.OntHeaderContent>
      <UI.OntTitle>{ ontDetails?.name }</UI.OntTitle>
      <UI.OntInfo>
        { $t({ defaultMessage: 'Model' })}:
        { ontDetails?.model || noDataDisplay }
        { $t({ defaultMessage: 'Profile' })}:
        { ontDetails?.profileName || noDataDisplay }
      </UI.OntInfo>
    </UI.OntHeaderContent>
    <UI.ActionButtons>
      <Button
        type='link'
        size='small'
        onClick={() => handleDrawerOpen('editOnt')}>
        {$t({ defaultMessage: 'Edit ONT' })}
      </Button>
      <Button
        type='link'
        size='small'
        onClick={() => handleDrawerOpen('ontDetails')}>
        {$t({ defaultMessage: 'ONT Details' })}
      </Button>
    </UI.ActionButtons>
  </UI.OntHeader>
}