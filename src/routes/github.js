/**
 * GITHUB INTEGRATION — TRINITY Core
 * Connects to user's GitHub repos via REST API.
 * AI Core can read and modify project code.
 *
 * GET    /api/github/repos                    — list user's repositories
 * GET    /api/github/repo/:owner/:name        — repo info + branches
 * GET    /api/github/repo/:owner/:name/contents?path=...&branch=...  — browse/read files
 * PUT    /api/github/repo/:owner/:name/contents?path=...&branch=...  — create/update file
 * DELETE /api/github/repo/:owner/:name/contents?path=...&branch=...  — delete file
 */

import { logAudit } from '../data/store.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}

function getToken(env) {
  const t = env?.GITHUBE || env?.github || env?.GITHUB_TOKEN || env?.GITHUB;
  return t ? t.trim() : null;
}

export async function ghFetch(path, env, opts = {}) {
  const token = getToken(env);
  if (!token) return { error: 'GitHub token nie je nastavený. Pridaj GITHUBE secret.' };
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      ...opts,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'TRINITY-AI-Core',
        ...(opts.headers || {}),
      },
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch {
      return { error: `GitHub API vrátilo ne-JSON odpoveď (status ${res.status}): ${text.slice(0, 200)}`, status: res.status };
    }
    if (!res.ok) return { error: data.message || `GitHub API error ${res.status}`, status: res.status };
    return { data };
  } catch (e) {
    return { error: e.message };
  }
}

export async function handleGitHub(request, env) {
  const url = new URL(request.url);
  // parts: ['api','github','repos'] or ['api','github','repo',owner,name] or ['api','github','repo',owner,name,'contents']
  const parts = url.pathname.split('/').filter(Boolean);
  const query = url.searchParams;
  const branch = query.get('branch') || 'main';
  const filePath = query.get('path') || '';

  // parts[0]='api' parts[1]='github' parts[2]='repos'|'repo'
  const sub = parts[2]; // 'repos' or 'repo'

  // GET /api/github/repos — list user's repositories
  if (sub === 'repos' && request.method === 'GET') {
    const result = await ghFetch('/user/repos?sort=updated&per_page=50&type=all', env);
    if (result.error) return json({ error: result.error }, 400);
    const repos = result.data.map(r => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      owner: r.owner.login,
      private: r.private,
      description: r.description,
      default_branch: r.default_branch,
      language: r.language,
      stars: r.stargazers_count,
      updated_at: r.updated_at,
      html_url: r.html_url,
    }));
    return json({ repos });
  }

  // For /api/github/repo/:owner/:name[/:action]
  // parts[3]=owner parts[4]=name parts[5]=action('contents'|'branches')
  if (sub === 'repo' && parts.length >= 5) {
    const owner = parts[3];
    const name = parts[4];
    const action = parts[5]; // 'contents' | 'branches' | undefined

    // GET /api/github/repo/:owner/:name/branches
    if (action === 'branches' && request.method === 'GET') {
      const result = await ghFetch(`/repos/${owner}/${name}/branches?per_page=30`, env);
      if (result.error) return json({ error: result.error }, 400);
      const branches = result.data.map(b => ({ name: b.name, protected: b.protected }));
      return json({ branches });
    }

    // GET /api/github/repo/:owner/:name — repo info + branches
    if (!action && request.method === 'GET') {
      const [repoRes, branchesRes] = await Promise.all([
        ghFetch(`/repos/${owner}/${name}`, env),
        ghFetch(`/repos/${owner}/${name}/branches?per_page=30`, env),
      ]);
      if (repoRes.error) return json({ error: repoRes.error }, 400);
      const r = repoRes.data;
      return json({
        repo: {
          name: r.name,
          full_name: r.full_name,
          owner: r.owner.login,
          description: r.description,
          default_branch: r.default_branch,
          language: r.language,
          private: r.private,
          size: r.size,
        },
        branches: branchesRes.error ? [] : branchesRes.data.map(b => ({ name: b.name, protected: b.protected })),
      });
    }

    // GET /api/github/repo/:owner/:name/contents?path=...&branch=... — browse/read
    if (action === 'contents' && request.method === 'GET') {
      const ghPath = `/repos/${owner}/${name}/contents/${filePath}?ref=${branch}`;
      const result = await ghFetch(ghPath, env);
      if (result.error) return json({ error: result.error }, result.status || 400);

      // Directory listing
      if (Array.isArray(result.data)) {
        const items = result.data.map(f => ({
          name: f.name,
          path: f.path,
          type: f.type,
          size: f.size,
          sha: f.sha,
        }));
        return json({ type: 'dir', path: filePath, branch, items });
      }

      // Single file
      const fileContent = result.data.encoding === 'base64'
        ? atob(result.data.content.replace(/\n/g, ''))
        : result.data.content;
      return json({
        type: 'file',
        path: result.data.path,
        name: result.data.name,
        sha: result.data.sha,
        size: result.data.size,
        content: fileContent,
        branch,
      });
    }

    // PUT /api/github/repo/:owner/:name/contents?path=...&branch=... — create/update file
    if (action === 'contents' && request.method === 'PUT') {
      const body = await request.json().catch(() => ({}));
      if (!body.content) return json({ error: 'Chýba content' }, 400);

      let sha = body.sha;
      if (!sha && filePath) {
        const existing = await ghFetch(`/repos/${owner}/${name}/contents/${filePath}?ref=${branch}`, env);
        if (!existing.error && existing.data?.sha) sha = existing.data.sha;
      }

      const payload = {
        message: body.message || `TRINITY AI Core: update ${filePath}`,
        content: btoa(unescape(encodeURIComponent(body.content))),
        branch,
      };
      if (sha) payload.sha = sha;

      const result = await ghFetch(`/repos/${owner}/${name}/contents/${filePath}`, env, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (result.error) return json({ error: result.error }, result.status || 400);
      logAudit('GITHUB_FILE_WRITE', 'super-admin', `${owner}/${name}:${filePath} @${branch}`);
      return json({
        success: true,
        commit: result.data.commit?.sha,
        path: filePath,
        branch,
        message: payload.message,
      });
    }

    // DELETE /api/github/repo/:owner/:name/contents?path=...&branch=... — delete file
    if (action === 'contents' && request.method === 'DELETE') {
      const body = await request.json().catch(() => ({}));

      let sha = body.sha;
      if (!sha && filePath) {
        const existing = await ghFetch(`/repos/${owner}/${name}/contents/${filePath}?ref=${branch}`, env);
        if (!existing.error && existing.data?.sha) sha = existing.data.sha;
      }
      if (!sha) return json({ error: 'Nemôžem nájsť súbor na zmazanie' }, 400);

      const result = await ghFetch(`/repos/${owner}/${name}/contents/${filePath}`, env, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: body.message || `TRINITY AI Core: delete ${filePath}`,
          sha,
          branch,
        }),
      });

      if (result.error) return json({ error: result.error }, result.status || 400);
      logAudit('GITHUB_FILE_DELETE', 'super-admin', `${owner}/${name}:${filePath} @${branch}`);
      return json({ success: true, commit: result.data.commit?.sha, path: filePath, branch });
    }
  }

  return json({ error: 'GitHub endpoint not found' }, 404);
}
