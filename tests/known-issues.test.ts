/**
 * DOCUMENTS KNOWN BUGS — tests that SHOULD pass but don't.
 *
 * Every `test.fails(...)` below describes a feature the codebase claims
 * to support but is currently broken. When a bug is fixed, the test
 * starts passing and `test.fails` throws, alerting us to update it.
 *
 * If more tests here pass than expected, that's GOOD — it means bugs
 * were fixed.
 */
import { describe, it, expect } from 'vitest';
import { runEmdesign } from './helpers/cli.js';
import { apiGet } from './helpers/http.js';

// ── CLI: --help and --version ─────────────────────────────────────────────────

describe('KNOWN ISSUE: CLI --help', () => {
  it.fails('should print usage and exit 0', async () => {
    // Bug: CLI treats `--help` as a subcommand name, not a flag.
    // Expected: help text listing all commands
    // Actual:   `[emdesign] fatal: unknown command: --help`
    const r = await runEmdesign(['--help']);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toMatch(/(serve|mcp|init|ds)/);
  });
});

describe('KNOWN ISSUE: CLI --version', () => {
  it.fails('should print version string and exit 0', async () => {
    // Bug: CLI treats `--version` as a subcommand name, not a flag.
    // Expected: version string
    // Actual:   `[emdesign] fatal: unknown command: --version`
    const r = await runEmdesign(['--version']);
    expect(r.exitCode).toBe(0);
    expect(r.stdout.length).toBeGreaterThan(0);
  });
});

// ── MCP Streamable HTTP ───────────────────────────────────────────────────────

describe('KNOWN ISSUE: MCP Streamable HTTP', () => {
  it.fails('POST /mcp should respond to tools/call with JSON-RPC result', async () => {
    // Bug: The StreamableHTTPServerTransport.handleRequest() crashes internally.
    // The MCP endpoint returns HTTP 500 with empty body.
    const res = await fetch(`http://localhost:${process.env.EMDESIGN_PORT ?? '4321'}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'tools/call',
        params: { name: 'get_design_context', arguments: {} },
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('result');
  });
});

describe('KNOWN ISSUE: MCP tools/list', () => {
  it.fails('POST /mcp with tools/list should return tool list', async () => {
    const res = await fetch(`http://localhost:${process.env.EMDESIGN_PORT ?? '4321'}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: '1', method: 'tools/list' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.tools.length).toBeGreaterThan(0);
  });
});

// ── CLI ds doctor ─────────────────────────────────────────────────────────────

describe('KNOWN ISSUE: ds doctor performance', () => {
  it.fails('should complete within 15 seconds', async () => {
    // Bug: ds doctor takes >30s or produces no visible output.
    // The doctor command either hangs on some dependency or is just very slow.
    const r = await runEmdesign(['ds', 'doctor', 'atelier'], { timeout: 15_000 });
    expect(r.exitCode).toBe(0);
    expect(r.stdout.length).toBeGreaterThan(0);
  });
});
