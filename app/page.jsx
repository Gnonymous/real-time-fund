'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FundChart from './components/FundChart';

function PlusIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6l1-2h6l1 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M19.4 15a7.97 7.97 0 0 0 .1-2l2-1.5-2-3.5-2.3.5a8.02 8.02 0 0 0-1.7-1l-.4-2.3h-4l-.4 2.3a8.02 8.02 0 0 0-1.7 1l-2.3-.5-2 3.5 2 1.5a7.97 7.97 0 0 0 .1 2l-2 1.5 2 3.5 2.3-.5a8.02 8.02 0 0 0 1.7 1l.4 2.3h4l.4-2.3a8.02 8.02 0 0 0 1.7-1l2.3.5 2-3.5-2-1.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M4 12a8 8 0 0 1 12.5-6.9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 5h3v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 0 1-12.5 6.9" stroke="currentColor" strokeWidth="2" />
      <path d="M8 19H5v-3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ChevronIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SortIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M3 7h18M6 12h12M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ListIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ filled, ...props }) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "var(--accent)" : "none"}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stat({ label, value, delta }) {
  const dir = delta > 0 ? 'up' : delta < 0 ? 'down' : '';
  return (
    <div className="stat">
      <span className="label">{label}</span>
      <span className={`value ${dir}`}>{value}</span>
    </div>
  );
}

const TREND_KEY_PREFIX = 'fundTrendData:';
const TREND_MAX_POINTS = 300;
const LISTS_KEY = 'fundLists';
const LIST_MAP_KEY = 'fundListMap';
const DEFAULT_LISTS = [
  { id: 'watch', name: '自选' },
  { id: 'holding', name: '持有' }
];

function parseGzTime(gztime) {
  if (!gztime || typeof gztime !== 'string') return null;
  const parts = gztime.trim().split(' ');
  if (parts.length < 2) return null;
  const date = parts[0];
  const time = parts[1].slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!/^\d{2}:\d{2}$/.test(time)) return null;
  return { date, time };
}

