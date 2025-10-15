


// import React, { useState, useMemo, useEffect } from 'react';
// import { Eye, Edit, Save, FileText, Key, Code, Hash, Filter, ChevronLeft, ChevronRight, Trash2, Copy, Calendar, User, PlusCircle, X, Lock, Unlock } from 'lucide-react';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import withReactContent from 'sweetalert2-react-content';

// // Helper function to decode JWT token
// const decodeToken = (token) => {
//   try {
//     if (!token) return null;
//     const base64Url = token.split('.')[1];
//     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//     const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
//       return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//     }).join(''));
//     return JSON.parse(jsonPayload);
//   } catch (error) {
//     console.error('Error decoding token:', error);
//     return null;
//   }
// };

// const MySwal = withReactContent(Swal);

// const PromptManagement = () => {
//   const [prompts, setPrompts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userInfo, setUserInfo] = useState(null);

//   const [selectedPrompt, setSelectedPrompt] = useState(null);
//   const [editMode, setEditMode] = useState(false);
//   const [editedPrompt, setEditedPrompt] = useState(null);
//   const [showPromptTable, setShowPromptTable] = useState(true);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [newPrompt, setNewPrompt] = useState({
//     name: '',
//     description: '',
//     secret_manager_id: '',
//     secret_value: '',
//     template_type: 'system',
//     status: 'active',
//     llm_id: null,
//   });

//   const [llmModels, setLlmModels] = useState([]);
//   const [showCreateLlmModal, setShowCreateLlmModal] = useState(false);
//   const [newLlmName, setNewLlmName] = useState('');
//   const [llmLoading, setLlmLoading] = useState(false);
  
//   // Search and pagination states
//   const [searchValue, setSearchValue] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   // Loading states
//   const [createLoading, setCreateLoading] = useState(false);
//   const [updateLoading, setUpdateLoading] = useState(false);
//   const [fetchValueLoading, setFetchValueLoading] = useState({});

//   // API Base URL
//   const API_BASE_URL = 'https://super-adimn-backend-110685455967.asia-south1.run.app/api/secrets';
//   const LLM_API_BASE_URL = 'https://super-adimn-backend-110685455967.asia-south1.run.app/api/llm';

//   // Get user info from token
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       const decoded = decodeToken(token);
//       if (decoded) {
//         setUserInfo({
//           userId: decoded.id || decoded.userId || decoded.user_id,
//           role: decoded.role || decoded.userRole || decoded.user_role,
//           email: decoded.email,
//           name: decoded.name || decoded.username
//         });
//         console.log('User Info:', decoded);
//       } else {
//         MySwal.fire({
//           icon: 'error',
//           title: 'Authentication Error',
//           text: 'Invalid token. Please login again.',
//           confirmButtonColor: '#3085d6',
//         }).then(() => {
//           localStorage.removeItem('token');
//         });
//       }
//     } else {
//       MySwal.fire({
//         icon: 'warning',
//         title: 'Authentication Required',
//         text: 'Please login to access this page.',
//         confirmButtonColor: '#3085d6',
//       });
//     }
//   }, []);

//   const fetchPrompts = async (includeValues = false) => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       setError('No authentication token found');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     try {
//       console.log('Fetching prompts with token:', token.substring(0, 20) + '...');
//       const url = includeValues ? `${API_BASE_URL}?fetch=true` : API_BASE_URL;
//       const response = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
      
//       // Transform the data to match component expectations
//       const transformedData = response.data.map(prompt => ({
//         id: prompt.id,
//         name: prompt.name,
//         description: prompt.description || 'No description available',
//         secret_manager_id: prompt.secret_manager_id,
//         template_type: prompt.template_type,
//         status: prompt.status === 'active' ? 'Active' : 'Draft',
//         usageCount: prompt.usage_count || 0,
//         successRate: prompt.success_rate || 0,
//         avgProcessingTime: prompt.avg_processing_time || 0,
//         createdBy: userInfo?.name || prompt.created_by || 'Admin',
//         createdAt: new Date(prompt.created_at).toLocaleDateString(),
//         lastModified: new Date(prompt.updated_at).toLocaleDateString(),
//         lastUsed: prompt.last_used_at ? new Date(prompt.last_used_at).toLocaleDateString() : 'Never',
//         version: prompt.version,
//         value: prompt.value || null,
//         llm_id: prompt.llm_id || null,
//       }));
      
//       setPrompts(transformedData);
//     } catch (err) {
//       console.error('Error fetching prompts:', err);
//       setError('Failed to fetch prompts.');
      
