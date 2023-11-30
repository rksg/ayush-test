import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader } from '@acx-ui/components'

import { ApGroupEditTabs } from './ApGroupEditTabs'

import { ApGroupEditContext } from '.'



export function ApGroupEditPageHeader () {
  const { $t } = useIntl()
  const { isEditMode, isApGroupTableFlag } = useContext(ApGroupEditContext)

  return (
    <PageHeader
      title={!isEditMode ? $t({ defaultMessage: 'Add AP Group' }) :
        $t({ defaultMessage: 'Edit AP Group' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Wi-Fi' }) },
        { text: $t({ defaultMessage: 'Access Points' }) },
        { text: $t({ defaultMessage: 'AP Group List' }), link: '/devices/wifi/apgroups' }
      ]}
      footer={(isEditMode && isApGroupTableFlag)? <ApGroupEditTabs /> : null}
    />
  )
}