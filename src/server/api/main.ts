// Src / server / api / main.ts;
import {Hono} from 'hono';
import {serve} from '@hono/node-server';

const app = new Hono();

app.get('/', c => c.text('Hono!'));
app.get('/api/log', c => c.json({message: 'Hello from Hono!'}));

const port = 8174;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});

export default app;
