import { MessageDescriptor, defineMessage } from 'react-intl'

import { OperatorType } from '../../types/policies/radiusAttributeGroup'

export const AttributeOperationLabelMapping: Record<OperatorType, MessageDescriptor> = {
  [OperatorType.ADD]: defineMessage({ defaultMessage: 'Add (Multiple)' }),
  [OperatorType.ADD_REPLACE]: defineMessage({ defaultMessage: 'Add or Replace (Single)' }),
  [OperatorType.DOES_NOT_EXIST]: defineMessage({ defaultMessage: 'Add if it Doesn\'t Exist' })
}
