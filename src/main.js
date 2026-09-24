import { ViteSSG } from 'vite-ssg'
import '@fontsource/azeret-mono/400.css'
import '@fontsource/azeret-mono/500.css'
import '@fontsource/instrument-serif/400-italic.css'
import './style.css'
import App from './App.vue'
import Home from './views/Home.vue'
import Writing from './views/Writing.vue'
import Entry from './views/Entry.vue'
import { projects, posts } from './content.js'

const routes = [
  { path: '/', component: Home },
  { path: '/writing', component: Writing },
  { path: '/work/:slug', component: Entry, props: (r) => ({ kind: 'work', slug: r.params.slug }) },
  { path: '/writing/:slug', component: Entry, props: (r) => ({ kind: 'writing', slug: r.params.slug }) },
  { path: '/:missing(.*)*', component: Entry, props: { kind: 'missing' } },
]

export const createApp = ViteSSG(App, {
  routes,
  scrollBehavior: (to, from, saved) => saved ?? { top: 0 },
})

// Pre-render every project and post, not just the static routes.
export function includedRoutes(paths) {
  return [
    ...paths.filter((p) => !p.includes(':')),
    ...projects.map((p) => `/work/${p.slug}`),
    ...posts.map((p) => `/writing/${p.slug}`),
  ]
}
