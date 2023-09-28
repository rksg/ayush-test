import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import { LayoutUI, Dropdown }      from '@acx-ui/components'
import { get }                     from '@acx-ui/config'
import { QuestionMarkCircleSolid } from '@acx-ui/icons'
import { NewTabLink }              from '@acx-ui/react-router-dom'

export const HelpButton = () => {
  const { $t } = useIntl()
  const documentationCenter = get('MLISA_DOCUMENTATION_URL')
  const menuHeaderDropdown = (
    <Menu
      selectedKeys={[]}
      items={[
        {
          key: 'What’s-New',
          label: <NewTabLink to='https://whatsnew.com'>
            {$t({ defaultMessage: 'What’s New' })}
          </NewTabLink>
        },
        {
          key: 'documentation',
          label: <NewTabLink to={documentationCenter}>
            {$t({ defaultMessage: 'Documentation' })}
          </NewTabLink>
        },
        {
          key: 'how-to-videos',
          // eslint-disable-next-line max-len
          label: <NewTabLink to='https://www.youtube.com/playlist?list=PLySwoo7u9-KJeAI4VY_2ha4r9tjnqE3Zi'>
            {$t({ defaultMessage: 'How-To Videos' })}
          </NewTabLink>
        },
        {
          key: 'license-information',
          // eslint-disable-next-line max-len
          label: <NewTabLink to='https://docs.cloud.ruckuswireless.com/RALicensingGuide/mapfile/index.html'>
            {$t({ defaultMessage: 'License Information' })}
          </NewTabLink>
        },
        { type: 'divider' },
        {
          key: 'contact-support',
          label: <NewTabLink to='https://support.ruckuswireless.com/contact-us'>
            {$t({ defaultMessage: 'Contact Support' })}
          </NewTabLink>
        },
        {
          key: 'open-a-case',
          label: <NewTabLink to='https://support.ruckuswireless.com/cases/new'>
            {$t({ defaultMessage: 'Open a Case' })}
          </NewTabLink>
        },
        { type: 'divider' },
        {
          key: 'privacy',
          label: <NewTabLink to='https://support.ruckuswireless.com/ruckus-cloud-privacy-policy'>
            {$t({ defaultMessage: 'Privacy' })}
          </NewTabLink>
        }
      ]}
    />
  )

  return <Dropdown overlay={menuHeaderDropdown} placement='bottomLeft'>{() =>
    <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />
  }</Dropdown>
}
