/**
 * AdminPricingPage.jsx
 * 
 * Complete Database-Backed Pricing & Package Management Portal for Admin CMS
 * Direct API sync: Database <-> API <-> Admin CMS <-> Public Website
 */

import { useState, useMemo } from 'react'
import {
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Globe,
  Smartphone,
  Code,
  TrendingUp,
  Palette,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  X,
} from 'lucide-react'
import { SEO } from '@/components/ui'
import { useToast } from '@/components/ui/ToastProvider'
import {
  useAdminPricing,
  useUpdatePricingPackage,
  useBulkUpdatePricingPackages,
  useCreatePricingPackage,
  useDeletePricingPackage,
} from '@/hooks/useContent'

const TABS = [
  { id: 'web', label: 'Web Development', icon: Globe },
  { id: 'mobile', label: 'Mobile Apps', icon: Smartphone },
  { id: 'software', label: 'Custom Software', icon: Code },
  { id: 'marketing', label: 'Digital Marketing', icon: TrendingUp },
  { id: 'branding', label: 'Branding & Design', icon: Palette },
]

export default function AdminPricingPage() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('web')
  
  // Real API hooks
  const { data: apiPackages, isLoading, isError, refetch } = useAdminPricing()
  const updateMutation = useUpdatePricingPackage()
  const bulkUpdateMutation = useBulkUpdatePricingPackages()
  const createMutation = useCreatePricingPackage()
  const deleteMutation = useDeletePricingPackage()

  // Track user edits without cascading effect loops
  const [edits, setEdits] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPkg, setNewPkg] = useState({
    title: '',
    category: 'web',
    price: '',
    timeline: '',
    badge: '',
    description: '',
    isPopular: false,
    features: [''],
  })

  // Derived merged packages
  const packagesList = useMemo(() => {
    if (!apiPackages || !Array.isArray(apiPackages)) return []
    return apiPackages.map((pkg) => ({
      ...pkg,
      ...(edits[pkg.id] || {}),
    }))
  }, [apiPackages, edits])

  const currentTabPackages = packagesList.filter(
    (p) => (p.category || '').toLowerCase() === activeTab
  )

  // Edit handler
  const handleFieldChange = (id, field, value) => {
    setEdits((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }))
  }

  // Feature bullet point modification
  const handleFeatureChange = (pkg, featIndex, value) => {
    const currentFeats = [...(pkg.features || [])]
    currentFeats[featIndex] = value
    handleFieldChange(pkg.id, 'features', currentFeats)
  }

  const handleAddFeature = (pkg) => {
    const currentFeats = [...(pkg.features || []), 'New Feature']
    handleFieldChange(pkg.id, 'features', currentFeats)
  }

  const handleRemoveFeature = (pkg, featIndex) => {
    const currentFeats = (pkg.features || []).filter((_, idx) => idx !== featIndex)
    handleFieldChange(pkg.id, 'features', currentFeats)
  }

  // Save all changes via real API
  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      await bulkUpdateMutation.mutateAsync(packagesList)
      setEdits({})
      addToast('All pricing packages successfully persisted to database!', 'success')
      refetch()
    } catch (err) {
      addToast(err?.message || 'Failed to update pricing packages.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Single card save
  const handleSaveCard = async (pkg) => {
    try {
      await updateMutation.mutateAsync(pkg)
      setEdits((prev) => {
        const next = { ...prev }
        delete next[pkg.id]
        return next
      })
      addToast(`'${pkg.title}' updated successfully!`, 'success')
      refetch()
    } catch (err) {
      addToast(err?.message || 'Failed to update package.', 'error')
    }
  }

  // Delete package
  const handleDelete = async (pkg) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${pkg.title}'?`)) return
    try {
      await deleteMutation.mutateAsync(pkg.id)
      setEdits((prev) => {
        const next = { ...prev }
        delete next[pkg.id]
        return next
      })
      addToast(`'${pkg.title}' deleted successfully!`, 'success')
      refetch()
    } catch (err) {
      addToast(err?.message || 'Failed to delete package.', 'error')
    }
  }

  // Create new package
  const handleCreatePackage = async (e) => {
    e.preventDefault()
    if (!newPkg.title.trim() || !newPkg.price.trim()) {
      addToast('Title and price are required.', 'error')
      return
    }

    try {
      const cleanFeatures = (newPkg.features || []).map((f) => f.trim()).filter(Boolean)
      await createMutation.mutateAsync({
        ...newPkg,
        category: activeTab,
        features: cleanFeatures,
        order: currentTabPackages.length + 1,
      })
      setShowAddModal(false)
      setNewPkg({
        title: '',
        category: activeTab,
        price: '',
        timeline: '',
        badge: '',
        description: '',
        isPopular: false,
        features: [''],
      })
      addToast('New pricing package created and saved to database!', 'success')
      refetch()
    } catch (err) {
      addToast(err?.message || 'Failed to create pricing package.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <SEO title="Pricing & Package Management — Admin" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
              Live Database CMS
            </span>
            <h1 className="text-2xl font-black font-heading tracking-tight">
              Pricing &amp; Package Manager
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time persistence to PostgreSQL. Changes reflect immediately on public pricing, quote calculators, and proposals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Package
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving || bulkUpdateMutation.isPending}
            className="inline-flex items-center gap-2 bg-[#0A3D91] hover:bg-[#072a66] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-900/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving || bulkUpdateMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save All Changes
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        {TABS.map((tab) => {
          const IconC = tab.icon
          const isActive = activeTab === tab.id
          const count = packagesList.filter((p) => (p.category || '').toLowerCase() === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#0A3D91] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <IconC className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-gray-200">
          <RefreshCw className="w-6 h-6 animate-spin text-[#0A3D91] mr-3" />
          <span className="text-sm font-semibold text-gray-600">Loading pricing packages from database...</span>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Failed to load pricing packages. Please check connection.</span>
          <button onClick={() => refetch()} className="ml-auto underline text-xs font-bold">Retry</button>
        </div>
      )}

      {/* Pricing Cards Grid */}
      {!isLoading && currentTabPackages.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <p className="text-sm text-gray-500 font-medium">No pricing packages found in this category.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-3 text-xs font-bold text-[#0A3D91] hover:underline"
          >
            + Create the first package for {TABS.find((t) => t.id === activeTab)?.label}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentTabPackages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm relative transition-all ${
              pkg.isPopular ? 'border-brand-red ring-2 ring-brand-red/20' : 'border-gray-200'
            } ${!pkg.isActive ? 'opacity-60 bg-gray-50' : ''}`}
          >
            <div>
              {/* Top Controls: Badge, Popular, Active */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <input
                  type="text"
                  value={pkg.badge || ''}
                  placeholder="Badge (e.g. Most Popular)"
                  onChange={(e) => handleFieldChange(pkg.id, 'badge', e.target.value)}
                  className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 max-w-[160px]"
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-gray-500">
                    <input
                      type="checkbox"
                      checked={Boolean(pkg.isPopular)}
                      onChange={(e) => handleFieldChange(pkg.id, 'isPopular', e.target.checked)}
                      className="rounded text-brand-red"
                    />
                    Popular
                  </label>
                  <button
                    type="button"
                    onClick={() => handleFieldChange(pkg.id, 'isActive', !pkg.isActive)}
                    title={pkg.isActive ? 'Deactivate' : 'Activate'}
                    className="p-1 rounded text-gray-400 hover:text-gray-700"
                  >
                    {pkg.isActive ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pkg)}
                    title="Delete package"
                    className="p-1 rounded text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                Package Title
              </label>
              <input
                type="text"
                value={pkg.title || ''}
                onChange={(e) => handleFieldChange(pkg.id, 'title', e.target.value)}
                className="font-heading font-black text-lg text-gray-900 w-full border-b border-gray-200 pb-1 focus:outline-none focus:border-[#0A3D91] mb-2"
              />

              <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={pkg.description || ''}
                placeholder="Short summary for clients..."
                onChange={(e) => handleFieldChange(pkg.id, 'description', e.target.value)}
                className="text-xs text-gray-600 w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#0A3D91] mb-3 resize-none"
              />

              {/* Price, Timeline & Support */}
              <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                    Rate / Price
                  </label>
                  <input
                    type="text"
                    value={pkg.price || ''}
                    onChange={(e) => handleFieldChange(pkg.id, 'price', e.target.value)}
                    className="font-mono font-bold text-sm text-[#0A3D91] w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-gray-400 block mb-1">
                    Timeline
                  </label>
                  <input
                    type="text"
                    value={pkg.timeline || pkg.delivery || ''}
                    placeholder="e.g. 5–7 Days"
                    onChange={(e) => {
                      handleFieldChange(pkg.id, 'timeline', e.target.value)
                      handleFieldChange(pkg.id, 'delivery', e.target.value)
                    }}
                    className="font-mono text-xs font-bold text-gray-700 w-full bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>
              </div>

              {/* Features List */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400">
                    Included Features ({(pkg.features || []).length})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddFeature(pkg)}
                    className="text-[10px] font-bold text-[#0A3D91] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Feature
                  </button>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(pkg.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(pkg, idx, e.target.value)}
                        className="text-xs text-gray-700 w-full bg-transparent border-b border-gray-100 focus:border-blue-400 focus:outline-none py-0.5"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(pkg, idx)}
                        className="text-gray-300 hover:text-red-500 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-[10px] text-gray-400 font-mono">
                Order: {pkg.order || 0}
              </span>
              <button
                type="button"
                onClick={() => handleSaveCard(pkg)}
                disabled={updateMutation.isPending}
                className="inline-flex items-center gap-1.5 bg-[#0A3D91] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#072a66] cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Card
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Package Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-lg font-black text-gray-900 font-heading">
                Add New Pricing Package ({TABS.find((t) => t.id === activeTab)?.label})
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Package Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Growth Pro Tier"
                  value={newPkg.title}
                  onChange={(e) => setNewPkg({ ...newPkg, title: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2.5 focus:border-[#0A3D91] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Price *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹19,999"
                    value={newPkg.price}
                    onChange={(e) => setNewPkg({ ...newPkg, price: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 focus:border-[#0A3D91] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Timeline</label>
                  <input
                    type="text"
                    placeholder="e.g. 7–10 Days"
                    value={newPkg.timeline}
                    onChange={(e) => setNewPkg({ ...newPkg, timeline: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 focus:border-[#0A3D91] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Badge (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Most Popular"
                  value={newPkg.badge}
                  onChange={(e) => setNewPkg({ ...newPkg, badge: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2.5 focus:border-[#0A3D91] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of target use case..."
                  value={newPkg.description}
                  onChange={(e) => setNewPkg({ ...newPkg, description: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2.5 focus:border-[#0A3D91] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0A3D91] text-white hover:bg-[#072a66]"
                >
                  {createMutation.isPending ? 'Saving...' : 'Create & Save to DB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
