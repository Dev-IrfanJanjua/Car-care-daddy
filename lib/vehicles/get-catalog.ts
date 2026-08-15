import { createClient } from '@/lib/supabase/server'

export async function getVehicleCatalog() {
  const supabase = await createClient()

  const [{ data: makes, error: makesError }, { data: models, error: modelsError }] =
    await Promise.all([
      supabase.from('vehicle_makes').select('id, name').order('name'),
      supabase.from('vehicle_models').select('id, make_id, name, vehicle_class').order('name'),
    ])

  if (makesError) throw makesError
  if (modelsError) throw modelsError

  return { makes: makes ?? [], models: models ?? [] }
}
