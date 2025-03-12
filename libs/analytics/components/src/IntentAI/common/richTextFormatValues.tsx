import { Typography }         from 'antd'
import { FormatXMLElementFn } from 'intl-messageformat'

export const richTextFormatValues: Record<
  string,
  FormatXMLElementFn<React.ReactNode, React.ReactNode>
> = {
  p: (content) => <Typography.Paragraph children={content} />,
  b: (chunks) => <b>{chunks}</b>,
  i: (chunks) => <i>{chunks}</i>,
  ul: (chunks) => <ul>{chunks}</ul>,
  li: (chunks) => <li>{chunks}</li>,
  br: () => <br />
}
