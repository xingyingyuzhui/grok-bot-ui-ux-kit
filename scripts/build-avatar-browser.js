import { build } from "esbuild";
await build({
  entryPoints: ["src/avatar.js"],
  outfile: "dist/avatar.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  minify: true,
  legalComments: "linked",
  define: { "process.env.NODE_ENV": '"production"' },
  metafile: true,
}).then((result) => {
  const imports = Object.values(result.metafile.outputs).flatMap(
    (o) => o.imports,
  );
  if (imports.length)
    throw new Error("Avatar browser module must be standalone");
  console.log("Built standalone official avatar runtime");
});
const { writeFile } = await import("node:fs/promises");
const website = await import("../src/website-avatar-data.generated.js");
const dmg = await import("../src/avatar-engine.generated.js");
await writeFile(
  "assets/avatar-motion/catalog.json",
  JSON.stringify(
    {
      website: {
        states: website.GROK_BOT_STATES,
        shapes: website.GROK_BOT_SHAPES,
        blinkCadenceMs: website.BLINK_CADENCE,
        expressionCadenceMs: website.EXPRESSION_CADENCE,
        expressionPools: website.EXPRESSION_POOLS,
        morphShotMs: website.MORPH_SHOT_MS,
        morphRestMs: website.MORPH_REST_MS,
      },
      dmg: { states: dmg.stateDefinitions },
    },
    null,
    2,
  ) + "\n",
);
