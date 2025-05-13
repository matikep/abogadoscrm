-- Script para crear el esquema de la base de datos PostgreSQL para LexCase Manager

-- Eliminar tablas si existen para permitir una nueva creación (¡CUIDADO! Esto borrará datos existentes)
-- Descomenta las siguientes líneas si necesitas empezar desde cero.
/*
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS case_billing_items CASCADE;
DROP TABLE IF EXISTS case_deadlines CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS billable_items CASCADE;
DROP TABLE IF EXISTS deadline_types CASCADE;
DROP TABLE IF EXISTS task_types CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
*/

-- Tabla de Tipos de Tarea Generales
CREATE TABLE IF NOT EXISTS task_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Tipos de Plazos (Deadlines)
CREATE TABLE IF NOT EXISTS deadline_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Items Facturables (Tarifas y Servicios)
CREATE TABLE IF NOT EXISTS billable_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    status VARCHAR(50) CHECK (status IN ('Activo', 'Inactivo', 'Potencial')) DEFAULT 'Potencial',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);


-- Tabla de Casos
CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    case_number VARCHAR(100) NOT NULL UNIQUE,
    client_name VARCHAR(255) NOT NULL, -- Considerar reemplazar con client_id INTEGER REFERENCES clients(id) en el futuro
    status VARCHAR(50) CHECK (status IN ('Abierto', 'Cerrado', 'Pendiente', 'Archivado')) NOT NULL DEFAULT 'Abierto',
    type VARCHAR(150) NOT NULL,
    assigned_lawyer VARCHAR(255),
    opening_date DATE,
    description TEXT,
    payment_status VARCHAR(50) CHECK (payment_status IN ('Pendiente de Facturación', 'Facturado - Pendiente de Pago', 'Abono Realizado', 'Pagado Completo', 'Anulado')) DEFAULT 'Pendiente de Facturación',
    amount_paid DECIMAL(12, 2) DEFAULT 0.00 CHECK (amount_paid >= 0),
    total_billed DECIMAL(12, 2) DEFAULT 0.00 CHECK (total_billed >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL, -- Para futura integración con tabla clients
);
CREATE INDEX IF NOT EXISTS idx_cases_case_number ON cases(case_number);
CREATE INDEX IF NOT EXISTS idx_cases_client_name ON cases(client_name);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
-- CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);


-- Tabla de Tareas Generales
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- Actualmente almacena el nombre del task_type. Considerar task_type_id INTEGER REFERENCES task_types(id)
    start_date DATE,
    due_date DATE NOT NULL,
    priority VARCHAR(50) CHECK (priority IN ('Alta', 'Media', 'Baja')) NOT NULL DEFAULT 'Media',
    status VARCHAR(50) CHECK (status IN ('Pendiente', 'Completada')) NOT NULL DEFAULT 'Pendiente',
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
    case_name VARCHAR(255), -- Denormalizado para UI
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);


-- Tabla de Plazos de Casos (Case Deadlines)
CREATE TABLE IF NOT EXISTS case_deadlines (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    deadline_type_id INTEGER REFERENCES deadline_types(id) ON DELETE SET NULL, -- Puede ser NOT NULL dependiendo de la lógica de negocio
    name VARCHAR(255) NOT NULL, -- Nombre específico del plazo para este caso
    start_date DATE,
    due_date DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('Pendiente', 'Completada', 'Vencida')) NOT NULL DEFAULT 'Pendiente',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_case_deadlines_case_id ON case_deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_case_deadlines_due_date ON case_deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_case_deadlines_status ON case_deadlines(status);


