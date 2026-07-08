export interface Source {
  id: number;
  name: string;
  url: string;
  scraper_type: string;
  is_active: boolean;
  last_crawled?: string;
}

export interface LawUpdate {
  id: number;
  source_id: number;
  source_name: string;
  title: string;
  url?: string;
  pdf_url?: string;
  category: 'Bill' | 'Act' | 'Ordinance';
  date_found: string;
  is_notified: boolean;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
}

export interface UpdatesResponse {
  total: number;
  page: number;
  limit: number;
  pages: number;
  results: LawUpdate[];
}

// Initial mock data fallbacks
const INITIAL_SOURCES: Source[] = [
  { id: 1, name: "National Assembly of Pakistan", url: "https://na.gov.pk",       scraper_type: "na",      is_active: true, last_crawled: "2026-06-28T06:00:00Z" },
  { id: 2, name: "Senate of Pakistan",             url: "https://senate.gov.pk",   scraper_type: "senate",  is_active: true, last_crawled: "2026-06-28T06:00:00Z" },
  { id: 3, name: "Ministry of Law & Justice",      url: "https://molaw.gov.pk",    scraper_type: "molaw",   is_active: true, last_crawled: "2026-06-27T06:00:00Z" },
  { id: 4, name: "Punjab Laws Portal",             url: "https://punjablaws.gov.pk", scraper_type: "generic", is_active: true, last_crawled: "2026-06-28T06:00:00Z" },
  { id: 5, name: "Sindh Laws Portal",              url: "https://sindhlaws.gov.pk",  scraper_type: "generic", is_active: false, last_crawled: "2026-06-25T06:00:00Z" }
];

const INITIAL_UPDATES: LawUpdate[] = [
  {
    id: 1, source_id: 1, source_name: "National Assembly of Pakistan",
    title: "The National Commission for Human Rights (Amendment) Bill, 2026 - Bill No. 43 of 2026",
    url: "https://na.gov.pk/en/bills.php",
    pdf_url: "https://na.gov.pk/uploads/documents/bills/1719582210_928.pdf",
    category: "Bill", date_found: "2026-06-28T06:15:32Z", is_notified: true
  },
  {
    id: 2, source_id: 4, source_name: "Punjab Laws Portal",
    title: "The Punjab Civil Servants (Amendment) Act, 2026 (Act VI of 2026)",
    url: "http://punjablaws.gov.pk/laws/3482.html",
    pdf_url: "http://punjablaws.gov.pk/laws/pdf/punjab_civil_servants_amendment_2026.pdf",
    category: "Act", date_found: "2026-06-28T06:11:10Z", is_notified: true
  },
  {
    id: 3, source_id: 2, source_name: "Senate of Pakistan",
    title: "The Islamabad Capital Territory Local Government (Amendment) Bill, 2026",
    url: "https://senate.gov.pk/en/bills_status.php",
    pdf_url: "https://senate.gov.pk/uploads/documents/bills/ict_local_govt_amend_2026.pdf",
    category: "Bill", date_found: "2026-06-28T06:05:00Z", is_notified: true
  }
];

