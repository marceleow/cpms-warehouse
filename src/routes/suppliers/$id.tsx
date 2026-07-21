import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/suppliers/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/suppliers/$id"!</div>
}
