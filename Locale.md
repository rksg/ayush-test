This doc is for I18n management for local development

Run command below when there are new/updated contents added to the code base

```bash
./tools/docker/locales/generate.sh
```

### Extraction
```sh
npx formatjs extract '{apps,libs}/**/src/**/*.{ts,tsx}' --ignore='**/*{.d.ts,.spec.ts,.spec.tsx}' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '$t'
```

### Compiling Messages
```sh
npx formatjs compile apps/main/src/locales/en-US.json --out-file apps/main/src/locales/compiled/en-US.json
```

### Extract & Compile
```sh
npx formatjs extract '{apps,libs}/**/src/**/*.{ts,tsx}' --ignore='**/*{.d.ts,.spec.ts,.spec.tsx}' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --additional-function-names '$t' && npx formatjs compile 'apps/main/src/locales/en-US.json' --out-file apps/main/src/locales/compiled/en-US.json
```

### Translation Management System (TMS) Integration
```sh
npm run extract -- '{apps,libs}/**/src/**/*.{ts,tsx}' --ignore='**/*{.d.ts,.spec.ts,.spec.tsx}' --out-file apps/main/src/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]' --format simple
```
