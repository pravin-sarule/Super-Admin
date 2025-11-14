import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Bot, Database, Filter, RefreshCw, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const MySwal = withReactContent(Swal);

const decodeToken = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const LLMManagement = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [llmModels, setLlmModels] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [selectedLlmId, setSelectedLlmId] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const LLM_API_URL = `${API_BASE_URL}/llm`;
  const CUSTOM_QUERY_API_URL = `${API_BASE_URL}/custom-query`;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      MySwal.fire({
        icon: 'warning',
        title: 'Authentication Required',
        text: 'Please login to access this page.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      MySwal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'Invalid token. Please login again.',
        confirmButtonColor: '#dc2626',
      }).then(() => {
        localStorage.removeItem('token');
      });
      return;
    }

    setUserInfo({
      name: decoded.name || decoded.username,
      role: decoded.role || decoded.userRole,
      email: decoded.email,
    });
  }, []);

  useEffect(() => {
    if (!userInfo) return;
    const fetchData = async () => {
      await Promise.all([fetchLlmModels(), fetchCurrentSelection()]);
      setLoading(false);
    };
    fetchData();
  }, [userInfo]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchLlmModels = async () => {
    try {
      const response = await axios.get(LLM_API_URL, {
        headers: getAuthHeaders(),
      });
      setLlmModels(response.data || []);
    } catch (error) {
      console.error('Error fetching LLM models:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Unable to load models',
        text: error.response?.data?.message || 'Please try again later.',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const fetchCurrentSelection = async () => {
    try {
      const response = await axios.get(CUSTOM_QUERY_API_URL, {
        headers: getAuthHeaders(),
      });
      setCurrentSelection(response.data);
      if (response.data?.llm_model_id) {
        setSelectedLlmId(response.data.llm_model_id);
      }
    } catch (error) {
      console.error('Error fetching custom query selection:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Unable to load selection',
        text: error.response?.data?.message || 'Please try again later.',
        confirmButtonColor: '#dc2626',
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLlmModels(), fetchCurrentSelection()]);
    setRefreshing(false);
  };

  const handleSaveSelection = async () => {
    if (!selectedLlmId) {
      MySwal.fire({
        icon: 'warning',
        title: 'Select an LLM',
        text: 'Please choose an LLM model before saving.',
        confirmButtonColor: '#f97316',
      });
      return;
    }

    setSaving(true);
    try {
      const response = await axios.post(
        CUSTOM_QUERY_API_URL,
        { llm_model_id: parseInt(selectedLlmId, 10) },
        { headers: getAuthHeaders() }
      );

      setCurrentSelection(response.data?.data || null);

      MySwal.fire({
        icon: 'success',
        title: 'LLM Saved',
        text: 'Custom query LLM was updated successfully.',
        confirmButtonColor: '#16a34a',
        timer: 2000,
      });
    } catch (error) {
      console.error('Error saving custom query LLM:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Save failed',
        text: error.response?.data?.message || 'Unable to save selection.',
        confirmButtonColor: '#dc2626',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredModels = useMemo(() => {
    const query = searchValue.toLowerCase();
    return llmModels.filter(
      (model) =>
        model.name?.toLowerCase().includes(query) ||
        (model.provider && model.provider.toLowerCase().includes(query))
    );
  }, [llmModels, searchValue]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading LLM Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Bot className="text-blue-600" size={36} />
              LLM Management
            </h1>
            <p className="text-gray-600 mt-1">
              Select a single global LLM for custom queries. Saving a new one replaces the previous selection.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Database className="text-blue-600" />
                Choose Active LLM
              </h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Pick the LLM model that should handle custom queries. Saving will clear previous choices and store only this one.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LLM Model</label>
                <select
                  value={selectedLlmId || ''}
                  onChange={(e) => setSelectedLlmId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an LLM model</option>
                  {llmModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSaveSelection}
                disabled={saving}
                className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Selection
                  </>
                )}
              </button>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                Saving a new LLM wipes previous selections in `custom_query`, ensuring only one active record.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="text-green-600" />
                Current Selection
              </h2>
            </div>
            {currentSelection ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">LLM Name</p>
                  <p className="text-lg font-semibold text-gray-900">{currentSelection.llm_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">LLM ID</p>
                  <p className="text-base text-gray-900">{currentSelection.llm_model_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-base text-gray-900">
                    {new Date(currentSelection.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 text-center text-gray-600">
                <p>No LLM is currently selected. Choose one from the list to get started.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Available LLM Models</h2>
              <p className="text-sm text-gray-500">Search and review all registered LLM options.</p>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search LLMs..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-gray-500">
                      No LLM models match your search.
                    </td>
                  </tr>
                ) : (
                  filteredModels.map((model) => (
                    <tr key={model.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{model.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            model.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {model.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {model.created_at ? new Date(model.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMManagement;

