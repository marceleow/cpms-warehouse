import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/materials/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/materials/$id"!</div>
}
