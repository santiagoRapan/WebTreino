-- ⚠️ EJECUTA ESTE SCRIPT PRIMERO PARA LIMPIAR DUPLICADOS ACTUALES ⚠️
--
-- Este script:
-- 1. Elimina entradas duplicadas en trainer_student (mantiene la más antigua)
-- 2. Agrega un constraint único para prevenir duplicados futuros
--
-- Ejecutar en: Supabase Dashboard > SQL Editor

-- PASO 1: Ver cuántos duplicados hay (opcional - solo para verificar)
SELECT trainer_id, student_id, COUNT(*) as duplicates
FROM trainer_student
GROUP BY trainer_id, student_id
HAVING COUNT(*) > 1;

-- PASO 2: Eliminar duplicados (mantiene la entrada más antigua por joined_at)
DELETE FROM trainer_student
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY trainer_id, student_id 
             ORDER BY joined_at ASC, id ASC
           ) as row_num
    FROM trainer_student
  ) t
  WHERE row_num > 1
);

-- PASO 3: Agregar constraint único para prevenir duplicados futuros
ALTER TABLE trainer_student 
ADD CONSTRAINT uq_trainer_student_pair 
UNIQUE (trainer_id, student_id);

-- Verificación final: esto debería devolver 0 filas
SELECT trainer_id, student_id, COUNT(*) as duplicates
FROM trainer_student
GROUP BY trainer_id, student_id
HAVING COUNT(*) > 1;
