import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { resolvers, typeDefs } from './graphql/schema';

const bootstrap = async () => {
	const app = express();
	const httpServer = http.createServer(app);

	const server = new ApolloServer({
		typeDefs,
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	await server.start();

	app.use(
		'/',
		cors<cors.CorsRequest>({
			origin: ['http://localhost:4000'],
		}),
		bodyParser.json(),
		expressMiddleware(server, {
			context: async ({ req }) => ({ token: req.headers.token }),
		})
	);

	await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
	console.log(`🚀 Server ready at http://localhost:4000/`);
};

bootstrap().catch(console.error);
