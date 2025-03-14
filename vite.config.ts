import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readdir, readFileSync } from "fs";
import MagicString from 'magic-string'

const subjectMap = (): Plugin => {
  const virtualModuleId = "virtual:subject_map";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  let isBuildMode = false;
  const results: {[key: string]: string} = {};
  const idRegex = /(\d+)\.json$/;
  const assetIdRegex = /-(.*?)\.json$/;
  const chunkIdRegex = /__SUBJECT_MAP__([\w$]+)__(?:\$_(.*?)__)?/g

  return {
    name: "copy-subjects",
    enforce: 'post',
    config(_, { command }) {
      isBuildMode = command === "build";
    },
    buildStart() {
      readdir(
        path.resolve(__dirname, "./src/assets/subjects"),
        (err, files) => {
          if (err) {
            this.error(err);
          }

          files.forEach((file) => {
            const id = idRegex.exec(file)![1];

            if (isBuildMode) {
              const chunkRefId = this.emitFile({
                name: `s${file}`,
                type: "asset",
                source: readFileSync(`./src/assets/subjects/${file}`),
              });
              results[id] = chunkRefId;
            } else {
              results[id] = `/src/assets/subjects/${id}.json`;
            }
          });
        },
      );
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        let result = "const subjectMap = [";

        const numKeys = Object.keys(results).map((id) => parseInt(id)!);
        const minId = Math.min(...numKeys);
        const maxId = Math.max(...numKeys);

        for (let i = 0; i <= maxId; i++) {
          if (i < minId) {
            result += "null,";
          } else {
            const chunkRefId = results[i.toString()];
            if (chunkRefId) {
              if (isBuildMode) {
                result += `__SUBJECT_MAP__${chunkRefId}__,`;
              } else {
                result += `${JSON.stringify(chunkRefId)},`;
              }
            } else {
              result += "null,";
            }
          }
        }

        result += "]; \n\n" + 
        "export default (id) => { \n" +
        "  const result = subjectMap[id];\n" + 
        "  if (result) {\n";
        if (isBuildMode) {
          result += "    const thing = import.meta.url; return new URL(\`/assets/s${id}-${result}.json\`, thing).href;";
        } else {
          result += "    return result;"
        }
        result += "  } else {\n" +
        "    throw `Unable to find subject ${id};`" + 
        "  }\n" +
        "};"

        return result;
      }
    },

    renderChunk(code) {
      let match: RegExpExecArray | null = null;
      let s: MagicString | undefined;

      chunkIdRegex.lastIndex = 0
      while ((match = chunkIdRegex.exec(code))) {
        s ||= new MagicString(code)

        const file = this.getFileName(match[1]);
        const [_, chunkId] = assetIdRegex.exec(file)!;

        s.update(match.index, match.index + match[0].length, `'${chunkId}'`)
      }

      if (s) {
        return {
          code: s.toString(),
          map: this.environment.config.build.sourcemap ? s.generateMap({ hires: 'boundary' }) : null,
        }
      } else {
        return null;
      }
    }
  }
};

export default defineConfig({
  plugins: [subjectMap(), react()],

  resolve: {
    alias: {
      "~bootstrap": path.resolve(__dirname, "./node_modules/bootstrap"),
    },
  },
});
