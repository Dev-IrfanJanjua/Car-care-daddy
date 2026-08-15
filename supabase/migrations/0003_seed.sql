-- Car Care: seed data (demo vehicle catalog, service catalog + pricing matrix, business settings)
-- Note: the first admin user must be created via Supabase Auth (dashboard or sign-up flow),
-- then promoted with: update public.profiles set role = 'admin' where id = '<user-uuid>';

insert into public.vehicle_makes (name) values
  ('Toyota'), ('Honda'), ('Ford'), ('Chevrolet'),
  ('BMW'), ('Mercedes-Benz'), ('Nissan'), ('Jeep');

insert into public.vehicle_models (make_id, name, vehicle_class)
select m.id, v.name, v.vehicle_class::vehicle_class
from (values
  ('Toyota', 'Camry', 'sedan'), ('Toyota', 'Corolla', 'sedan'),
  ('Toyota', 'RAV4', 'suv'), ('Toyota', 'Highlander', 'suv'),
  ('Toyota', 'Tacoma', 'truck'), ('Toyota', 'Sienna', 'van'),
  ('Honda', 'Civic', 'sedan'), ('Honda', 'Accord', 'sedan'),
  ('Honda', 'CR-V', 'suv'), ('Honda', 'Odyssey', 'van'),
  ('Honda', 'Ridgeline', 'truck'),
  ('Ford', 'F-150', 'truck'), ('Ford', 'Escape', 'suv'),
  ('Ford', 'Explorer', 'suv'), ('Ford', 'Mustang', 'coupe'),
  ('Ford', 'Transit', 'van'),
  ('Chevrolet', 'Silverado', 'truck'), ('Chevrolet', 'Equinox', 'suv'),
  ('Chevrolet', 'Malibu', 'sedan'), ('Chevrolet', 'Suburban', 'suv'),
  ('BMW', '3 Series', 'luxury'), ('BMW', '5 Series', 'luxury'), ('BMW', 'X5', 'luxury'),
  ('Mercedes-Benz', 'C-Class', 'luxury'), ('Mercedes-Benz', 'E-Class', 'luxury'), ('Mercedes-Benz', 'GLE', 'luxury'),
  ('Nissan', 'Altima', 'sedan'), ('Nissan', 'Sentra', 'sedan'),
  ('Nissan', 'Rogue', 'suv'), ('Nissan', 'Frontier', 'truck'),
  ('Jeep', 'Wrangler', 'suv'), ('Jeep', 'Grand Cherokee', 'suv')
) as v(make_name, name, vehicle_class)
join public.vehicle_makes m on m.name = v.make_name;

insert into public.services (name, slug, description, category, sort_order) values
  ('Windshield Chip Repair', 'windshield-chip-repair', 'Repair small chips before they spread into cracks.', 'windshield', 1),
  ('Windshield Replacement', 'windshield-replacement', 'Full windshield replacement with OEM-quality glass.', 'windshield', 2),
  ('Windshield Polishing', 'windshield-polishing', 'Remove haze, light scratches, and wiper marks.', 'windshield', 3),
  ('Headlight Restoration', 'headlight-restoration', 'Restore clarity to yellowed or foggy headlight lenses.', 'headlights', 4),
  ('Side Window Repair', 'side-window-repair', 'Repair or reseal a cracked or malfunctioning side window.', 'windows', 5),
  ('Rear Window Repair', 'rear-window-repair', 'Repair or replace a cracked or shattered rear window.', 'windows', 6),
  ('Side Mirror Glass Replacement', 'side-mirror-glass-replacement', 'Replace a cracked or missing side mirror glass.', 'mirrors', 7),
  ('Sunroof Repair', 'sunroof-repair', 'Fix a leaking, stuck, or cracked sunroof panel.', 'sunroof', 8);

insert into public.service_prices (service_id, vehicle_class, base_price)
select s.id, p.vehicle_class::vehicle_class, p.base_price
from (values
  ('windshield-chip-repair', 'sedan', 89.00), ('windshield-chip-repair', 'coupe', 89.00),
  ('windshield-chip-repair', 'suv', 99.00), ('windshield-chip-repair', 'van', 99.00),
  ('windshield-chip-repair', 'truck', 109.00), ('windshield-chip-repair', 'luxury', 119.00),

  ('windshield-replacement', 'sedan', 350.00), ('windshield-replacement', 'coupe', 350.00),
  ('windshield-replacement', 'suv', 400.00), ('windshield-replacement', 'van', 400.00),
  ('windshield-replacement', 'truck', 425.00), ('windshield-replacement', 'luxury', 475.00),

  ('windshield-polishing', 'sedan', 129.00), ('windshield-polishing', 'coupe', 129.00),
  ('windshield-polishing', 'suv', 149.00), ('windshield-polishing', 'van', 149.00),
  ('windshield-polishing', 'truck', 159.00), ('windshield-polishing', 'luxury', 179.00),

  ('headlight-restoration', 'sedan', 79.00), ('headlight-restoration', 'coupe', 79.00),
  ('headlight-restoration', 'suv', 89.00), ('headlight-restoration', 'van', 89.00),
  ('headlight-restoration', 'truck', 95.00), ('headlight-restoration', 'luxury', 109.00),

  ('side-window-repair', 'sedan', 199.00), ('side-window-repair', 'coupe', 199.00),
  ('side-window-repair', 'suv', 229.00), ('side-window-repair', 'van', 229.00),
  ('side-window-repair', 'truck', 239.00), ('side-window-repair', 'luxury', 269.00),

  ('rear-window-repair', 'sedan', 249.00), ('rear-window-repair', 'coupe', 249.00),
  ('rear-window-repair', 'suv', 279.00), ('rear-window-repair', 'van', 279.00),
  ('rear-window-repair', 'truck', 299.00), ('rear-window-repair', 'luxury', 339.00),

  ('side-mirror-glass-replacement', 'sedan', 59.00), ('side-mirror-glass-replacement', 'coupe', 59.00),
  ('side-mirror-glass-replacement', 'suv', 69.00), ('side-mirror-glass-replacement', 'van', 69.00),
  ('side-mirror-glass-replacement', 'truck', 75.00), ('side-mirror-glass-replacement', 'luxury', 85.00),

  ('sunroof-repair', 'sedan', 299.00), ('sunroof-repair', 'coupe', 299.00),
  ('sunroof-repair', 'suv', 339.00), ('sunroof-repair', 'van', 339.00),
  ('sunroof-repair', 'truck', 359.00), ('sunroof-repair', 'luxury', 399.00)
) as p(service_slug, vehicle_class, base_price)
join public.services s on s.slug = p.service_slug;

insert into public.business_settings (id, business_name, contact_email, contact_phone, hours, service_area) values (
  true,
  'Car Care',
  'hello@carcare.example',
  '+1-555-0100',
  '{"mon_fri": "8:00 AM - 6:00 PM", "sat": "9:00 AM - 3:00 PM", "sun": "Closed"}',
  '{"type": "radius", "center_zip": "00000", "radius_miles": 25}'
);
