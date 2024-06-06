
import moment                       from 'moment-timezone'
import { useIntl }                  from 'react-intl'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button, PageHeader, RangePicker }                  from '@acx-ui/components'
import { LocationOutlined }                                 from '@acx-ui/icons'
import { ApGroupDetailHeader, useConfigTemplateBreadcrumb } from '@acx-ui/rc/utils'
import { filterByAccess }                                   from '@acx-ui/user'
import { useDateFilter }                                    from '@acx-ui/utils'

import { usePathBasedOnConfigTemplate } from '../configTemplates'

import { useApGroupContext }     from './ApGroupContextProvider'
import ApGroupTabs               from './ApGroupTabs'
import { ApGroupDetailSubTitle } from './styledComponents'


function ApGroupPageHeader () {
  const { $t } = useIntl()

  const { apGroupId, activeTab, name, venueName, members, networks } = useApGroupContext()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  const apgHeaderData = {
    title: name || '',
    headers: {
      members: members?.count || 0,
      networks: networks?.count || 0
    }
  }

  const navigate = useNavigate()
  const location = useLocation()
  const basePath = usePathBasedOnConfigTemplate(`/devices/apgroups/${apGroupId}`)

  const enableTimeFilter = () => (['incidents'].includes(activeTab as string))

  const breadcrumb = useConfigTemplateBreadcrumb([
    { text: $t({ defaultMessage: 'Wi-Fi' }) },
    { text: $t({ defaultMessage: 'Access Points' }) },
    { text: $t({ defaultMessage: 'AP Group List' }), link: '/devices/wifi/apgroups' }
  ])

  return (
    <PageHeader
      title={apgHeaderData.title || ''}
      titleExtra={<ApGroupDetailSubTitle>
        <LocationOutlined />
        {venueName}
      </ApGroupDetailSubTitle>}
      breadcrumb={breadcrumb}
      extra={[
        enableTimeFilter() &&
          <RangePicker
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilter as CallableFunction}
            showTimePicker
            selectionType={range}
          />,
        ...filterByAccess([
          <Button type='primary'
            children={$t({ defaultMessage: 'Configure' })}
            onClick={() => {
              navigate({
                ...basePath,
                pathname: `${basePath.pathname}/edit/general`
              }, {
                state: {
                  from: location
                }
              })
            }} />
        ])
      ]}
      footer={
        <ApGroupTabs apGroupDetail={apgHeaderData as ApGroupDetailHeader} />
      }
    />
  )
}

export default ApGroupPageHeader
