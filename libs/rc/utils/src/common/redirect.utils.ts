import type { Path } from 'react-router-dom'

export interface LocationExtended extends Path {
  state: {
    from: {
      pathname: string
    }
  }
}

export const redirectPreviousPage = (
  navigate: (path: string | Path) => void,
  previousPath: string,
  defaultPath: string | Path
) => {
  previousPath?.includes('overview') ? navigate(previousPath) : navigate(defaultPath)
}