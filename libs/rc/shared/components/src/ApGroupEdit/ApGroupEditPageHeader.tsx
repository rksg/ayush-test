import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader }                  from '@acx-ui/components'
import { useConfigTemplateBreadcrumb } from '@acx-ui/rc/utils'

import { ApGroupEditTabs } from './ApGroupEditTabs'

import { ApGroupEditContext } from './index'

export function ApGroupEditPageHeader () {
  const { $t } = useIntl()
  const { isEditMode, isApGroupTableFlag } = useContext(ApGroupEditContext)

  const breadcrumb = useConfigTemplateBreadcrumb([
    { text: $t({ defaultMessage: 'Wi-Fi' }) },
    { text: $t({ defaultMessage: 'Access Points' }) },
    { text: $t({ defaultMessage: 'AP Group List' }), link: '/devices/wifi/apgroups' }
  ])

  return (
    <PageHeader
      title={!isEditMode ? $t({ defaultMessage: 'Add AP Group' }) :
        $t({ defaultMessage: 'Edit AP Group' })}
      breadcrumb={breadcrumb}
      footer={(isEditMode && isApGroupTableFlag)? <ApGroupEditTabs /> : null}
    />
  )
}