function toMinutes(timeStr) {
  if (!timeStr) return null;
  const [hStr, mStr] = timeStr.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function isTradingTime(timeStr) {
  const minutes = toMinutes(timeStr);
  if (minutes === null) return false;
  const morningStart = 9 * 60 + 30;
  const morningEnd = 11 * 60 + 30;
  const afternoonStart = 13 * 60;
  const afternoonEnd = 15 * 60;
  return (minutes >= morningStart && minutes <= morningEnd) ||
    (minutes >= afternoonStart && minutes <= afternoonEnd);
}

function saveTrendPoint(code, pct, gztime) {
  if (typeof window === 'undefined' || !code) return;
  const pctNum = Number(pct);
  if (!Number.isFinite(pctNum)) return;

  const parsed = parseGzTime(gztime);
  let dateStr = parsed?.date;
  let timeStr = parsed?.time;

  if (!dateStr || !timeStr) {
    const now = new Date();
    dateStr = now.toISOString().slice(0, 10);
    timeStr = now.toTimeString().slice(0, 5);
  }

  if (!isTradingTime(timeStr)) return;

  const key = `${TREND_KEY_PREFIX}${code}`;
  let data;
  try {
    data = JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    data = {};
  }

  if (!data || data.date !== dateStr || !Array.isArray(data.points)) {
    data = { date: dateStr, points: [] };
  }

  const points = data.points;
  const last = points[points.length - 1];
  if (last && last.time === timeStr) {
    last.pct = pctNum;
  } else {
    points.push({ time: timeStr, pct: pctNum });
  }

  if (points.length > TREND_MAX_POINTS) {
    data.points = points.slice(points.length - TREND_MAX_POINTS);
  }

  localStorage.setItem(key, JSON.stringify(data));
}

function getFundPctValue(fund) {
  if (!fund) return null;
  if (fund.estPricedCoverage > 0.05 && Number.isFinite(fund.estGszzl)) {
    return fund.estGszzl;
  }
  const raw = typeof fund.gszzl === 'number' ? fund.gszzl : Number(fund.gszzl);
  return Number.isFinite(raw) ? raw : null;
}

function mergeDefaultLists(saved) {
  const map = new Map();
  DEFAULT_LISTS.forEach((item) => map.set(item.id, item));
  if (Array.isArray(saved)) {
    saved.forEach((item) => {
      if (!item || !item.id || !item.name) return;
      map.set(item.id, { id: item.id, name: item.name });
    });
  }
  return Array.from(map.values());
}

function sanitizeListName(name) {
  return name.replace(/\s+/g, ' ').trim();
}

export default function HomePage() {
  const [funds, setFunds] = useState([]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const refreshingRef = useRef(false);

  // 刷新频率状态
  const [refreshMs, setRefreshMs] = useState(30000);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSeconds, setTempSeconds] = useState(30);

  // 全局刷新状态
  const [refreshing, setRefreshing] = useState(false);

  // 收起/展开状态
  const [collapsedCodes, setCollapsedCodes] = useState(new Set());

  // 列表与持仓状态
  const [lists, setLists] = useState(DEFAULT_LISTS);
  const [activeListId, setActiveListId] = useState('all');
  const [fundListMap, setFundListMap] = useState({});
  const [listModalOpen, setListModalOpen] = useState(false);
  const [listModalCode, setListModalCode] = useState('');
  const [listModalSelected, setListModalSelected] = useState(new Set());
  const [listModalHoldingAmount, setListModalHoldingAmount] = useState('');
  const [listModalNewName, setListModalNewName] = useState('');
  const [listModalError, setListModalError] = useState('');

  // 排序状态
  const [sortBy, setSortBy] = useState('default'); // default, name, yield, code

  // 视图模式
  const [viewMode, setViewMode] = useState('card'); // card, list

  const persistLists = (nextLists) => {
    setLists(nextLists);
    localStorage.setItem(LISTS_KEY, JSON.stringify(nextLists));
  };

  const persistFundListMap = (nextMap) => {
    setFundListMap(nextMap);
    localStorage.setItem(LIST_MAP_KEY, JSON.stringify(nextMap));
  };

  const isInList = (code, listId) => {
    const entry = fundListMap?.[code];
    return Array.isArray(entry?.lists) && entry.lists.includes(listId);
  };

  const getHoldingAmount = (code) => {
    const entry = fundListMap?.[code];
    const val = entry?.holdingAmount;
    const num = typeof val === 'number' ? val : Number(val);
    return Number.isFinite(num) ? num : null;
  };

  const openListModal = (code) => {
    const entry = fundListMap?.[code];
    const current = Array.isArray(entry?.lists) ? entry.lists : [];
    setListModalSelected(new Set(current));
    setListModalHoldingAmount(entry?.holdingAmount ? String(entry.holdingAmount) : '');
    setListModalCode(code);
    setListModalError('');
    setListModalOpen(true);
  };

  const closeListModal = () => {
    setListModalOpen(false);
    setListModalCode('');
    setListModalSelected(new Set());
    setListModalHoldingAmount('');
    setListModalNewName('');
    setListModalError('');
  };

  const toggleListSelection = (listId) => {
    setListModalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  };

  const createList = () => {
    const name = sanitizeListName(listModalNewName);
    if (!name) {
      setListModalError('请输入列表名称');
      return;
    }
    if (lists.some((l) => l.name === name)) {
      setListModalError('列表名称已存在');
      return;
    }
    const id = `list_${Date.now()}`;
    const nextLists = [...lists, { id, name }];
    persistLists(nextLists);
    setListModalNewName('');
    setListModalError('');
  };

  const saveListSelection = () => {
    if (!listModalCode) return;
    const selected = Array.from(listModalSelected);
    if (selected.includes('holding')) {
      const amountNum = Number(listModalHoldingAmount);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        setListModalError('请填写持仓金额');
        return;
      }
    }

    const nextMap = { ...fundListMap };
    if (selected.length === 0) {
      delete nextMap[listModalCode];
      persistFundListMap(nextMap);
      closeListModal();
      return;
    }
    const nextEntry = { lists: selected };
    if (selected.includes('holding')) {
      nextEntry.holdingAmount = Number(listModalHoldingAmount);
    }
    nextMap[listModalCode] = nextEntry;
    persistFundListMap(nextMap);
    closeListModal();
  };

  const toggleCollapse = (code) => {
    setCollapsedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      // 同步到本地存储
      localStorage.setItem('collapsedCodes', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // 按 code 去重，保留第一次出现的项，避免列表重复
  const dedupeByCode = (list) => {
    const seen = new Set();
    return list.filter((f) => {
      const c = f?.code;
      if (!c || seen.has(c)) return false;
      seen.add(c);
      return true;
    });
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('funds') || '[]');
      if (Array.isArray(saved) && saved.length) {
        const deduped = dedupeByCode(saved);
        setFunds(deduped);
        localStorage.setItem('funds', JSON.stringify(deduped));
        const codes = Array.from(new Set(deduped.map((f) => f.code)));
        if (codes.length) refreshAll(codes);
      }
      const savedMs = parseInt(localStorage.getItem('refreshMs') || '30000', 10);
      if (Number.isFinite(savedMs) && savedMs >= 5000) {
        setRefreshMs(savedMs);
        setTempSeconds(Math.round(savedMs / 1000));
      }
      // 加载收起状态
      const savedCollapsed = JSON.parse(localStorage.getItem('collapsedCodes') || '[]');
      if (Array.isArray(savedCollapsed)) {
        setCollapsedCodes(new Set(savedCollapsed));
      }
      // 加载列表与持仓
      const savedLists = JSON.parse(localStorage.getItem(LISTS_KEY) || '[]');
      const nextLists = mergeDefaultLists(savedLists);
      setLists(nextLists);
      localStorage.setItem(LISTS_KEY, JSON.stringify(nextLists));

      let nextMap = {};
      try {
        nextMap = JSON.parse(localStorage.getItem(LIST_MAP_KEY) || '{}') || {};
      } catch {
        nextMap = {};
      }

      // 迁移旧的自选数据到列表
      const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (Array.isArray(savedFavorites) && savedFavorites.length) {
        savedFavorites.forEach((code) => {
          if (!code) return;
          const entry = nextMap[code] || { lists: [] };
          if (!entry.lists.includes('watch')) entry.lists.push('watch');
          nextMap[code] = entry;
        });
      }
      setFundListMap(nextMap);
      localStorage.setItem(LIST_MAP_KEY, JSON.stringify(nextMap));
      // 加载视图模式
      const savedViewMode = localStorage.getItem('viewMode');
      if (savedViewMode === 'card' || savedViewMode === 'list') {
        setViewMode(savedViewMode);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const codes = Array.from(new Set(funds.map((f) => f.code)));
      if (codes.length) refreshAll(codes);
    }, refreshMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [funds, refreshMs]);

  // --- 辅助：JSONP 数据抓取逻辑 ---
  const loadScript = (url) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => {
        document.body.removeChild(script);
        resolve();
      };
      script.onerror = () => {
        document.body.removeChild(script);
        reject(new Error('数据加载失败'));
      };
      document.body.appendChild(script);
    });
  };

  const fetchFundData = async (c) => {
    return new Promise(async (resolve, reject) => {
      // 腾讯接口识别逻辑优化
      const getTencentPrefix = (code) => {
        if (code.startsWith('6') || code.startsWith('9')) return 'sh';
        if (code.startsWith('0') || code.startsWith('3')) return 'sz';
        if (code.startsWith('4') || code.startsWith('8')) return 'bj';
        return 'sz';
      };

      const gzUrl = `https://fundgz.1234567.com.cn/js/${c}.js?rt=${Date.now()}`;

      // 使用更安全的方式处理全局回调，避免并发覆盖
      const currentCallback = `jsonpgz_${c}_${Math.random().toString(36).slice(2, 7)}`;

      // 动态拦截并处理 jsonpgz 回调
      const scriptGz = document.createElement('script');
      // 东方财富接口固定调用 jsonpgz，我们通过修改全局变量临时捕获它
      scriptGz.src = gzUrl;

      const originalJsonpgz = window.jsonpgz;
      window.jsonpgz = (json) => {
        window.jsonpgz = originalJsonpgz; // 立即恢复
        if (!json || typeof json !== 'object') {
          reject(new Error('未获取到基金估值数据'));
          return;
        }
        const gszzlNum = Number(json.gszzl);
        const gzData = {
          code: json.fundcode,
          name: json.name,
          dwjz: json.dwjz,
          gsz: json.gsz,
          gztime: json.gztime,
          gszzl: Number.isFinite(gszzlNum) ? gszzlNum : json.gszzl
        };

        try {
          saveTrendPoint(c, gzData.gszzl, gzData.gztime);
        } catch (e) {
          console.error('保存分时曲线失败', e);
        }

        // 获取重仓股票列表
        const holdingsUrl = `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${c}&topline=10&year=&month=&rt=${Date.now()}`;
        loadScript(holdingsUrl).then(async () => {
          let holdings = [];
          const html = window.apidata?.content || '';
          const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
          for (const r of rows) {
            const cells = (r.match(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi) || []).map(td => td.replace(/<[^>]*>/g, '').trim());
            const codeIdx = cells.findIndex(txt => /^\d{6}$/.test(txt));
            const weightIdx = cells.findIndex(txt => /\d+(?:\.\d+)?\s*%/.test(txt));
            if (codeIdx >= 0 && weightIdx >= 0) {
              holdings.push({
                code: cells[codeIdx],
                name: cells[codeIdx + 1] || '',
                weight: cells[weightIdx],
                change: null
              });
            }
          }

          holdings = holdings.slice(0, 10);

          if (holdings.length) {
            try {
              const tencentCodes = holdings.map(h => `s_${getTencentPrefix(h.code)}${h.code}`).join(',');
              const quoteUrl = `https://qt.gtimg.cn/q=${tencentCodes}`;

              await new Promise((resQuote) => {
                const scriptQuote = document.createElement('script');
                scriptQuote.src = quoteUrl;
                scriptQuote.onload = () => {
                  holdings.forEach(h => {
                    const varName = `v_s_${getTencentPrefix(h.code)}${h.code}`;
                    const dataStr = window[varName];
                    if (dataStr) {
                      const parts = dataStr.split('~');
                      // parts[5] 是涨跌幅
                      if (parts.length > 5) {
                        h.change = parseFloat(parts[5]);
                      }
                    }
                  });
                  if (document.body.contains(scriptQuote)) document.body.removeChild(scriptQuote);
                  resQuote();
                };
                scriptQuote.onerror = () => {
                  if (document.body.contains(scriptQuote)) document.body.removeChild(scriptQuote);
                  resQuote();
                };
                document.body.appendChild(scriptQuote);
              });
            } catch (e) {
              console.error('获取股票涨跌幅失败', e);
            }
          }

          resolve({ ...gzData, holdings });
        }).catch(() => resolve({ ...gzData, holdings: [] }));
      };

      scriptGz.onerror = () => {
        window.jsonpgz = originalJsonpgz;
        if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz);
        reject(new Error('基金数据加载失败'));
      };

      document.body.appendChild(scriptGz);
      // 加载完立即移除脚本
      setTimeout(() => {
        if (document.body.contains(scriptGz)) document.body.removeChild(scriptGz);
      }, 5000);
    });
  };

  const refreshAll = async (codes) => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    const uniqueCodes = Array.from(new Set(codes));
    try {
      const updated = [];
      for (const c of uniqueCodes) {
        try {
          const data = await fetchFundData(c);
          updated.push(data);
        } catch (e) {
          console.error(`刷新基金 ${c} 失败`, e);
          const old = funds.find((f) => f.code === c);
          if (old) updated.push(old);
        }
      }
      const deduped = dedupeByCode(updated);
      if (deduped.length) {
        setFunds(deduped);
        localStorage.setItem('funds', JSON.stringify(deduped));
      }
    } catch (e) {
      console.error(e);
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  };

  const toggleViewMode = () => {
    const nextMode = viewMode === 'card' ? 'list' : 'card';
    setViewMode(nextMode);
    localStorage.setItem('viewMode', nextMode);
  };

  const addFund = async (e) => {
    e.preventDefault();
    setError('');
    const clean = code.trim();
    if (!clean) {
      setError('请输入基金编号');
      return;
    }
    if (funds.some((f) => f.code === clean)) {
      setError('该基金已添加');
      return;
    }
    setLoading(true);
    try {
      const data = await fetchFundData(clean);
      const next = [data, ...funds];
      setFunds(next);
      localStorage.setItem('funds', JSON.stringify(next));
      setCode('');
    } catch (e) {
      setError(e.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  const removeFund = (removeCode) => {
    const next = funds.filter((f) => f.code !== removeCode);
    setFunds(next);
    localStorage.setItem('funds', JSON.stringify(next));

    // 同步删除展开收起状态
    setCollapsedCodes(prev => {
      if (!prev.has(removeCode)) return prev;
      const nextSet = new Set(prev);
      nextSet.delete(removeCode);
      localStorage.setItem('collapsedCodes', JSON.stringify(Array.from(nextSet)));
      return nextSet;
    });

    // 同步删除列表与持仓状态
    setFundListMap(prev => {
      if (!prev?.[removeCode]) return prev;
      const nextMap = { ...prev };
      delete nextMap[removeCode];
      localStorage.setItem(LIST_MAP_KEY, JSON.stringify(nextMap));
      return nextMap;
    });
  };

  const manualRefresh = async () => {
    if (refreshingRef.current) return;
    const codes = Array.from(new Set(funds.map((f) => f.code)));
    if (!codes.length) return;
    await refreshAll(codes);
  };

  const formatMoney = (value) => {
    if (!Number.isFinite(value)) return '--';
    return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getHoldingInfo = (fund) => {
    const amount = getHoldingAmount(fund.code);
    const pct = getFundPctValue(fund);
    const pnl = Number.isFinite(amount) && Number.isFinite(pct) ? amount * (pct / 100) : null;
    return { amount, pnl };
  };

  const saveSettings = (e) => {
    e?.preventDefault?.();
    const ms = Math.max(5, Number(tempSeconds)) * 1000;
    setRefreshMs(ms);
    localStorage.setItem('refreshMs', String(ms));
    setSettingsOpen(false);
  };

  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key !== 'Escape') return;
      if (settingsOpen) setSettingsOpen(false);
      if (listModalOpen) closeListModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settingsOpen, listModalOpen]);

  const listModalFund = listModalCode ? funds.find((f) => f.code === listModalCode) : null;

  return (
    <div className="container content">
      <div className="navbar glass">
        {refreshing && <div className="loading-bar"></div>}
        <div className="brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2" />
            <path d="M5 14c2-4 7-6 14-5" stroke="var(--primary)" strokeWidth="2" />
          </svg>
          <span>实时基金估值</span>
        </div>
        <div className="actions">
          <div className="badge" title="当前刷新频率">
            <span>刷新</span>
            <strong>{Math.round(refreshMs / 1000)}秒</strong>
          </div>
          <button
            className="icon-button"
            aria-label="立即刷新"
            onClick={manualRefresh}
            disabled={refreshing || funds.length === 0}
            aria-busy={refreshing}
            title="立即刷新"
          >
            <RefreshIcon className={refreshing ? 'spin' : ''} width="18" height="18" />
          </button>
          <button
            className="icon-button"
            aria-label="打开设置"
            onClick={() => setSettingsOpen(true)}
            title="设置"
          >
            <SettingsIcon width="18" height="18" />
          </button>
        </div>
      </div>

      <div className="grid">
        <div className="col-12 glass card add-fund-section" role="region" aria-label="添加基金">
          <div className="title" style={{ marginBottom: 12 }}>
            <PlusIcon width="20" height="20" />
            <span>添加基金</span>
            <span className="muted">输入基金编号（例如：110022）</span>
          </div>
          <form className="form" onSubmit={addFund}>
            <input
              className="input"
              placeholder="基金编号"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
            />
            <button className="button" type="submit" disabled={loading}>
              {loading ? '添加中…' : '添加'}
            </button>
          </form>
          {error && <div className="muted" style={{ marginTop: 8, color: 'var(--danger)' }}>{error}</div>}
        </div>

        <div className="col-12">
          {funds.length > 0 && (
            <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div className="tabs">
                <button
                  className={`tab ${activeListId === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveListId('all')}
                >
                  全部 ({funds.length})
                </button>
                {lists.map((list) => {
                  const count = funds.filter((f) => isInList(f.code, list.id)).length;
                  return (
                    <button
                      key={list.id}
                      className={`tab ${activeListId === list.id ? 'active' : ''}`}
                      onClick={() => setActiveListId(list.id)}
                    >
                      {list.name} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="sort-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="view-toggle" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' }}>
                  <button
                    className={`icon-button ${viewMode === 'card' ? 'active' : ''}`}
                    onClick={() => { setViewMode('card'); localStorage.setItem('viewMode', 'card'); }}
                    style={{ border: 'none', width: '32px', height: '32px', background: viewMode === 'card' ? 'var(--primary)' : 'transparent', color: viewMode === 'card' ? '#05263b' : 'var(--muted)' }}
                    title="卡片视图"
                  >
                    <GridIcon width="16" height="16" />
                  </button>
                  <button
                      className={`icon-button ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => { setViewMode('list'); localStorage.setItem('viewMode', 'list'); }}
                      style={{ border: 'none', width: '32px', height: '32px', background: viewMode === 'list' ? 'var(--primary)' : 'transparent', color: viewMode === 'list' ? '#05263b' : 'var(--muted)' }}
                      title="表格视图"
                    >
                      <ListIcon width="16" height="16" />
                    </button>
                </div>

                <div className="divider" style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

                <div className="sort-items" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="muted" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <SortIcon width="14" height="14" />
                    排序
                  </span>
                  <div className="chips">
                    {[
                      { id: 'default', label: '默认' },
                      { id: 'yield', label: '涨跌幅' },
                      { id: 'name', label: '名称' },
                      { id: 'code', label: '代码' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        className={`chip ${sortBy === s.id ? 'active' : ''}`}
                        onClick={() => setSortBy(s.id)}
                        style={{ height: '28px', fontSize: '12px', padding: '0 10px' }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {funds.length === 0 ? (
            <div className="glass card empty">尚未添加基金</div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={viewMode === 'card' ? 'grid' : 'table-container glass'}
              >
                <div className={viewMode === 'card' ? 'grid col-12' : ''} style={viewMode === 'card' ? { gridColumn: 'span 12', gap: 16 } : {}}>
                  <AnimatePresence mode="popLayout">
                    {funds
                      .filter(f => activeListId === 'all' || isInList(f.code, activeListId))
                      .sort((a, b) => {
                        if (sortBy === 'yield') {
                          const valA = typeof a.estGszzl === 'number' ? a.estGszzl : (Number(a.gszzl) || 0);
                          const valB = typeof b.estGszzl === 'number' ? b.estGszzl : (Number(b.gszzl) || 0);
                          return valB - valA;
                        }
                        if (sortBy === 'name') return a.name.localeCompare(b.name, 'zh-CN');
                        if (sortBy === 'code') return a.code.localeCompare(b.code);
                        return 0; // default order is the order in the array
                      })
                      .map((f) => {
                        const holdingInfo = getHoldingInfo(f);
                        const inHolding = isInList(f.code, 'holding');
                        const showHolding = activeListId === 'holding' && inHolding;
                        return (
                      <motion.div
                        layout="position"
                        key={f.code}
                        className={viewMode === 'card' ? 'col-6' : 'table-row-wrapper'}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                      <div className={viewMode === 'card' ? 'glass card' : 'table-row'}>
                        {viewMode === 'list' ? (
                          <>
                            <div className="table-cell name-cell">
                              <button
                                className={`icon-button fav-button ${isInList(f.code, 'watch') ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openListModal(f.code);
                                }}
                                title="加入列表"
                              >
                                <StarIcon width="18" height="18" filled={isInList(f.code, 'watch')} />
                              </button>
                              <div className="title-text">
                                <span className="name-text">{f.name}</span>
                                <span className="muted code-text">#{f.code}</span>
                                {showHolding && (
                                  <div className="holding-inline">
                                    <span>持仓 {formatMoney(holdingInfo.amount)}</span>
                                    <span className={Number.isFinite(holdingInfo.pnl) ? (holdingInfo.pnl >= 0 ? 'up' : 'down') : 'muted'}>
                                      收益 {formatMoney(holdingInfo.pnl)}
                                    </span>
                                    <button
                                      className="link-button"
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openListModal(f.code);
                                      }}
                                    >
                                      修改金额
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="table-cell text-right value-cell">
                              <span style={{ fontWeight: 700 }}>{f.estPricedCoverage > 0.05 ? f.estGsz.toFixed(4) : (f.gsz ?? '—')}</span>
                            </div>
                            <div className="table-cell text-right change-cell">
                              <span className={f.estPricedCoverage > 0.05 ? (f.estGszzl > 0 ? 'up' : f.estGszzl < 0 ? 'down' : '') : (Number(f.gszzl) > 0 ? 'up' : Number(f.gszzl) < 0 ? 'down' : '')} style={{ fontWeight: 700 }}>
                                {f.estPricedCoverage > 0.05 ? `${f.estGszzl > 0 ? '+' : ''}${f.estGszzl.toFixed(2)}%` : (typeof f.gszzl === 'number' ? `${f.gszzl > 0 ? '+' : ''}${f.gszzl.toFixed(2)}%` : f.gszzl ?? '—')}
                              </span>
                            </div>
                            <div className="table-cell text-right time-cell">
                              <span className="muted" style={{ fontSize: '12px' }}>{f.gztime || f.time || '-'}</span>
                            </div>
                            <div className="table-cell text-center action-cell">
                              <button
                                className="icon-button danger"
                                onClick={() => removeFund(f.code)}
                                title="删除"
                                style={{ width: '28px', height: '28px' }}
                              >
                                <TrashIcon width="14" height="14" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                          <div className="row" style={{ marginBottom: 10 }}>
                            <div className="title">
                              <button
                                className={`icon-button fav-button ${isInList(f.code, 'watch') ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openListModal(f.code);
                                }}
                                title="加入列表"
                              >
                                <StarIcon width="18" height="18" filled={isInList(f.code, 'watch')} />
                              </button>
                              <div className="title-text">
                                <span>{f.name}</span>
                                <span className="muted">#{f.code}</span>
                              </div>
                            </div>

                            <div className="actions">
                              <div className="badge-v">
                                <span>估值时间</span>
                                <strong>{f.gztime || f.time || '-'}</strong>
                              </div>
                              <button
                                className="icon-button danger"
                                onClick={() => removeFund(f.code)}
                                title="删除"
                              >
                                <TrashIcon width="18" height="18" />
                              </button>
                            </div>
                          </div>

                          <div className="row" style={{ marginBottom: 12 }}>
                            <Stat label="单位净值" value={f.dwjz ?? '—'} />
                            <Stat label="估值净值" value={f.estPricedCoverage > 0.05 ? f.estGsz.toFixed(4) : (f.gsz ?? '—')} />
                            <Stat
                              label="涨跌幅"
                              value={f.estPricedCoverage > 0.05 ? `${f.estGszzl > 0 ? '+' : ''}${f.estGszzl.toFixed(2)}%` : (typeof f.gszzl === 'number' ? `${f.gszzl > 0 ? '+' : ''}${f.gszzl.toFixed(2)}%` : f.gszzl ?? '—')}
                              delta={f.estPricedCoverage > 0.05 ? f.estGszzl : (Number(f.gszzl) || 0)}
                            />
                          </div>
                          {f.estPricedCoverage > 0.05 && (
                            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: -8, marginBottom: 10, textAlign: 'right' }}>
                              基于 {Math.round(f.estPricedCoverage * 100)}% 持仓估算
                            </div>
                          )}
                          {showHolding && (
                            <div className="holding-row">
                              <div className="holding-item">
                                <span className="muted">持仓金额</span>
                                <strong>{formatMoney(holdingInfo.amount)}</strong>
                              </div>
                              <div className="holding-item">
                                <span className="muted">当日收益</span>
                                <strong className={Number.isFinite(holdingInfo.pnl) ? (holdingInfo.pnl >= 0 ? 'up' : 'down') : 'muted'}>
                                  {formatMoney(holdingInfo.pnl)}
                                </strong>
                              </div>
                              <button
                                className="chip mini"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openListModal(f.code);
                                }}
                              >
                                修改金额
                              </button>
                            </div>
                          )}
                          <FundChart
                            fundCode={f.code}
                            latestTime={f.gztime || f.time || ''}
                            latestPct={getFundPctValue(f)}
                          />
                          <div
                            style={{ marginBottom: 8, cursor: 'pointer', userSelect: 'none' }}
                            className="title"
                            onClick={() => toggleCollapse(f.code)}
                          >
                            <div className="row" style={{ width: '100%', flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span>前10重仓股票</span>
                                <ChevronIcon
                                  width="16"
                                  height="16"
                                  className="muted"
                                  style={{
                                    transform: collapsedCodes.has(f.code) ? 'rotate(-90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease'
                                  }}
                                />
                              </div>
                              <span className="muted">涨跌幅 / 占比</span>
                            </div>
                          </div>
                          <AnimatePresence>
                            {!collapsedCodes.has(f.code) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                style={{ overflow: 'hidden' }}
                              >
                                {Array.isArray(f.holdings) && f.holdings.length ? (
                                  <div className="list">
                                    {f.holdings.map((h, idx) => (
                                      <div className="item" key={idx}>
                                        <span className="name">{h.name}</span>
                                        <div className="values">
                                          {typeof h.change === 'number' && (
                                            <span className={`badge ${h.change > 0 ? 'up' : h.change < 0 ? 'down' : ''}`} style={{ marginRight: 8 }}>
                                              {h.change > 0 ? '+' : ''}{h.change.toFixed(2)}%
                                            </span>
                                          )}
                                          <span className="weight">{h.weight}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="muted" style={{ padding: '8px 0' }}>暂无重仓数据</div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                      </div>
                    </motion.div>
                    );
                  })}
                </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="footer">
        <p>数据源：实时估值与重仓直连东方财富，无需后端，部署即用</p>
        <p>注：估算数据与真实结算数据会有1%左右误差</p>
      </div>

      {listModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="加入列表" onClick={closeListModal}>
          <div className="glass card modal" onClick={(e) => e.stopPropagation()}>
            <div className="title" style={{ marginBottom: 12 }}>
              <StarIcon width="20" height="20" filled />
              <span>加入列表</span>
              <span className="muted">{listModalFund ? `${listModalFund.name} #${listModalFund.code}` : ''}</span>
            </div>

            <div className="list-options">
              {lists.map((list) => (
                <label key={list.id} className="list-option">
                  <input
                    type="checkbox"
                    checked={listModalSelected.has(list.id)}
                    onChange={() => toggleListSelection(list.id)}
                  />
                  <span>{list.name}</span>
                </label>
              ))}
            </div>

            {listModalSelected.has('holding') && (
              <div className="form-group" style={{ marginTop: 12 }}>
                <div className="muted" style={{ marginBottom: 8, fontSize: '0.8rem' }}>持仓金额（必填）</div>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={listModalHoldingAmount}
                  onChange={(e) => setListModalHoldingAmount(e.target.value)}
                  placeholder="请输入持仓金额"
                />
              </div>
            )}

            <div className="form-group" style={{ marginTop: 12 }}>
              <div className="muted" style={{ marginBottom: 8, fontSize: '0.8rem' }}>新建列表</div>
              <div className="row" style={{ gap: 8 }}>
                <input
                  className="input"
                  value={listModalNewName}
                  onChange={(e) => setListModalNewName(e.target.value)}
                  placeholder="例如：长线 / 观察"
                />
                <button className="button button-secondary" type="button" onClick={createList}>
                  创建
                </button>
              </div>
            </div>

            {listModalError && (
              <div className="muted" style={{ marginTop: 10, color: 'var(--danger)' }}>{listModalError}</div>
            )}

            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="button" onClick={saveListSelection}>保存</button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="设置" onClick={() => setSettingsOpen(false)}>
          <div className="glass card modal" onClick={(e) => e.stopPropagation()}>
            <div className="title" style={{ marginBottom: 12 }}>
              <SettingsIcon width="20" height="20" />
              <span>设置</span>
              <span className="muted">配置刷新频率</span>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <div className="muted" style={{ marginBottom: 8, fontSize: '0.8rem' }}>刷新频率</div>
              <div className="chips" style={{ marginBottom: 12 }}>
                {[10, 30, 60, 120, 300].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`chip ${tempSeconds === s ? 'active' : ''}`}
                    onClick={() => setTempSeconds(s)}
                    aria-pressed={tempSeconds === s}
                  >
                    {s} 秒
                  </button>
                ))}
              </div>
              <input
                className="input"
                type="number"
                min="5"
                step="5"
                value={tempSeconds}
                onChange={(e) => setTempSeconds(Number(e.target.value))}
                placeholder="自定义秒数"
              />
            </div>

            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="button" onClick={saveSettings}>保存并关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
