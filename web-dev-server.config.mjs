/** Use Hot Module replacement by adding --hmr to the start command */
const hmr = process.argv.includes('--hmr');

export default /** @type {import('@web/dev-server').DevServerConfig} */ ({
  nodeResolve: true,
  open: '/',
  watch: !hmr,
  hostname: 'postadmin.soord.org.uk',
  sslKey: 'd:/apache-certs/postadmin.soord.org.uk-key.pem',
  sslCert: 'd:/apache-certs/postadmin.soord.org.uk-crt.pem',
  //  hostname: 'scoutpostadmin.soord.org.uk',
  //  sslKey: 'd:/apache-certs/scoutpostadmin.soord.org.uk-key.pem',
  //   sslCert: 'd:/apache-certs/scoutpostadmin.soord.org.uk-crt.pem',
  protocol: 'https',
  http2: true,
  port: 443,

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto'

  /** Set appIndex to enable SPA routing */
  // appIndex: 'demo/index.html',

  /** Configure bare import resolve plugin */
  // nodeResolve: {
  //   exportConditions: ['browser', 'development']
  // },

  plugins: [
    /** Use Hot Module Replacement by un-commenting. Requires @open-wc/dev-server-hmr plugin */
    // hmr && hmrPlugin({ exclude: ['**/*/node_modules/**/*'], presets: [presets.litElement] }),
  ],

  // See documentation for all available options
});
