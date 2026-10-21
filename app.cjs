// Passenger entry point; backend code and secrets must stay outside public_html.
import('./server/http.mjs').then(({ server }) => server.listen(process.env.PORT || 3000)).catch(() => {
  console.error('Dopamine could not start. Check the server configuration.');
  process.exitCode = 1;
});
