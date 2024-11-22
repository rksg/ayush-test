/*
  Utility to create Feature Flag (prs) in R1
*/
const yaml  = require('js-yaml')
const fs = require('fs')
const commandLineArgs = require('command-line-args')

// config path for repos, relative to acx-ui/ repo
const GIT_OPS_PATH = process.env.GIT_OPS_PATH || '../gitops-flux-nonbom'
const NONDB_SCHEMA_PATH = process.env.NONDB_SCHEMA_PATH || '../acx-nondb-schema'

// config envs with state
const envs = [
  { env: 'dev', state: 'on' },
  { env: 'int', state: 'on' },
  { env: 'prod', state: 'off' },
  { env: 'prod-eu', state: 'off' },
  { env: 'prod-sg', state: 'off' },
  { env: 'qa', state: 'off' },
  { env: 'stage', state: 'off' }
]


const options = [
  { name: 'name', alias: 'n', type: String },
  { name: 'desc', type: String, alias: 'd' },
  { name: 'tags', multiple: true, alias: 't', type: String}
]
const { name, desc, tags } = commandLineArgs(options)
const toggleFile =  name + '.yaml'
const tagText = tags?.length ? ', Tags: [' + tags.join(', ') + ']' : ''

const updateKustomizationFile = (kustFile, resource, opts) => {
  const doc = yaml.load(fs.readFileSync(kustFile, 'utf8'))
  const { resources } = doc
  if (!resources.includes(resource)) resources.push(resource)
  fs.writeFileSync(kustFile, yaml.dump(doc, opts))
  console.log('updated kustomization file - ', kustFile)
}

// create gitops-flux-nonbom files
const common = {
  apiVersion: 'featureflag.splitio.ruckus.com/v1',
  kind: 'ToggleFF',
  metadata: {
    name,
    namespace: 'operator'
  },
  spec: {
    'featureflag-name': name
  }
}
for (const { env, state } of envs) {
  try {
    const gitOpsData = {
      ...common,
      spec: {
       ...common.spec,
        state,
        comment: "'" + desc + ', flag state ' + state + tagText + "'"
      }
    }
    const yamlData = yaml.dump(gitOpsData, { quotingType: '"', flowLevel: 2 }).replaceAll("'",'')
    const pathToDir = GIT_OPS_PATH + '/environments/' + env + '/featureflag/'
    fs.writeFileSync(pathToDir + toggleFile, yamlData)
    console.log(
      'created feature toggle file in gitops-flux-nonbom repo ',
      'path: ' + pathToDir + toggleFile
    )
    // update kustomization.yaml for each env
    updateKustomizationFile(pathToDir + 'kustomization.yaml', toggleFile, { indent: 1 })
  } catch (e) {
    console.log('error:', e)
  }
}
// create acx-nondb-schema files
const nonDBSchemaData = {
  apiVersion: 'featureflag.splitio.ruckus.com/v1',
  kind: 'CreateFF',
  metadata: {
    name,
    namespace: 'operator'
  },
  spec: {
    comment: "'" + desc +  "'",
    'create-boolean-toggle': {
      'featureflag-name': name,
      description:  "'" + desc +  ", Show in UI when flag is ON'",
      tags: tags.map(tag => "'" + tag + "'")
    }
  }
}
try {
  const yamlData = yaml.dump(nonDBSchemaData, { quotingType: '"', flowLevel: 3 }).replaceAll("'",'')
  const pathToDir = NONDB_SCHEMA_PATH + '/configs/acx-nondb-schema/operator-featureflag/base/'
  fs.writeFileSync(pathToDir + toggleFile, yamlData)
  console.log(
    'created feature toggle file in acx-nondb-schema repo ',
    'path: ' + pathToDir + toggleFile
  )
   // update kustomization.yaml for base
   updateKustomizationFile(pathToDir + 'kustomization.yaml', toggleFile, { indent: 2 })
} catch (e) {
  console.log('error:', e)
}
