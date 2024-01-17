await Bun.build({
  entrypoints: ['./schism.js'],
  outdir: '.',
  target: 'node',
  minify: true,
  naming: '[dir]/[name].min.[ext]',
})
