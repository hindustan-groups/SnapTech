import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';

describe('Production QA — Security, CORS & RBAC Enforcement', () => {
  it('CORS enforces strict whitelist and rejects unauthorized origins', async () => {
    process.env.NODE_ENV = 'production';

    const testCases = [
      { origin: 'https://snaptech.digital', allowed: true },
      { origin: 'https://www.snaptech.digital', allowed: true },
      { origin: 'https://hindustanprojects.in', allowed: true },
      { origin: 'https://www.hindustanprojects.in', allowed: true },
      { origin: 'https://snaptech-preview-123.vercel.app', allowed: true },
      { origin: 'https://evil.vercel.app', allowed: false },
      { origin: 'https://random.vercel.app', allowed: false },
      { origin: 'http://192.168.1.100', allowed: false },
      { origin: 'http://10.0.0.1', allowed: false },
      { origin: 'https://attacker.snaptech.digital.evil.com', allowed: false },
    ];

    for (const tc of testCases) {
      const res = await request(app)
        .options('/api/services')
        .set('Origin', tc.origin)
        .set('Access-Control-Request-Method', 'GET');

      const allowHeader = res.headers['access-control-allow-origin'];
      if (tc.allowed) {
        expect(allowHeader).toBe(tc.origin);
      } else {
        expect(allowHeader).not.toBe(tc.origin);
      }
    }
  });

  it('Insecure backdoor admin login paths return 404', async () => {
    const backdoorPaths = [
      '/api/admin/h9z7/login',
      '/api/admin/hp/login',
      '/api/admin/secure-hp-portal-2026/login',
    ];

    for (const p of backdoorPaths) {
      const res = await request(app).post(p).send({ email: 'test@test.com', password: 'pass' });
      expect(res.status).toBe(404);
    }
  });

  it('RBAC blocks STAFF from managing users and settings', async () => {
    const staffToken = jwt.sign(
      { id: 'staff-qa', email: 'staff@snaptech.digital', role: 'STAFF', tokenVersion: 0 },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // STAFF cannot GET /api/admin/users
    const resUsers = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(resUsers.status).toBe(403);

    // STAFF cannot PATCH /api/admin/settings
    const resSettings = await request(app)
      .patch('/api/admin/settings')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ phone: '+91 8209604849' });
    expect(resSettings.status).toBe(403);
  });

  it('Unauthenticated requests to admin routes return 404 stealth mode', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(404);
  });
});