const INITIAL_ADMINS: Admin[] = [
  { id: 1, name: "Attorney General Office",    email: "attorney.general@law.gov.pk" },
  { id: 2, name: "Lead Legislative Draftsman", email: "drafting.desk@molaw.gov.pk" }
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const isBrowser = typeof window !== 'undefined';

function getStored<T>(key: string, initial: T): T {
  if (!isBrowser) return initial;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initial;
}

function setStored<T>(key: string, value: T): void {
  if (isBrowser) localStorage.setItem(key, JSON.stringify(value));
}

const MOCK_NEW_LAWS = [
  { title: "The Election Act (Amendment) Bill, 2026",                               category: "Bill" as const,      sourceId: 1 },
  { title: "The Supreme Court Practice and Procedure (Second Amendment) Act, 2026", category: "Act" as const,       sourceId: 3 },
  { title: "The Punjab Healthcare Commission (Amendment) Act, 2026",                category: "Act" as const,       sourceId: 4 },
  { title: "The Sindh Higher Education Commission (Amendment) Act, 2026",           category: "Act" as const,       sourceId: 5 },
  { title: "The National Counter Terrorism Authority (Amendment) Bill, 2026",       category: "Bill" as const,      sourceId: 2 },
  { title: "The Anti-Hoarding and Price Control Ordinance, 2026",                   category: "Ordinance" as const, sourceId: 3 }
];

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem("pla_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const apiClient = {

  // ─── Auth ──────────────────────────────────────────────────────────────────

  login: async (username: string, password: string): Promise<{ token: string; username: string }> => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      if (isBrowser) {
        localStorage.setItem("pla_token", data.token);
        localStorage.setItem("pla_username", data.username);
      }
      return data;
    }
    const err = await res.json();
    throw new Error(err.detail || "Authentication failed.");
  },

  logout: async (): Promise<void> => {
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers
      });
    } catch (e) {
      console.warn("Logout request failed", e);
    } finally {
      if (isBrowser) {
        localStorage.removeItem("pla_token");
        localStorage.removeItem("pla_username");
      }
    }
  },

  verifySession: async (): Promise<boolean> => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) return false;
      const res = await fetch(`${API_URL}/api/auth/verify`, { headers });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_URL}/api/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    });
    if (res.ok) {
      const data = await res.json();
      if (isBrowser) {
        localStorage.removeItem("pla_token");
        localStorage.removeItem("pla_username");
      }
      return data;
    }
    const err = await res.json();
    throw new Error(err.detail || "Failed to change password.");
  },

  // ─── Sources ────────────────────────────────────────────────────────────────

  getSources: async (): Promise<Source[]> => {
    try {
      const res = await fetch(`${API_URL}/api/sources`);
      if (res.ok) return await res.json();
    } catch (e) { console.warn("Backend unavailable, using local sources.", e); }
    return getStored('pla_sources', INITIAL_SOURCES);
  },

  addSource: async (payload: { name: string; url: string; scraper_type?: string }): Promise<Source> => {
    try {
      const res = await fetch(`${API_URL}/api/admin/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ scraper_type: "generic", is_active: true, ...payload })
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.detail || "Failed to add source");
    } catch (e) { console.warn("Backend unavailable, saving locally.", e); }

    const list = getStored<Source[]>('pla_sources', INITIAL_SOURCES);
    const id = list.length > 0 ? Math.max(...list.map(s => s.id)) + 1 : 1;
    const newSrc: Source = { id, name: payload.name, url: payload.url, scraper_type: payload.scraper_type || "generic", is_active: true };
    list.push(newSrc);
    setStored('pla_sources', list);
    return newSrc;
  },

  toggleSource: async (id: number): Promise<Source> => {
    try {
      const res = await fetch(`${API_URL}/api/admin/sources/${id}/toggle`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) { console.warn("Backend unavailable, toggling locally.", e); }

    const list = getStored<Source[]>('pla_sources', INITIAL_SOURCES);
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) list[idx].is_active = !list[idx].is_active;
    setStored('pla_sources', list);
    return list[idx];
  },

  deleteSource: async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/admin/sources/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) return true;
    } catch (e) { console.warn("Backend unavailable, deleting locally.", e); }

    let list = getStored<Source[]>('pla_sources', INITIAL_SOURCES);
    const before = list.length;
    list = list.filter(s => s.id !== id);
    setStored('pla_sources', list);
    return list.length < before;
  },

  // ─── Updates ─────────────────────────────────────────────────────────────────

  getUpdates: async (
    search = "", category = "", sourceId?: number,
    dateFrom?: string, dateTo?: string,
    page = 1, limit = 50
  ): Promise<UpdatesResponse> => {
    try {
      const params = new URLSearchParams();
      if (search)    params.append("search", search);
      if (category)  params.append("category", category);
      if (sourceId)  params.append("source_id", sourceId.toString());
      if (dateFrom)  params.append("date_from", dateFrom);
      if (dateTo)    params.append("date_to", dateTo);
      params.append("page",  page.toString());
      params.append("limit", limit.toString());

      const res = await fetch(`${API_URL}/api/updates?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) { console.warn("Backend unavailable, using local updates.", e); }

    // Local mock filtering (returns same shape)
    let list = getStored<LawUpdate[]>('pla_updates', INITIAL_UPDATES);
    list.sort((a, b) => new Date(b.date_found).getTime() - new Date(a.date_found).getTime());
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(i => i.title.toLowerCase().includes(q)); }
    if (category)      list = list.filter(i => i.category === category);
    if (sourceId)      list = list.filter(i => i.source_id === sourceId);
    if (dateFrom)      list = list.filter(i => i.date_found >= dateFrom);
    if (dateTo)        list = list.filter(i => i.date_found.slice(0, 10) <= dateTo);

    const total = list.length;
    const offset = (page - 1) * limit;
    return { total, page, limit, pages: Math.ceil(total / limit) || 1, results: list.slice(offset, offset + limit) };
  },

  // ─── Admins ──────────────────────────────────────────────────────────────────

  getAdmins: async (): Promise<Admin[]> => {
    try {
      const res = await fetch(`${API_URL}/api/admin/receivers`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) { console.warn("Backend unavailable, using local admins.", e); }
    return getStored('pla_admins', INITIAL_ADMINS);
  },

  addAdmin: async (email: string, name = "Admin Officer"): Promise<Admin> => {
    try {
      const res = await fetch(`${API_URL}/api/admin/receivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ email, name })
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.detail || "Failed to create admin");
    } catch (e) { console.warn("Backend unavailable, saving locally.", e); }

    const list = getStored<Admin[]>('pla_admins', INITIAL_ADMINS);
    const id = list.length > 0 ? Math.max(...list.map(a => a.id)) + 1 : 1;
    const newAdmin = { id, name, email };
    list.push(newAdmin);
    setStored('pla_admins', list);
    return newAdmin;
  },

  removeAdmin: async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/admin/receivers/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) return true;
    } catch (e) { console.warn("Backend unavailable, removing locally.", e); }

    let list = getStored<Admin[]>('pla_admins', INITIAL_ADMINS);
    const before = list.length;
    list = list.filter(a => a.id !== id);
    setStored('pla_admins', list);
    return list.length < before;
  },

  // ─── Crawler ─────────────────────────────────────────────────────────────────

  triggerManualCrawl: async (untilDate?: string): Promise<{ success: boolean; sourcesScraped: number; newUpdates: string[]; until_date?: string }> => {
    try {
      const params = new URLSearchParams({ fallback: 'False' });
      if (untilDate) params.append('until_date', untilDate);
      const res = await fetch(`${API_URL}/api/admin/scrape?${params.toString()}`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      if (res.ok) return await res.json();
    } catch (e) { console.warn("Backend unavailable, simulating crawl locally.", e); }

    const sources  = getStored<Source[]>('pla_sources', INITIAL_SOURCES);
    const updates  = getStored<LawUpdate[]>('pla_updates', INITIAL_UPDATES);
    const nowStr   = new Date().toISOString();
    setStored('pla_sources', sources.map(s => ({ ...s, last_crawled: nowStr })));

    // Apply same year-filter heuristic in mock mode
    const cutoffYear = untilDate ? new Date(untilDate).getFullYear() : null;

    const newUpdatesList: string[] = [];
    const numNew = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numNew; i++) {
      const rawMock = MOCK_NEW_LAWS[Math.floor(Math.random() * MOCK_NEW_LAWS.length)];
      // Skip if title year is before cutoff
      if (cutoffYear) {
        const yearMatch = rawMock.title.match(/\b(20\d{2})\b/);
        if (yearMatch && parseInt(yearMatch[1]) < cutoffYear) continue;
      }
      const sourceObj = sources.find(s => s.id === rawMock.sourceId) || sources[0];
      if (!updates.some(u => u.title === rawMock.title)) {
        const id = updates.length > 0 ? Math.max(...updates.map(u => u.id)) + 1 : 1;
        updates.push({ id, source_id: rawMock.sourceId, source_name: sourceObj.name, title: rawMock.title,
          url: `${sourceObj.url}/latest`, pdf_url: `${sourceObj.url}/downloads/file-${id}.pdf`,
          category: rawMock.category, date_found: nowStr, is_notified: false });
        newUpdatesList.push(rawMock.title);
      }
    }
    if (newUpdatesList.length > 0) setStored('pla_updates', updates);
    return { success: true, sourcesScraped: sources.filter(s => s.is_active).length, newUpdates: newUpdatesList, until_date: untilDate };
  }
};
