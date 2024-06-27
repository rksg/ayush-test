import { useIntl } from 'react-intl'

import { Drawer, DrawerTypes, Loader } from '@acx-ui/components'
import { useGetActionByIdQuery }       from '@acx-ui/rc/services'
import { ActionType, ActionTypeTitle } from '@acx-ui/rc/utils'

import { AupPreview } from './WorkflowActionPreview'

const previewMap = {
  [ActionType.AUP]: AupPreview,
  [ActionType.DATA_PROMPT]: AupPreview,     // FIXME: Implement Data_Prompt preview component
  [ActionType.DISPLAY_MESSAGE]: AupPreview  // FIXME: Implement Display_Message preview component
}

export function ActionPreviewDrawer (props: {
    actionId: string,
    actionType: ActionType,
    onClose: () => void
}) {
  const { $t } = useIntl()
  const { actionId, actionType, onClose } = props
  const ActionPreview = previewMap[actionType]
  const {
    data,
    isLoading,
    isFetching
  } = useGetActionByIdQuery({ params: { actionId } })

  return (
    <Drawer
      visible
      width={'100vw'}
      drawerType={DrawerTypes.FullHeight}
      title={$t({ defaultMessage: 'Action Preview:' })
       + ' ' + $t(ActionTypeTitle[actionType])}
      onClose={onClose}
    >
      <Loader states={[{ isLoading, isFetching }]}>
        <ActionPreview data={data}/>
      </Loader>
    </Drawer>
  )
}
