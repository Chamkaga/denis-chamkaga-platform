import React, { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Plus,
  RefreshCw,
  FileText,
  Trash2,
  Edit,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { api } from '../../services/api';

interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  summary?: string;
  content: string;
  tags: string[];
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  versions?: Array<{ id: string; version: number; changeSummary?: string; createdAt: string }>;
}

export const KnowledgeCmsPage: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [reindexing, setReindexing] = useState(false);

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Architecture',
    summary: '',
    content: '',
    tags: '',
  });

  const categories = ['Architecture', 'API Specification', 'Brand Voice', 'CRM Operations', 'Standard Operating Procedures'];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/knowledge');
      setItems(res.data.data);
    } catch (err) {
      console.error('Failed to fetch knowledge items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.get(`/knowledge/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.data);
    } catch (err) {
      console.error('Hybrid search error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      await api.post('/knowledge/reindex');
      await fetchItems();
      alert('Knowledge base successfully re-indexed!');
    } catch (err) {
      alert('Failed to re-index knowledge base.');
    } finally {
      setReindexing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        summary: formData.summary,
        content: formData.content,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (selectedItem) {
        await api.put(`/knowledge/${selectedItem.id}`, payload);
      } else {
        await api.post('/knowledge', payload);
      }

      setShowCreateModal(false);
      setSelectedItem(null);
      setFormData({ title: '', category: 'Architecture', summary: '', content: '', tags: '' });
      fetchItems();
    } catch (err) {
      alert('Failed to save knowledge item.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge item?')) return;
    try {
      await api.delete(`/knowledge/${id}`);
      fetchItems();
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  return (
    <div className="p-6 space-y-6 font-body text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white light:text-slate-900 font-display flex items-center gap-2">
            <Brain className="text-accent-violet" size={28} /> Knowledge Platform CMS (RAG Engine)
          </h1>
          <p className="text-xs dark:text-zinc-400 light:text-slate-500">
            Manage enterprise documentation, chunking, hybrid vector search, and AI context assembly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReindex}
            disabled={reindexing}
            leftIcon={<RefreshCw size={14} className={reindexing ? 'animate-spin' : ''} />}
          >
            {reindexing ? 'Re-indexing...' : 'Re-index RAG Vector Engine'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedItem(null);
              setFormData({ title: '', category: 'Architecture', summary: '', content: '', tags: '' });
              setShowCreateModal(true);
            }}
            leftIcon={<Plus size={14} />}
          >
            New Document
          </Button>
        </div>
      </div>

      {/* Hybrid Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-3 text-zinc-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Test RAG Hybrid Search (semantic similarity + keyword matching)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border dark:border-zinc-800 dark:bg-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
          />
        </div>
        <Button type="submit" variant="primary" disabled={isSearching} leftIcon={<Sparkles size={16} />}>
          {isSearching ? 'Searching...' : 'Hybrid Search'}
        </Button>
        {searchResults && (
          <Button variant="outline" onClick={() => setSearchResults(null)}>
            Clear Results
          </Button>
        )}
      </form>

      {/* Hybrid Search Results Overlay if Active */}
      {searchResults && (
        <div className="p-4 rounded-xl border dark:border-zinc-800 bg-accent-violet/5 space-y-3">
          <h3 className="text-sm font-bold dark:text-white flex items-center gap-2">
            <Sparkles size={16} className="text-accent-violet" /> RAG Hybrid Search Results ({searchResults.length} ranked chunks)
          </h3>
          <div className="space-y-2">
            {searchResults.map((res, i) => (
              <div key={i} className="p-3 rounded-lg border dark:border-zinc-800/80 bg-zinc-900/60 text-xs space-y-1">
                <div className="flex justify-between font-semibold text-accent-violet">
                  <span>{res.title} [{res.category}]</span>
                  <span>Relevance Score: {(res.score * 100).toFixed(1)}%</span>
                </div>
                <p className="dark:text-zinc-300 italic">"{res.chunkText}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repository Items Table */}
      <div className="rounded-xl border dark:border-zinc-800 overflow-hidden glass-panel">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900/50 uppercase dark:text-zinc-400 font-semibold border-b dark:border-zinc-800">
            <tr>
              <th className="p-3">Title & Category</th>
              <th className="p-3">Version</th>
              <th className="p-3">Tags</th>
              <th className="p-3">Last Updated</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800/60 dark:text-zinc-300">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500">
                  Loading knowledge base repository...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500">
                  No knowledge base documents found. Create your first document to seed the RAG engine.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3 space-y-1">
                    <div className="font-semibold dark:text-white flex items-center gap-1.5">
                      <FileText size={14} className="text-accent-violet" /> {item.title}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{item.category}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                      v{item.version}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((t, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-accent-violet/10 text-accent-violet text-[10px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-zinc-400">{new Date(item.updatedAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setFormData({
                          title: item.title,
                          category: item.category,
                          summary: item.summary || '',
                          content: item.content,
                          tags: item.tags.join(', '),
                        });
                        setShowCreateModal(true);
                      }}
                      className="p-1.5 hover:text-accent-violet transition-colors"
                      title="Edit Document"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 hover:text-red-400 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-2xl w-full p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4 text-left">
            <h2 className="text-xl font-bold dark:text-white font-display">
              {selectedItem ? `Edit Document (v${selectedItem.version + 1})` : 'New Knowledge Document'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold dark:text-zinc-300">Document Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    placeholder="e.g., Enterprise Architecture Baseline"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold dark:text-zinc-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-semibold dark:text-zinc-300">Summary (Optional)</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="High-level overview of this knowledge item"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold dark:text-zinc-300">Document Content (Markdown supported)</label>
                <textarea
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white font-mono"
                  placeholder="Enter content text to be indexed into RAG chunks..."
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold dark:text-zinc-300">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  placeholder="rag, architecture, baseline"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {selectedItem ? 'Save & Re-index' : 'Create & Index'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default KnowledgeCmsPage;
