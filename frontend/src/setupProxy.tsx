import { createProxyMiddleware } from 'http-proxy-middleware';
import { Express } from 'express';

export default function setupProxy(app: Express) {
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'http://localhost:3000',
      ws: true,
    })
  );
}