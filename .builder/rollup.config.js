const fs = require('fs')
const path = require('path')
const rollup = require('rollup').rollup
const uglify = require('rollup-plugin-uglify')
const typescriptPlugin = require('rollup-plugin-typescript2')


const copyPlugin = function (options) {
    return {
        ongenerate() {
            const targDir = path.dirname(options.targ);
            if (!fs.existsSync(targDir)) {
                fs.mkdirSync(targDir)
            }
            if (options.remove) {
                let json = fs.readFileSync(options.src)
                let parsed = JSON.parse(json)
                options.remove.forEach(element => delete parsed[element])
                fs.writeFileSync(options.targ, JSON.stringify(parsed, null, '\t'))
            } else {
                fs.writeFileSync(options.targ, fs.readFileSync(options.src))
            }
        }
    }
}

return rollup({
    input: './src/index.ts',
    plugins: [
        typescriptPlugin({
            useTsconfigDeclarationDir: true,
            tsconfig: './.builder/tsconfig.json',
            cacheRoot: './.builder/cache',
            tsconfigOverride: process.env.NPM ? {
                compilerOptions: { declaration: true, declarationDir: '../src' }
            } : {}
        }),
        uglify({
            mangle: true,
            output: {
                beautify: process.env.NPM || process.env.BEAUTY || false
            }
        }),
        !process.env.NPM || copyPlugin({
            src: './package.json',
            targ: './dist/package.json',
            remove: ['devDependencies', 'scripts']
        }),
        !process.env.NPM || copyPlugin({
            src: './README.md',
            targ: './dist/README.md',
        }),
        !process.env.NPM || copyPlugin({
            src: './LICENSE',
            targ: './dist/LICENSE',
        })
    ]
}).then((bundle) => {
    bundle.write({ format: process.env.NPM ? 'cjs' : 'iife', file: process.env.NPM ? './dist/index.js' : (process.env.BEAUTY ? './dist/browser/ClusterWS.js' : './dist/browser/ClusterWS.min.js'), name: 'ClusterWS' }).then(() => {
        if (process.env.NPM) {
            const dts = require('dts-bundle')
            dts.bundle({
                externals: false,
                referenceExternals: false,
                name: "index",
                main: './src/**/*.d.ts',
                out: '../dist/index.d.ts',
                removeSource: true,
                outputAsModuleFolder: true,
                emitOnIncludedFileNotFound: true
            })
        }
    })
})
