import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path';
import { readdir, readFileSync } from 'fs';

const subjectMap = (): Plugin => {
  const virtualModuleId = 'virtual:subject_map'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  let isBuildMode = false;
  const results: ([number, string])[] = [];
  const idRegex = /(\d+)\.json$/;
  
  return {
    name: 'copy-subjects',
    config(_, { command }) {
      isBuildMode = command === 'build';
    },
    buildStart() {
      readdir(path.resolve(__dirname, "./src/assets/subjects"), (err, files) => {
        if (err) {
          this.error(err);
        }

        files.forEach(file => {
          const id = parseInt(idRegex.exec(file)![1]);
          if (isBuildMode) {
            const chunkRefId = this.emitFile({ name: `subject-${file}`, type: "asset",  source: readFileSync(`./src/assets/subjects/${file}`) });
            results.push([id, `"__VITE_ASSET__${chunkRefId}__"`])
          } else {
            results.push([id, `"/src/assets/subjects/${id}.json"`]);
          }
        });
      });
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        let result = 'const results = {';

        results.forEach(([id, value]) => {
          result += `${id}: ${value},`
        })

        result += '}; export default Object.fromEntries(Object.entries(results).map(([k, v]) => [k, new URL(v, import.meta.url).href]));'

        // there doesn't seem to be a way to just get the hash for a file without using __VITE_ASSET_<id>__, which returns the full path
        // wasting a bunch of space.

        return result;
      }
    },
  };
};

export default defineConfig({
  plugins: [
    subjectMap(),
    react()
  ],

  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, './node_modules/bootstrap'),
    }
  }
})
