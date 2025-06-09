import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { get }                             from '@acx-ui/config'
import { LinkDocumentIcon, LinkVideoIcon } from '@acx-ui/icons'
import { DOCS_HOME_URL }                   from '@acx-ui/rc/utils'

import { AiFeatures } from '../config'

const featureToGuideIdMap: { [feature in AiFeatures]?: string } = {
  [AiFeatures.AIOps]: 'GUID-E267071A-931D-471B-8F5D-F5EFC07115D6',
  [AiFeatures.EquiFlex]: 'GUID-4FC73239-0E27-49C9-94DB-36D79D68AF34',
  [AiFeatures.RRM]: 'GUID-0483BCF1-3219-481F-A89B-CCCB4567A9A9'
}

const featureToRAIVideoLinkMap: { [feature in AiFeatures]?: string } = {
  [AiFeatures.AIOps]: 'https://youtu.be/kN8BWvXVsrQ',
  [AiFeatures.EquiFlex]: 'https://youtu.be/ifHe99dtcR0',
  [AiFeatures.RRM]: 'https://youtu.be/NIvmnE8Rd-A'
}

const featureToR1VideoLinkMap: { [feature in AiFeatures]?: string } = {
  [AiFeatures.AIOps]: 'https://play.vidyard.com/tSpf711jny6xHSE8VHkiQu',
  [AiFeatures.EquiFlex]: 'https://play.vidyard.com/tEdrN9AjLh7erscbBkKYmw',
  [AiFeatures.RRM]: 'https://play.vidyard.com/JKHvezCGEKBkKw6r7xzfbH'
}

const ResourcesLinks = ({ feature }: { feature: AiFeatures }) => {
  const { $t } = useIntl()
  const isMLISA = get('IS_MLISA_SA')
  const appName = isMLISA ? 'RUCKUS AI' : 'RUCKUS One'
  const guideId = featureToGuideIdMap[feature]
  const videoLink = isMLISA
    ? featureToRAIVideoLinkMap[feature]
    : featureToR1VideoLinkMap[feature]

  return <>
    {[
      ...(guideId
        ? [
          {
            icon: <LinkVideoIcon />,
            label: `${appName} - ${$t(
              { defaultMessage: '{featureName} Demo' },
              { featureName: feature }
            )}`,
            link: videoLink
          }
        ]
        : []),
      ...(guideId
        ? [
          {
            icon: <LinkDocumentIcon />,
            label: `${appName} - ${$t(
              { defaultMessage: '{featureName} Documentation' },
              { featureName: feature }
            )}`,
            // eslint-disable-next-line max-len
            link: `${DOCS_HOME_URL}/${isMLISA ? 'RUCKUS-AI' : 'ruckusone'}/userguide/${featureToGuideIdMap[feature]}.html`
          }
        ]
        : [])
    ].map((item, index) => (
      <a
        href={item.link}
        key={`resources-${index}`}
        target='_blank'
        rel='noreferrer'
      >
        <Space>
          {item.icon}
          {item.label}
        </Space>
      </a>
    ))}
  </>
}

export default ResourcesLinks
