# 🔧 Fix: Solicitudes Huérfanas y Duplicados

## Problema

Cuando se desvincula un alumno y luego intenta reconectar, pueden ocurrir estos problemas:

1. **Error "Relación ya existente"**: Hay registros en `trainer_link_request` marcados como 'accepted' que NO tienen una entrada correspondiente en `trainer_student`.

2. **Entradas duplicadas**: El mismo alumno aparece varias veces en la lista de activos porque hay múltiples filas en `trainer_student` para la misma relación trainer-alumno.

## Causa

1. El código asumía que existía un trigger de base de datos que creaba automáticamente la relación en `trainer_student` al aceptar una solicitud, pero **ese trigger no existe**.

2. La tabla `trainer_student` usa `id` como primary key en lugar de una clave compuesta `(trainer_id, student_id)`, lo que permite duplicados accidentales.

## Solución Aplicada

Se actualizó el código para:
- ✅ Crear manualmente la entrada en `trainer_student` cuando se acepta una solicitud
- ✅ Incluir todas las columnas necesarias (`joined_at`, `status`)
- ✅ Verificar duplicados antes de insertar
- ✅ Limpiar solicitudes antiguas al desvincular un alumno

Archivos modificados:
- [src/features/trainer/services/clientHandlers.ts](../src/features/trainer/services/clientHandlers.ts)
- [src/lib/trainer/clientHandlers.ts](../src/lib/trainer/clientHandlers.ts)

## 🚨 Limpiar Datos Existentes (REQUERIDO)

### Paso 1: Limpiar Duplicados y Agregar Constraint

Ejecuta este SQL en **Supabase Dashboard → SQL Editor**:

```sql
-- Ver duplicados actuales
SELECT trainer_id, student_id, COUNT(*) as duplicates
FROM trainer_student
GROUP BY trainer_id, student_id
HAVING COUNT(*) > 1;

-- Eliminar duplicados (mantiene el más antiguo)
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

-- Agregar constraint único para prevenir futuros duplicados
ALTER TABLE trainer_student 
ADD CONSTRAINT uq_trainer_student_pair 
UNIQUE (trainer_id, student_id);
```

O usa el archivo: [`cleanup-duplicates.sql`](./cleanup-duplicates.sql)

### Paso 2: Crear Relaciones Faltantes (Opcional)

Si después del paso 1 aún tienes solicitudes aceptadas sin relación:

```sql
INSERT INTO trainer_student (trainer_id, student_id, joined_at, status)
SELECT DISTINCT 
  tlr.trainer_id, 
  tlr.student_id,
  COALESCE(tlr.decided_at, tlr.created_at, NOW()) as joined_at,
  'active' as status
FROM trainer_link_request tlr
WHERE tlr.status = 'accepted'
  AND NOT EXISTS (
    SELECT 1 
    FROM trainer_student ts 
    WHERE ts.trainer_id = tlr.trainer_id 
      AND ts.student_id = tlr.student_id
  );
```

## Verificación

Después de ejecutar los scripts:

1. ✅ Refresca la página de alumnos
2. ✅ Cada alumno debería aparecer solo una vez
3. ✅ Puedes eliminar alumnos normalmente
4. ✅ Puedes aceptar nuevas solicitudes sin errores ni duplicados

## Prevención Futura

Los cambios aplicados aseguran que:
- ✅ No se crearán duplicados (verificación previa + constraint)
- ✅ Todas las columnas se incluyen al crear relaciones
- ✅ Se limpian solicitudes antiguas al desvincular
- ✅ Se reparan relaciones inconsistentes automáticamente