//       if (err.response?.status === 401) {
//         MySwal.fire({
//           icon: 'error',
//           title: 'Authentication Error',
//           text: 'Your session has expired. Please login again.',
//           confirmButtonColor: '#3085d6',
//         }).then(() => {
//           localStorage.removeItem('token');
//         });
//       } else {
//         MySwal.fire({
//           icon: 'error',
//           title: 'Error!',
//           text: err.response?.data?.error || 'Failed to fetch prompts. Please try again later.',
//           confirmButtonColor: '#3085d6',
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (userInfo) {
//       fetchPrompts();
//       fetchLlmModels();
//     }
//   }, [userInfo]);

//   const fetchLlmModels = async () => {
//     setLlmLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(LLM_API_BASE_URL, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
//       setLlmModels(response.data);
//     } catch (err) {
//       console.error('Error fetching LLM models:', err);
//       MySwal.fire({
//         icon: 'error',
//         title: 'Error!',
//         text: err.response?.data?.error || 'Failed to fetch LLM models. Please try again later.',
//         confirmButtonColor: '#3085d6',
//       });
//     } finally {
//       setLlmLoading(false);
//     }
//   };

//   const handleCreateLlm = async () => {
//     if (!newLlmName.trim()) {
//       MySwal.fire({
//         icon: 'warning',
//         title: 'Validation Error',
//         text: 'Please enter an LLM model name.',
//         confirmButtonColor: '#3085d6',
//       });
//       return;
//     }

//     setLlmLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const createData = {
//         name: newLlmName,
//         is_active: true,
//       };

//       await axios.post(LLM_API_BASE_URL, createData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       MySwal.fire({
//         icon: 'success',
//         title: 'Success!',
//         text: 'LLM model created successfully.',
//         confirmButtonColor: '#3085d6',
//       });

//       setNewLlmName('');
//       setShowCreateLlmModal(false);
//       fetchLlmModels();
//     } catch (err) {
//       console.error('Error creating LLM model:', err);
//       MySwal.fire({
//         icon: 'error',
//         title: 'Error!',
//         text: err.response?.data?.error || 'Failed to create LLM model. Please try again.',
//         confirmButtonColor: '#3085d6',
//       });
//     } finally {
//       setLlmLoading(false);
//     }
//   };

//   const handleCreatePrompt = async () => {
//     if (!newPrompt.name.trim()) {
//       MySwal.fire({
//         icon: 'warning',
//         title: 'Validation Error',
//         text: 'Please enter a prompt name.',
//         confirmButtonColor: '#3085d6',
//       });
//       return;
//     }

//     if (!newPrompt.secret_manager_id.trim()) {
//       MySwal.fire({
//         icon: 'warning',
//         title: 'Validation Error',
//         text: 'Please enter a secret manager ID.',
//         confirmButtonColor: '#3085d6',
//       });
//       return;
//     }

//     if (!newPrompt.secret_value.trim()) {
//       MySwal.fire({
//         icon: 'warning',
//         title: 'Validation Error',
//         text: 'Please enter the prompt content.',
//         confirmButtonColor: '#3085d6',
//       });
//       return;
//     }

//     setCreateLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const createData = {
//         name: newPrompt.name,
//         description: newPrompt.description,
//         secret_manager_id: newPrompt.secret_manager_id,
//         secret_value: newPrompt.secret_value,
//         template_type: newPrompt.template_type,
//         status: newPrompt.status,
//         created_by: userInfo?.userId || 1,
//         llm_id: newPrompt.llm_id,
//       };

//       const response = await axios.post(`${API_BASE_URL}/create`, createData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       MySwal.fire({
//         icon: 'success',
//         title: 'Success!',
//         text: 'Prompt created successfully.',
//         confirmButtonColor: '#3085d6',
//       });

//       setNewPrompt({
//         name: '',
//         description: '',
//         secret_manager_id: '',
//         secret_value: '',
//         template_type: 'system',
//         status: 'active',
//         llm_id: null,
//       });
//       setShowCreateForm(false);
//       fetchPrompts();
//     } catch (err) {
//       console.error('Error creating prompt:', err);
//       MySwal.fire({
//         icon: 'error',
//         title: 'Error!',
//         text: err.response?.data?.error || 'Failed to create prompt. Please try again.',
//         confirmButtonColor: '#3085d6',
//       });
//     } finally {
//       setCreateLoading(false);
//     }
//   };

//   const handleViewPrompt = async (prompt) => {
//     setSelectedPrompt(prompt);
//     setEditedPrompt({ ...prompt });
//     setEditMode(false);
//     setShowPromptTable(false);
//   };

//   const fetchSecretValue = async (promptId) => {
//     setFetchValueLoading(prev => ({ ...prev, [promptId]: true }));
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${API_BASE_URL}/${promptId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       const updatedPrompt = {
//         ...selectedPrompt,
//         value: response.data.value,
//         secret_manager_id: response.data.secretManagerId,
//         version: response.data.version,
//       };
      
//       setSelectedPrompt(updatedPrompt);
//       setEditedPrompt(updatedPrompt);
      
//       MySwal.fire({
//         icon: 'success',
//         title: 'Success!',
//         text: 'Secret value fetched successfully.',
//         confirmButtonColor: '#3085d6',
//       });
//     } catch (err) {
//       console.error('Error fetching secret value:', err);
//       MySwal.fire({
//         icon: 'error',
//         title: 'Error!',
//         text: 'Failed to fetch secret value.',
//         confirmButtonColor: '#3085d6',
//       });
//     } finally {
//       setFetchValueLoading(prev => ({ ...prev, [promptId]: false }));
//     }
//   };

//   const handleBackToTable = () => {
//     setSelectedPrompt(null);
//     setEditedPrompt(null);
//     setEditMode(false);
//     setShowPromptTable(true);
//     setShowCreateForm(false);
//   };

//   const handleEditToggle = () => {
//     setEditMode(!editMode);
//   };

//   const handleInputChange = (field, value) => {
//     setEditedPrompt({ ...editedPrompt, [field]: value });
//   };

//   const handleNewPromptChange = (field, value) => {
//     setNewPrompt({ ...newPrompt, [field]: value });
//   };

//   const handleDeletePrompt = async (prompt) => {
//     const result = await MySwal.fire({
//       title: 'Are you sure?',
//       text: `This will permanently delete the prompt "${prompt.name}".`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Yes, delete it!',
//       cancelButtonText: 'Cancel'
//     });

//     if (result.isConfirmed) {
//       MySwal.fire({
//         icon: 'info',
//         title: 'Note',
//         text: 'Delete functionality would be implemented with a DELETE API endpoint.',
//         confirmButtonColor: '#3085d6',
//       });
//     }
//   };

//   const handleDuplicatePrompt = (prompt) => {
//     const newPrompt = {
//       ...prompt,
//       id: Math.random().toString(36).substr(2, 9),
//       name: `${prompt.name} (Copy)`,
//       secret_manager_id: `${prompt.secret_manager_id}_copy`,
//       createdAt: new Date().toLocaleDateString(),
//       lastModified: new Date().toLocaleDateString(),
//       usageCount: 0,
//       status: 'Draft'
//     };
//     setPrompts([...prompts, newPrompt]);
    
//     MySwal.fire({
//       icon: 'success',
//       title: 'Success!',
//       text: 'Prompt duplicated successfully.',
//       confirmButtonColor: '#3085d6',
//     });
//   };

//   const filteredPrompts = useMemo(() => {
//     if (!searchValue.trim()) {
//       return prompts;
//     }
    
//     const searchTerm = searchValue.toLowerCase().trim();
//     return prompts.filter(prompt => {
//       return (
//         prompt.id.toString().includes(searchTerm) ||
//         prompt.name.toLowerCase().includes(searchTerm) ||
//         prompt.template_type.toLowerCase().includes(searchTerm) ||
//         prompt.secret_manager_id.toLowerCase().includes(searchTerm) ||
//         prompt.createdBy.toLowerCase().includes(searchTerm)
//       );
//     });
//   }, [prompts, searchValue]);

//   const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedPrompts = filteredPrompts.slice(startIndex, startIndex + itemsPerPage);

//   const handleSearchChange = (value) => {
//     setSearchValue(value);
//     setCurrentPage(1);
//   };

//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };

//   const getStatusColor = (status) => {
//     return status === 'Active' ? 'text-green-600' : 'text-orange-600';
//   };

//   const getTemplateTypeColor = (type) => {
//     const colors = {
//       'system': 'text-blue-600 bg-blue-50',
//       'user': 'text-green-600 bg-green-50',
//       'assistant': 'text-purple-600 bg-purple-50',
//       'function': 'text-orange-600 bg-orange-50'
//     };
//     return colors[type] || 'text-gray-600 bg-gray-50';
//   };

//   if (loading) {
//     return (
//       <div className="p-6 bg-white rounded-xl shadow-lg font-inter">
//         <div className="flex items-center justify-center h-64">
//           <div className="text-lg text-gray-600">Loading prompts...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-white rounded-xl shadow-lg font-inter">
//       {showCreateForm ? (
//         <div className="bg-white">
//           <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
//             <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
//               <PlusCircle className="mr-3" />
//               Add New Prompt
//             </h2>
//             <button
//               onClick={handleBackToTable}
//               className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//             >
//               <X className="w-4 h-4 mr-2" />
//               Cancel
//             </button>
//           </div>

//           {/* Create LLM Model Inline Form */}
//           {showCreateLlmModal && (
//             <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-semibold text-gray-800 flex items-center">
//                   <PlusCircle className="w-5 h-5 mr-2 text-blue-600" />
//                   Create New LLM Model
//                 </h3>
//                 <button 
//                   onClick={() => setShowCreateLlmModal(false)} 
//                   className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-white transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">LLM Model Name *</label>
//                 <input
//                   type="text"
//                   value={newLlmName}
//                   onChange={(e) => setNewLlmName(e.target.value)}
//                   className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
//                   placeholder="e.g., GPT-5 Turbo"
//                 />
//               </div>
//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowCreateLlmModal(false)}
//                   className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleCreateLlm}
//                   disabled={llmLoading}
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {llmLoading ? 'Creating...' : (
//                     <>
//                       <Save className="w-4 h-4 mr-2" />
//                       Create LLM
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           )}

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Name *</label>
//                 <input
//                   type="text"
//                   value={newPrompt.name}
//                   onChange={(e) => handleNewPromptChange('name', e.target.value)}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
//                   placeholder="Enter prompt name"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Secret Manager ID *</label>
//                 <input
//                   type="text"
//                   value={newPrompt.secret_manager_id}
//                   onChange={(e) => handleNewPromptChange('secret_manager_id', e.target.value)}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
//                   placeholder="Enter unique secret manager ID"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Template Type *</label>
//                 <select
//                   value={newPrompt.template_type}
//                   onChange={(e) => handleNewPromptChange('template_type', e.target.value)}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
//                 >
//                   <option value="system">System</option>
//                   <option value="user">User</option>
//                   <option value="assistant">Assistant</option>
//                   <option value="function">Function</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                 <select
//                   value={newPrompt.status}
//                   onChange={(e) => handleNewPromptChange('status', e.target.value)}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
//                 >
//                   <option value="active">Active</option>
//                   <option value="draft">Draft</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">LLM Model</label>
//                 <div className="flex items-center space-x-2">
//                   <select
//                     value={newPrompt.llm_id || ''}
//                     onChange={(e) => handleNewPromptChange('llm_id', e.target.value ? parseInt(e.target.value) : null)}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
//                     disabled={llmLoading}
//                   >
//                     <option value="">Select LLM Model</option>
//                     {llmModels.map(llm => (
//                       <option key={llm.id} value={llm.id}>{llm.name}</option>
//                     ))}
//                   </select>
//                   <button
//                     onClick={() => setShowCreateLlmModal(true)}
//                     className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//                     title="Create New LLM Model"
//                   >
//                     <PlusCircle className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                 <textarea
//                   value={newPrompt.description}
//                   onChange={(e) => handleNewPromptChange('description', e.target.value)}
//                   rows={3}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
//                   placeholder="Enter prompt description"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Content *</label>
//                 <textarea
//                   value={newPrompt.secret_value}
//                   onChange={(e) => handleNewPromptChange('secret_value', e.target.value)}
//                   rows={6}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
//                   placeholder="Enter the prompt content here..."
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
//             <button
//               onClick={handleBackToTable}
//               className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleCreatePrompt}
//               disabled={createLoading}
//               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {createLoading ? 'Creating...' : (
//                 <>
//                   <Save className="w-4 h-4 mr-2" />
//                   Create Prompt
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       ) : showPromptTable ? (
//         <>
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
//             <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
//               <Key className="mr-3" />
//               Prompt Management
//             </h2>
            
//             <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
//               <div className="flex items-center space-x-3">
//                 <Filter className="w-5 h-5 text-gray-600" />
//                 <input
//                   type="text"
//                   placeholder="Search prompts..."
//                   value={searchValue}
//                   onChange={(e) => handleSearchChange(e.target.value)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
//                 />
                
//                 {searchValue && (
//                   <button
//                     onClick={() => handleSearchChange('')}
//                     className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
//                   >
//                     Clear
//                   </button>
//                 )}
//               </div>

//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => fetchPrompts(true)}
//                   className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//                 >
//                   <Eye className="w-4 h-4 mr-2" />
//                   Load Values
//                 </button>

//                 <button
//                   onClick={() => setShowCreateForm(true)}
//                   className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
//                 >
//                   <PlusCircle className="w-5 h-5 mr-2" />
//                   Add New Prompt
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-200">
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S.No</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prompt Name</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Secret ID</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usage</th>
//                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {paginatedPrompts.length > 0 ? (
//                   paginatedPrompts.map((prompt, index) => (
//                     <tr key={prompt.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {startIndex + index + 1}
//                       </td>
//                       <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
//                         <Hash className="w-4 h-4 mr-1 text-gray-600" />
//                         {prompt.id.toString().substring(0, 8)}...
//                       </td>
//                       <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {prompt.name}
//                       </td>
//                       <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
//                         <Code className="w-4 h-4 mr-1 text-gray-600" />
//                         {prompt.secret_manager_id}
//                       </td>
//                       <td className="px-4 py-2.5 whitespace-nowrap text-sm">
//                         <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getTemplateTypeColor(prompt.template_type)}`}>
//                           {prompt.template_type}
//                         </span>
//                       </td>
//                       <td className={`px-4 py-2.5 whitespace-nowrap text-sm font-semibold ${getStatusColor(prompt.status)}`}>
//                         {prompt.status}
//                       </td>
//                       <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {prompt.usageCount}
//                       </td>
//                       <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium">
//                         <div className="flex space-x-1">
//                           <button
//                             onClick={() => handleViewPrompt(prompt)}
//                             className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-xs leading-4 font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//                           >
//                             <Eye className="w-3 h-3 mr-1" />
//                             View
//                           </button>
//                           <button
//                             onClick={() => handleDuplicatePrompt(prompt)}
//                             className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-xs leading-4 font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//                           >
//                             <Copy className="w-3 h-3 mr-1" />
//                             Copy
//                           </button>
//                           <button
//                             onClick={() => handleDeletePrompt(prompt)}
//                             className="inline-flex items-center px-2 py-1.5 border border-red-300 text-xs leading-4 font-semibold rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
//                           >
//                             <Trash2 className="w-3 h-3 mr-1" />
//                             Delete
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
//                       No prompts found matching your search criteria.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
          
//           {filteredPrompts.length > 0 && (
//             <div className="flex items-center justify-between mt-6 px-2">
//               <div className="text-sm text-gray-700">
//                 Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPrompts.length)} of {filteredPrompts.length} entries
//                 {searchValue && (
//                   <span className="text-gray-500"> (filtered from {prompts.length} total entries)</span>
//                 )}
//               </div>
              
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
//                     currentPage === 1
//                       ? 'border-gray-300 text-gray-400 bg-white cursor-not-allowed'
//                       : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
//                   }`}
//                 >
//                   <ChevronLeft className="w-4 h-4 mr-1" />
//                   Previous
//                 </button>
                
//                 <div className="flex space-x-1">
//                   {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//                     <button
//                       key={page}
//                       onClick={() => handlePageChange(page)}
//                       className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
//                         currentPage === page
//                           ? 'border-blue-500 text-blue-600 bg-blue-50'
//                           : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}
//                 </div>
                
//                 <button
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
//                     currentPage === totalPages
//                       ? 'border-gray-300 text-gray-400 bg-white cursor-not-allowed'
//                       : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
//                   }`}
//                 >
//                   Next
//                   <ChevronRight className="w-4 h-4 ml-1" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       ) : (
//         <div className="bg-white">
//           <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
//             <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
//               <Key className="mr-3" />
//               Prompt Details
//             </h2>
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={handleBackToTable}
//                 className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//               >
//                 Back to List
//               </button>
              
//               {!selectedPrompt.value && (
//                 <button
//                   onClick={() => fetchSecretValue(selectedPrompt.id)}
//                   disabled={fetchValueLoading[selectedPrompt.id]}
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {fetchValueLoading[selectedPrompt.id] ? 'Loading...' : (
//                     <>
//                       <Unlock className="w-4 h-4 mr-2" />
//                       Fetch Secret Value
//                     </>
//                   )}
//                 </button>
//               )}
              
//               {editMode ? (
//                 <>
//                   <button
//                     onClick={handleEditToggle}
//                     className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   onClick={handleEditToggle}
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
//                 >
//                   <Edit className="w-4 h-4 mr-2" />
//                   Edit
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Prompt Information</h4>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Prompt ID</label>
//                 <div className="flex items-center">
//                   <Hash className="w-4 h-4 mr-2 text-gray-600" />
//                   <span className="text-sm text-gray-900 font-mono">{selectedPrompt.id}</span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Name</label>
//                 {editMode ? (
//                   <input
//                     type="text"
//                     value={editedPrompt.name}
//                     onChange={(e) => handleInputChange('name', e.target.value)}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
//                   />
//                 ) : (
//                   <p className="text-sm text-gray-900">{selectedPrompt.name}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Secret Manager ID</label>
//                 <div className="flex items-center">
//                   <Code className="w-4 h-4 mr-2 text-gray-600" />
//                   <span className="text-sm text-gray-900 font-mono">{selectedPrompt.secret_manager_id}</span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
//                 {editMode ? (
//                   <select
//                     value={editedPrompt.template_type}
//                     onChange={(e) => handleInputChange('template_type', e.target.value)}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
//                   >
//                     <option value="system">System</option>
//                     <option value="user">User</option>
//                     <option value="assistant">Assistant</option>
//                     <option value="function">Function</option>
//                   </select>
//                 ) : (
//                   <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getTemplateTypeColor(selectedPrompt.template_type)}`}>
//                     {selectedPrompt.template_type}
//                   </span>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                 <span className={`text-sm font-medium ${getStatusColor(selectedPrompt.status)}`}>
//                   {selectedPrompt.status}
//                 </span>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
//                 <p className="text-sm text-gray-900">{selectedPrompt.version || 'Not available'}</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">LLM Model</label>
//                 <p className="text-sm text-gray-900">
//                   {selectedPrompt.llm_id ? llmModels.find(llm => llm.id === selectedPrompt.llm_id)?.name || 'N/A' : 'N/A'}
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Usage & Metadata</h4>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                 {editMode ? (
//                   <textarea
//                     value={editedPrompt.description}
//                     onChange={(e) => handleInputChange('description', e.target.value)}
//                     rows={3}
//                     className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
//                   />
//                 ) : (
//                   <p className="text-sm text-gray-900">{selectedPrompt.description}</p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Usage Count</label>
//                 <p className="text-sm text-gray-900">{selectedPrompt.usageCount} times used</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Success Rate</label>
//                 <p className="text-sm text-gray-900">{selectedPrompt.successRate}%</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Avg Processing Time</label>
//                 <p className="text-sm text-gray-900">{selectedPrompt.avgProcessingTime}ms</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
//                 <div className="flex items-center">
//                   <User className="w-4 h-4 mr-2 text-gray-600" />
//                   <span className="text-sm text-gray-900">{selectedPrompt.createdBy}</span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
//                 <div className="flex items-center">
//                   <Calendar className="w-4 h-4 mr-2 text-gray-600" />
//                   <span className="text-sm text-gray-900">{selectedPrompt.createdAt}</span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Last Used</label>
//                 <div className="flex items-center">
//                   <Calendar className="w-4 h-4 mr-2 text-gray-600" />
//                   <span className="text-sm text-gray-900">{selectedPrompt.lastUsed}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <div className="flex items-center justify-between mb-4">
//               <h4 className="text-lg font-medium text-gray-900">Prompt Content</h4>
//               {selectedPrompt.value ? (
//                 <div className="flex items-center text-green-600">
//                   <Unlock className="w-4 h-4 mr-1" />
//                   <span className="text-sm font-medium">Secret Loaded</span>
//                 </div>
//               ) : (
//                 <div className="flex items-center text-gray-500">
//                   <Lock className="w-4 h-4 mr-1" />
//                   <span className="text-sm font-medium">Secret Protected</span>
//                 </div>
//               )}
//             </div>
            
//             {selectedPrompt.value ? (
//               editMode ? (
//                 <textarea
//                   value={editedPrompt.value || ''}
//                   onChange={(e) => handleInputChange('value', e.target.value)}
//                   rows={10}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
//                   placeholder="Enter prompt content..."
//                 />
//               ) : (
//                 <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap border">
//                   {selectedPrompt.value}
//                 </div>
//               )
//             ) : (
//               <div className="bg-gray-100 rounded-lg p-8 text-center">
//                 <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-600 mb-4">Prompt content is secured and not loaded yet.</p>
//                 <button
//                   onClick={() => fetchSecretValue(selectedPrompt.id)}
//                   disabled={fetchValueLoading[selectedPrompt.id]}
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {fetchValueLoading[selectedPrompt.id] ? 'Loading...' : (
//                     <>
//                       <Unlock className="w-4 h-4 mr-2" />
//                       Load Secret Content
//                     </>
//                   )}
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PromptManagement;





import React, { useState, useMemo, useEffect } from 'react';
import { Eye, Edit, Save, FileText, Key, Code, Hash, Filter, ChevronLeft, ChevronRight, Trash2, Copy, Calendar, User, PlusCircle, X, Lock, Unlock } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const MySwal = withReactContent(Swal);

const PromptManagement = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(null);
  const [showPromptTable, setShowPromptTable] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    name: '',
    description: '',
    secret_manager_id: '',
    secret_value: '',
    template_type: 'system',
    status: 'active',
    llm_id: null,
  });

  const [llmModels, setLlmModels] = useState([]);
  const [showCreateLlmModal, setShowCreateLlmModal] = useState(false);
  const [newLlmName, setNewLlmName] = useState('');
  const [llmLoading, setLlmLoading] = useState(false);
  
  // Search and pagination states
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Loading states
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [fetchValueLoading, setFetchValueLoading] = useState({});

  // API Base URL
  const API_BASE_URL = 'https://super-adimn-backend-110685455967.asia-south1.run.app/api/secrets';
  const LLM_API_BASE_URL = 'https://super-adimn-backend-110685455967.asia-south1.run.app/api/llm';

  // Get user info from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUserInfo({
          userId: decoded.id || decoded.userId || decoded.user_id,
          role: decoded.role || decoded.userRole || decoded.user_role,
          email: decoded.email,
          name: decoded.name || decoded.username
        });
        console.log('User Info:', decoded);
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'Invalid token. Please login again.',
          confirmButtonColor: '#3085d6',
        }).then(() => {
          localStorage.removeItem('token');
        });
      }
    } else {
      MySwal.fire({
        icon: 'warning',
        title: 'Authentication Required',
        text: 'Please login to access this page.',
        confirmButtonColor: '#3085d6',
      });
    }
  }, []);

  const fetchPrompts = async (includeValues = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Fetching prompts with token:', token.substring(0, 20) + '...');
      const url = includeValues ? `${API_BASE_URL}?fetch=true` : API_BASE_URL;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Transform the data to match component expectations
      const transformedData = response.data.map(prompt => ({
        id: prompt.id,
        name: prompt.name,
        description: prompt.description || 'No description available',
        secret_manager_id: prompt.secret_manager_id,
        template_type: prompt.template_type,
        status: prompt.status === 'active' ? 'Active' : 'Draft',
        usageCount: prompt.usage_count || 0,
        successRate: prompt.success_rate || 0,
        avgProcessingTime: prompt.avg_processing_time || 0,
        createdBy: userInfo?.name || prompt.created_by || 'Admin',
        createdAt: new Date(prompt.created_at).toLocaleDateString(),
        lastModified: new Date(prompt.updated_at).toLocaleDateString(),
        lastUsed: prompt.last_used_at ? new Date(prompt.last_used_at).toLocaleDateString() : 'Never',
        version: prompt.version,
        value: prompt.value || null,
        llm_id: prompt.llm_id || null,
      }));
      
      setPrompts(transformedData);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError('Failed to fetch prompts.');
      
      if (err.response?.status === 401) {
        MySwal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'Your session has expired. Please login again.',
          confirmButtonColor: '#3085d6',
        }).then(() => {
          localStorage.removeItem('token');
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.response?.data?.error || 'Failed to fetch prompts. Please try again later.',
          confirmButtonColor: '#3085d6',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo) {
      fetchPrompts();
      fetchLlmModels();
    }
  }, [userInfo]);

  const fetchLlmModels = async () => {
    setLlmLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(LLM_API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setLlmModels(response.data);
    } catch (err) {
      console.error('Error fetching LLM models:', err);
      MySwal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.response?.data?.error || 'Failed to fetch LLM models. Please try again later.',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setLlmLoading(false);
    }
  };

  const handleCreateLlm = async () => {
    if (!newLlmName.trim()) {
      MySwal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter an LLM model name.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    setLlmLoading(true);
    try {
      const token = localStorage.getItem('token');
      const createData = {
        name: newLlmName,
        is_active: true,
      };

      await axios.post(LLM_API_BASE_URL, createData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      MySwal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'LLM model created successfully.',
        confirmButtonColor: '#3085d6',
      });

      setNewLlmName('');
      setShowCreateLlmModal(false);
      fetchLlmModels();
    } catch (err) {
      console.error('Error creating LLM model:', err);
      MySwal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.response?.data?.error || 'Failed to create LLM model. Please try again.',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setLlmLoading(false);
    }
  };

  const handleCreatePrompt = async () => {
    if (!newPrompt.name.trim()) {
      MySwal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a prompt name.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (!newPrompt.secret_manager_id.trim()) {
      MySwal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a secret manager ID.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (!newPrompt.secret_value.trim()) {
      MySwal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter the prompt content.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    setCreateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const createData = {
        name: newPrompt.name,
        description: newPrompt.description,
        secret_manager_id: newPrompt.secret_manager_id,
        secret_value: newPrompt.secret_value,
        template_type: newPrompt.template_type,
        status: newPrompt.status,
        created_by: userInfo?.userId || 1,
        llm_id: newPrompt.llm_id,
      };

      const response = await axios.post(`${API_BASE_URL}/create`, createData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      MySwal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Prompt created successfully.',
        confirmButtonColor: '#3085d6',
      });

      setNewPrompt({
        name: '',
        description: '',
        secret_manager_id: '',
        secret_value: '',
        template_type: 'system',
        status: 'active',
        llm_id: null,
      });
      setShowCreateForm(false);
      fetchPrompts();
    } catch (err) {
      console.error('Error creating prompt:', err);
      MySwal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.response?.data?.error || 'Failed to create prompt. Please try again.',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdatePrompt = async () => {
    if (!editedPrompt.name.trim()) {
      MySwal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please enter a prompt name.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    setUpdateLoading(true);
    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: editedPrompt.name,
        description: editedPrompt.description,
        template_type: editedPrompt.template_type,
        status: editedPrompt.status === 'Active' ? 'active' : 'draft',
        llm_id: editedPrompt.llm_id,
      };

      // Only include secret_value if it has been modified
      if (editedPrompt.value && editedPrompt.value !== selectedPrompt.value) {
        updateData.secret_value = editedPrompt.value;
      }

      const response = await axios.put(`${API_BASE_URL}/${selectedPrompt.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      MySwal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Prompt updated successfully.',
        confirmButtonColor: '#3085d6',
      });

      // Update the selected prompt with new data
      setSelectedPrompt(editedPrompt);
      setEditMode(false);
      
      // Refresh the prompts list
      fetchPrompts();
    } catch (err) {
      console.error('Error updating prompt:', err);
      MySwal.fire({
        icon: 'error',
        title: 'Error!',
        text: err.response?.data?.error || 'Failed to update prompt. Please try again.',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeletePrompt = async (prompt) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete the prompt "${prompt.name}" from both GCP Secret Manager and the database.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setDeleteLoading(prev => ({ ...prev, [prompt.id]: true }));
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/${prompt.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        MySwal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Prompt has been deleted successfully.',
          confirmButtonColor: '#3085d6',
        });

        // If we're viewing the deleted prompt, go back to table
        if (selectedPrompt?.id === prompt.id) {
          handleBackToTable();
        }

        // Refresh the prompts list
        fetchPrompts();
      } catch (err) {
        console.error('Error deleting prompt:', err);
        MySwal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.response?.data?.error || 'Failed to delete prompt. Please try again.',
          confirmButtonColor: '#3085d6',
        });
      } finally {
        setDeleteLoading(prev => ({ ...prev, [prompt.id]: false }));
      }
    }
  };

  const handleViewPrompt = async (prompt) => {
    setSelectedPrompt(prompt);
    setEditedPrompt({ ...prompt });
    setEditMode(false);
    setShowPromptTable(false);
  };

  const fetchSecretValue = async (promptId) => {
    setFetchValueLoading(prev => ({ ...prev, [promptId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/${promptId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const updatedPrompt = {
        ...selectedPrompt,
        value: response.data.value,
        secret_manager_id: response.data.secretManagerId,
        version: response.data.version,
      };
      
      setSelectedPrompt(updatedPrompt);
      setEditedPrompt(updatedPrompt);
      
      MySwal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Secret value fetched successfully.',
        confirmButtonColor: '#3085d6',
      });
    } catch (err) {
      console.error('Error fetching secret value:', err);
      MySwal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to fetch secret value.',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setFetchValueLoading(prev => ({ ...prev, [promptId]: false }));
    }
  };

  const handleBackToTable = () => {
    setSelectedPrompt(null);
    setEditedPrompt(null);
    setEditMode(false);
    setShowPromptTable(true);
    setShowCreateForm(false);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - reset to original values
      setEditedPrompt({ ...selectedPrompt });
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (field, value) => {
    setEditedPrompt({ ...editedPrompt, [field]: value });
  };

  const handleNewPromptChange = (field, value) => {
    setNewPrompt({ ...newPrompt, [field]: value });
  };

  const handleDuplicatePrompt = (prompt) => {
    const newPrompt = {
      ...prompt,
      id: Math.random().toString(36).substr(2, 9),
      name: `${prompt.name} (Copy)`,
      secret_manager_id: `${prompt.secret_manager_id}_copy`,
      createdAt: new Date().toLocaleDateString(),
      lastModified: new Date().toLocaleDateString(),
      usageCount: 0,
      status: 'Draft'
    };
    setPrompts([...prompts, newPrompt]);
    
    MySwal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Prompt duplicated successfully.',
      confirmButtonColor: '#3085d6',
    });
  };

  const filteredPrompts = useMemo(() => {
    if (!searchValue.trim()) {
      return prompts;
    }
    
    const searchTerm = searchValue.toLowerCase().trim();
    return prompts.filter(prompt => {
      return (
        prompt.id.toString().includes(searchTerm) ||
        prompt.name.toLowerCase().includes(searchTerm) ||
        prompt.template_type.toLowerCase().includes(searchTerm) ||
        prompt.secret_manager_id.toLowerCase().includes(searchTerm) ||
        prompt.createdBy.toLowerCase().includes(searchTerm)
      );
    });
  }, [prompts, searchValue]);

  const totalPages = Math.ceil(filteredPrompts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrompts = filteredPrompts.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'text-green-600' : 'text-orange-600';
  };

  const getTemplateTypeColor = (type) => {
    const colors = {
      'system': 'text-blue-600 bg-blue-50',
      'user': 'text-green-600 bg-green-50',
      'assistant': 'text-purple-600 bg-purple-50',
      'function': 'text-orange-600 bg-orange-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg font-inter">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading prompts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg font-inter">
      {showCreateForm ? (
        <div className="bg-white">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
              <PlusCircle className="mr-3" />
              Add New Prompt
            </h2>
            <button
              onClick={handleBackToTable}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>

          {/* Create LLM Model Inline Form */}
          {showCreateLlmModal && (
            <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <PlusCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Create New LLM Model
                </h3>
                <button 
                  onClick={() => setShowCreateLlmModal(false)} 
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">LLM Model Name *</label>
                <input
                  type="text"
                  value={newLlmName}
                  onChange={(e) => setNewLlmName(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                  placeholder="e.g., GPT-5 Turbo"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateLlmModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLlm}
                  disabled={llmLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {llmLoading ? 'Creating...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create LLM
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Name *</label>
                <input
                  type="text"
                  value={newPrompt.name}
                  onChange={(e) => handleNewPromptChange('name', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
                  placeholder="Enter prompt name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Manager ID *</label>
                <input
                  type="text"
                  value={newPrompt.secret_manager_id}
                  onChange={(e) => handleNewPromptChange('secret_manager_id', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
                  placeholder="Enter unique secret manager ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Type *</label>
                <select
                  value={newPrompt.template_type}
                  onChange={(e) => handleNewPromptChange('template_type', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  <option value="system">System</option>
                  <option value="user">User</option>
                  <option value="assistant">Assistant</option>
                  <option value="function">Function</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newPrompt.status}
                  onChange={(e) => handleNewPromptChange('status', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LLM Model</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={newPrompt.llm_id || ''}
                    onChange={(e) => handleNewPromptChange('llm_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
                    disabled={llmLoading}
                  >
                    <option value="">Select LLM Model</option>
                    {llmModels.map(llm => (
                      <option key={llm.id} value={llm.id}>{llm.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowCreateLlmModal(true)}
                    className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    title="Create New LLM Model"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newPrompt.description}
                  onChange={(e) => handleNewPromptChange('description', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
                  placeholder="Enter prompt description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Content *</label>
                <textarea
                  value={newPrompt.secret_value}
                  onChange={(e) => handleNewPromptChange('secret_value', e.target.value)}
                  rows={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Enter the prompt content here..."
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleBackToTable}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePrompt}
              disabled={createLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? 'Creating...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Prompt
                </>
              )}
            </button>
          </div>
        </div>
      ) : showPromptTable ? (
        <>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
            <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
              <Key className="mr-3" />
              Prompt Management
            </h2>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
                
                {searchValue && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => fetchPrompts(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Load Values
                </button>

                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Add New Prompt
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">S.No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prompt Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Secret ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPrompts.length > 0 ? (
                  paginatedPrompts.map((prompt, index) => (
                    <tr key={prompt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                        <Hash className="w-4 h-4 mr-1 text-gray-600" />
                        {prompt.id.toString().substring(0, 8)}...
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">
                        {prompt.name}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                        <Code className="w-4 h-4 mr-1 text-gray-600" />
                        {prompt.secret_manager_id}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getTemplateTypeColor(prompt.template_type)}`}>
                          {prompt.template_type}
                        </span>
                      </td>
                      <td className={`px-4 py-2.5 whitespace-nowrap text-sm font-semibold ${getStatusColor(prompt.status)}`}>
                        {prompt.status}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">
                        {prompt.usageCount}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewPrompt(prompt)}
                            className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-xs leading-4 font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleDuplicatePrompt(prompt)}
                            className="inline-flex items-center px-2 py-1.5 border border-gray-300 text-xs leading-4 font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </button>
                          <button
                            onClick={() => handleDeletePrompt(prompt)}
                            disabled={deleteLoading[prompt.id]}
                            className="inline-flex items-center px-2 py-1.5 border border-red-300 text-xs leading-4 font-semibold rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            {deleteLoading[prompt.id] ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      No prompts found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredPrompts.length > 0 && (
            <div className="flex items-center justify-between mt-6 px-2">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPrompts.length)} of {filteredPrompts.length} entries
                {searchValue && (
                  <span className="text-gray-500"> (filtered from {prompts.length} total entries)</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    currentPage === 1
                      ? 'border-gray-300 text-gray-400 bg-white cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        currentPage === page
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    currentPage === totalPages
                      ? 'border-gray-300 text-gray-400 bg-white cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-3xl font-semibold text-gray-800 flex items-center">
              <Key className="mr-3" />
              Prompt Details
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBackToTable}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Back to List
              </button>
              
              {!selectedPrompt.value && (
                <button
                  onClick={() => fetchSecretValue(selectedPrompt.id)}
                  disabled={fetchValueLoading[selectedPrompt.id]}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetchValueLoading[selectedPrompt.id] ? 'Loading...' : (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Fetch Secret Value
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => handleDeletePrompt(selectedPrompt)}
                disabled={deleteLoading[selectedPrompt.id]}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-semibold rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteLoading[selectedPrompt.id] ? 'Deleting...' : 'Delete'}
              </button>
              
              {editMode ? (
                <>
                  <button
                    onClick={handleEditToggle}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePrompt}
                    disabled={updateLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateLoading ? 'Saving...' : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Prompt Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt ID</label>
                <div className="flex items-center">
                  <Hash className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-900 font-mono">{selectedPrompt.id}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedPrompt.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{selectedPrompt.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Manager ID</label>
                <div className="flex items-center">
                  <Code className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-900 font-mono">{selectedPrompt.secret_manager_id}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                {editMode ? (
                  <select
                    value={editedPrompt.template_type}
                    onChange={(e) => handleInputChange('template_type', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
                  >
                    <option value="system">System</option>
                    <option value="user">User</option>
                    <option value="assistant">Assistant</option>
                    <option value="function">Function</option>
                  </select>
                ) : (
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getTemplateTypeColor(selectedPrompt.template_type)}`}>
                    {selectedPrompt.template_type}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                {editMode ? (
                  <select
                    value={editedPrompt.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                ) : (
                  <span className={`text-sm font-medium ${getStatusColor(selectedPrompt.status)}`}>
                    {selectedPrompt.status}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <p className="text-sm text-gray-900">{selectedPrompt.version || 'Not available'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LLM Model</label>
                {editMode ? (
                  <select
                    value={editedPrompt.llm_id || ''}
                    onChange={(e) => handleInputChange('llm_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
                  >
                    <option value="">Select LLM Model</option>
                    {llmModels.map(llm => (
                      <option key={llm.id} value={llm.id}>{llm.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-900">
                    {selectedPrompt.llm_id ? llmModels.find(llm => llm.id === selectedPrompt.llm_id)?.name || 'N/A' : 'N/A'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Usage & Metadata</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                {editMode ? (
                  <textarea
                    value={editedPrompt.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{selectedPrompt.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Count</label>
                <p className="text-sm text-gray-900">{selectedPrompt.usageCount} times used</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Success Rate</label>
                <p className="text-sm text-gray-900">{selectedPrompt.successRate}%</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avg Processing Time</label>
                <p className="text-sm text-gray-900">{selectedPrompt.avgProcessingTime}ms</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-900">{selectedPrompt.createdBy}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-900">{selectedPrompt.createdAt}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Used</label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                  <span className="text-sm text-gray-900">{selectedPrompt.lastUsed}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Prompt Content</h4>
              {selectedPrompt.value ? (
                <div className="flex items-center text-green-600">
                  <Unlock className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Secret Loaded</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-500">
                  <Lock className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Secret Protected</span>
                </div>
              )}
            </div>
            
            {selectedPrompt.value ? (
              editMode ? (
                <textarea
                  value={editedPrompt.value || ''}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Enter prompt content..."
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap border">
                  {selectedPrompt.value}
                </div>
              )
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Prompt content is secured and not loaded yet.</p>
                <button
                  onClick={() => fetchSecretValue(selectedPrompt.id)}
                  disabled={fetchValueLoading[selectedPrompt.id]}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetchValueLoading[selectedPrompt.id] ? 'Loading...' : (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Load Secret Content
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptManagement;