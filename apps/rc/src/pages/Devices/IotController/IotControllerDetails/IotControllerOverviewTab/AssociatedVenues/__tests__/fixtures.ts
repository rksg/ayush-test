const data = {
  summary: {
    aps: {
      summary: {
        online: 1,
        offline: 1
      },
      totalCount: 2
    },
    rcapLicenseUtilization: {
      summary: {
        used: 1,
        available: 1
      },
      totalCount: 2
    },
    associatedVenues: {
      summary: {
        venues: 1
      },
      totalCount: 2
    }
  }
}

const noData = {
  summary: {
    aps: {
      summary: {},
      totalCount: 0
    }
  }
}

export { data, noData }
