import { useQuery } from '@tanstack/react-query'
import { api } from '@/utils/api'

export function useFaqs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: () => api.get('/faqs'),
    staleTime: 0,
  })
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const res = await api.get('/settings')
      if (res?.data) {
        const d = { ...res.data }
        if (!d.phone || d.phone.includes('99999') || d.phone.includes('123456')) {
          d.phone = '+91 75970 00601'
        }
        if (!d.whatsapp || d.whatsapp.includes('99999') || d.whatsapp.includes('123456')) {
          d.whatsapp = '+91 75970 00601'
        }
        if (!d.email || d.email.includes('example.com') || d.email.includes('hindustanprojects.com')) {
          d.email = 'info@snaptech.digital'
        }
        if (!d.instagram || d.instagram.trim() === '#' || d.instagram.trim() === '/') {
          d.instagram = 'https://instagram.com/hindustanprojects'
        }
        if (!d.facebook || d.facebook.trim() === '#' || d.facebook.trim() === '/') {
          d.facebook = 'https://facebook.com/hindustanprojects'
        }
        if (!d.linkedin || d.linkedin.trim() === '#' || d.linkedin.trim() === '/') {
          d.linkedin = 'https://linkedin.com/company/hindustan-projects'
        }
        if (!d.pinterest || d.pinterest.trim() === '#' || d.pinterest.trim() === '/') {
          d.pinterest = 'https://pinterest.com/hindustanprojects'
        }
        return { ...res, data: d }
      }
      return res
    },
    staleTime: 0,
  })
}

export function useMilestones() {
  return useQuery({
    queryKey: ['milestones'],
    queryFn: () => api.get('/milestones'),
    staleTime: 0,
  })
}

export function usePartners() {
  return useQuery({
    queryKey: ['partners'],
    queryFn: () => api.get('/partners'),
    staleTime: 0,
  })
}

// ── Legal Pages Hooks ──────────────────────────────────────────
export function useLegalPage(pageType) {
  return useQuery({
    queryKey: ['legal-page', pageType],
    queryFn: () => api.get(`/legal/${pageType}`).then((r) => r.data),
    staleTime: 0,
  })
}

export function useAdminLegalPages() {
  return useQuery({
    queryKey: ['admin-legal-pages'],
    queryFn: () => api.get('/admin/legal').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateLegalPage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pageType, title, content }) =>
      api.put(`/admin/legal/${pageType}`, { title, content }).then((r) => r.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-legal-pages'] })
      qc.invalidateQueries({ queryKey: ['legal-page', variables.pageType] })
    },
  })
}