-- Tabla de Items Facturables por Caso
CREATE TABLE IF NOT EXISTS case_billing_items (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    billable_item_id INTEGER NOT NULL REFERENCES billable_items(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL, -- Denormalizado de billable_items.name
    price_at_time_of_billing DECIMAL(12, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_case_billing_items_case_id ON case_billing_items(case_id);


-- Tabla de Documentos
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100), -- MIME type
    file_url TEXT NOT NULL, -- URL de Firebase Storage u otro
    storage_path TEXT NOT NULL UNIQUE, -- Ruta completa en Storage para borrado
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
    case_name VARCHAR(255), -- Denormalizado para UI
    document_type VARCHAR(100),
    version INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    uploaded_by VARCHAR(255), -- Podría ser user_id en el futuro
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_file_name ON documents(file_name);


-- Tabla de Eventos del Calendario
CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    type VARCHAR(50) CHECK (type IN ('Audiencia', 'Juicio', 'Reunión', 'Otro')) DEFAULT 'Otro',
    description TEXT,
    location VARCHAR(255),
    case_id INTEGER REFERENCES cases(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_case_id ON calendar_events(case_id);

-- Funciones para actualizar automáticamente 'updated_at' (Opcional, pero recomendado)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para las tablas (Ejemplos, aplicar a todas las tablas con 'updated_at')
DO $$
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at' AND table_schema = 'public' -- Asegúrate que sea tu schema correcto
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS set_timestamp ON %I;', t_name); -- Usar %I para nombres de tabla
        EXECUTE format('CREATE TRIGGER set_timestamp BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();', t_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- Insertar algunos datos de ejemplo (Opcional)

-- Tipos de Tarea
INSERT INTO task_types (name) VALUES
('Investigación Legal'),
('Redacción de Documento'),
('Preparación de Audiencia'),
('Reunión con Cliente'),
('Trámite Administrativo')
ON CONFLICT (name) DO NOTHING;

-- Tipos de Plazo
INSERT INTO deadline_types (name) VALUES
('Presentación de Escrito'),
('Contestación de Demanda'),
('Apelación'),
('Pago de Tasa Judicial')
ON CONFLICT (name) DO NOTHING;

-- Items Facturables Genéricos
INSERT INTO billable_items (name, price, description) VALUES
('Consulta Inicial (1 hora)', 100.00, 'Primera consulta para evaluación del caso.'),
('Redacción de Contrato Simple', 250.00, 'Elaboración de un contrato estándar.'),
('Hora de Asesoría Legal', 120.00, 'Servicios de asesoría legal por hora.'),
('Representación en Audiencia (Media Jornada)', 500.00, 'Asistencia y representación en audiencia judicial por media jornada.'),
('Gestión de Trámites', 75.00, 'Realización de gestiones administrativas y trámites menores.')
ON CONFLICT (name) DO NOTHING;

-- Clientes de Ejemplo
INSERT INTO clients (name, email, phone, status) VALUES
('Juan Pérez', 'juan.perez@example.com', '+34600112233', 'Activo'),
('Empresa Ejemplo S.L.', 'contacto@empresa.com', '+34912345678', 'Activo'),
('Ana López', 'ana.lopez@example.com', '+34655998877', 'Potencial')
ON CONFLICT (email) DO NOTHING;


-- Casos de Ejemplo
INSERT INTO cases (case_number, client_name, status, type, assigned_lawyer, opening_date, description, payment_status, total_billed, amount_paid) VALUES
('CIV-2023-001', 'Juan Pérez', 'Abierto', 'Civil - Reclamación de Deuda', 'Dr. García', '2023-01-15', 'Reclamación de cantidad por impago de factura N°123.', 'Facturado - Pendiente de Pago', 1200.50, 0.00),
('LAB-2023-002', 'Ana López', 'Pendiente', 'Laboral - Despido Injustificado', 'Dra. Martínez', '2023-03-01', 'Cliente alega despido sin causa justificada. Pendiente de recopilar documentación.', 'Pendiente de Facturación', 0.00, 0.00),
('COM-2023-003', 'Empresa Ejemplo S.L.', 'Cerrado', 'Mercantil - Constitución de Sociedad', 'Dr. García', '2023-02-10', 'Constitución de sociedad de responsabilidad limitada. Proceso finalizado.', 'Pagado Completo', 850.00, 850.00)
ON CONFLICT (case_number) DO NOTHING;

-- Tareas de Ejemplo (asumiendo que los IDs de caso son 1, 2, 3 si se insertan en orden)
-- Para insertar tareas, necesitarías los IDs de los casos. Esto es más fácil de hacer programáticamente.
-- Aquí un ejemplo si supieramos que el caso 'CIV-2023-001' es id=1:
-- INSERT INTO tasks (task_name, type, due_date, priority, status, case_id, case_name) VALUES
-- ('Revisar contrato y facturas impagadas', 'Investigación Legal', '2023-01-20', 'Alta', 'Completada', 1, 'CIV-2023-001 - Juan Pérez'),
-- ('Preparar demanda', 'Redacción de Documento', '2023-02-01', 'Alta', 'Pendiente', 1, 'CIV-2023-001 - Juan Pérez');

-- Plazos de Ejemplo (similar a tareas, requiere case_id)
-- Ejemplo si el caso 'CIV-2023-001' es id=1 y 'Presentación de Escrito' es deadline_type_id=1
-- INSERT INTO case_deadlines (case_id, deadline_type_id, name, due_date, status) VALUES
-- (1, 1, 'Presentar demanda inicial', '2023-02-15', 'Completada');


-- Items Facturables por Caso de Ejemplo
-- Asumiendo que 'CIV-2023-001' es case_id=1 y 'Consulta Inicial (1 hora)' es billable_item_id=1
-- INSERT INTO case_billing_items (case_id, billable_item_id, name, price_at_time_of_billing, quantity, total) VALUES
-- (1, 1, 'Consulta Inicial (1 hora)', 100.00, 1, 100.00);
-- INSERT INTO case_billing_items (case_id, billable_item_id, name, price_at_time_of_billing, quantity, total) VALUES
-- (1, (SELECT id FROM billable_items WHERE name = 'Hora de Asesoría Legal'), 'Hora de Asesoría Legal', 120.00, 5, 600.00);


-- Eventos del Calendario de Ejemplo
-- INSERT INTO calendar_events (title, event_date, event_time, type, case_id, location) VALUES
-- ('Audiencia Preliminar CIV-2023-001', '2023-03-10', '10:00:00', 'Audiencia', 1, 'Juzgado N°5, Sala 3');


SELECT 'Esquema de base de datos creado y datos de ejemplo insertados (si no existían).';
