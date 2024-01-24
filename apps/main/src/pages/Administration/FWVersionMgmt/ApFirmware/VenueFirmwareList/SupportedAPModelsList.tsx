import { Space } from 'antd'

type LayoutSize = 'small' | 'large'

const supportedApModels: {
  abfAlias: string
  supportedVersions: string[]
  supportedApModels: string[]
  layoutSize: LayoutSize
}[] = [
  {
    abfAlias: 'Wi-Fi 7',
    supportedVersions: ['7.0.0'],
    supportedApModels: ['R770'],
    layoutSize: 'small'
  },
  {
    abfAlias: 'Wi-Fi 6, 6E and 11ac wave2',
    supportedVersions: ['6.2.3', '6.2.2', '6.2.1'],
    supportedApModels: [
      'R760', 'R560', 'R850', 'R750', 'R650', 'R550', 'R350', 'H550', 'H350',
      'T750', 'T750SE', 'T350C', 'T350D', 'T350SE',
      'R720', 'R710', 'R610', 'R510', 'R320', 'M510', 'H510', 'H320',
      'E510', 'T710', 'T710S', 'T610', 'T610S', 'T310C', 'T310D', 'T310N', 'T310S'
    ],
    layoutSize: 'large'
  },
  {
    abfAlias: '11ac',
    supportedVersions: ['6.2.0'],
    supportedApModels: ['R600', 'R500', 'R310', 'R730', 'T300', 'T300E', 'T301N', 'T301S'],
    layoutSize: 'small'
  }
]

export function SupportedAPModelsList () {
  return (
    <Space direction='horizontal' align='start' size={12}>
      {supportedApModels.map(item => {
        return <APModelList
          key={item.abfAlias}
          title={item.abfAlias}
          subtitle={item.supportedVersions.join(' / ')}
          apModels={item.supportedApModels}
          titleSize={item.layoutSize}
          subtitleSize={item.layoutSize}
        />
      })}
    </Space>
  )
}

interface APModelListProps {
  apModels: string[]
  title: string
  subtitle: string
  titleSize?: LayoutSize
  subtitleSize?: LayoutSize
}
function APModelList (props: APModelListProps) {
  const { title, subtitle, apModels, titleSize = 'small', subtitleSize = 'small' } = props
  const shouldSeparated = apModels.length > 10
  const separatedIndex = Math.ceil(apModels.length / 2)

  return (
    <Space direction='vertical' align='center'>
      <div style={{
        width: titleSize === 'small' ? 120 : 200,
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        {title}
      </div>
      <div style={{
        width: subtitleSize === 'small' ? 120 : 170,
        textAlign: 'center',
        textDecoration: 'underline'
      }}>
        {subtitle}
      </div>
      {shouldSeparated
        ? <Space direction='horizontal' align='start' size={12}>
          <ul>
            {apModels.slice(0, separatedIndex).map(apModel => <li key={apModel}>{apModel}</li>)}
          </ul>
          <ul>
            {apModels.slice(separatedIndex).map(apModel => <li key={apModel}>{apModel}</li>)}
          </ul>
        </Space>
        : <ul>
          {apModels.map(apModel => <li key={apModel}>{apModel}</li>)}
        </ul>
      }
    </Space>
  )
}
