// Passenger entry point; backend code and secrets must stay outside public_html.
// Node.js 22 loads the server-only .env before importing the application.
try {
  process.loadEnvFile('.env');
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
import('./server/http.mjs').then(({ server }) => server.listen(process.env.PORT || 3000)).catch(() => {
  console.error('Dopamine could not start. Check the server configuration.');
  process.exitCode = 1;
});
