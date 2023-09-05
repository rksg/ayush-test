import { Menu, Dropdown } from 'antd'
import { useIntl }        from 'react-intl'

import { LayoutUI }                from '@acx-ui/components'
import { get }                     from '@acx-ui/config'
import { QuestionMarkCircleSolid } from '@acx-ui/icons'

import { ButtonWrapper } from './styledComponents'

export const HelpButton = () => {
  const { $t } = useIntl()

  const documentationCenter = get('MLISA_DOCUMENTATION_URL')

  const menuHeaderDropdown = (
    <Menu selectedKeys={[]}
      onClick={(menuInfo)=>{
        switch(menuInfo.key)
        {
          case 'documentation':
            window.open(documentationCenter, '_blank')
            break
          case 'how-to-videos':
            window.open(
              'https://www.youtube.com/playlist?list=PLySwoo7u9-KJ4kZxhfoArNQfFDGWhwSJm', '_blank')
            break
          case 'license-information':
            window.open(
              'http://docs.cloud.ruckuswireless.com/RALicensingGuide/mapfile/index.html', '_blank')
            break
          case 'contact-support':
            window.open('https://support.ruckuswireless.com/contact-us', '_blank')
            break
          case 'open-a-case':
            window.open('https://support.ruckuswireless.com/cases/new', '_blank')
            break
          case 'privacy':
            window.open('https://support.ruckuswireless.com/ruckus-cloud-privacy-policy', '_blank')
            break
        }
      }}
      items={[{
        key: 'documentation',
        label: $t({ defaultMessage: 'Documentation' })
      },
      {
        key: 'how-to-videos',
        label: $t({ defaultMessage: 'How-To Videos' })
      },
      {
        key: 'license-information',
        label: $t({ defaultMessage: 'License Information' })
      },
      { type: 'divider' },
      {
        key: 'contact-support',
        label: $t({ defaultMessage: 'Contact Support' })
      },
      {
        key: 'open-a-case',
        label: $t({ defaultMessage: 'Open a case' })
      },
      { type: 'divider' },
      {
        key: 'privacy',
        label: $t({ defaultMessage: 'Privacy' })
      }]}
    />
  )

  return (<ButtonWrapper>
    <Dropdown
      overlay={menuHeaderDropdown}
      trigger={['click']}
      placement='bottomLeft'
      children={<LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />}
    />
  </ButtonWrapper>
  )
}
