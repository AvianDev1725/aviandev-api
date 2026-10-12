'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Field, FormError } from '@/components/form';
import { deleteJson, patchJson, postJson } from '@/lib/client';
import { fill } from '@/lib/text';
import type { ContentModel, FieldDefinition, FieldType, FieldTypeInfo } from '@/lib/content-types';
import type { ModelsText } from './text';

type BuilderField = FieldDefinition & { id: string; keyEdited: boolean };

function toFieldKey(label: string) {
  const words = label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
  const key = words.map((word, i) => (i === 0 ? word : word[0].toUpperCase() + word.slice(1))).join('');
  return key.replace(/^[^a-z]+/, '') || 'field';
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function uniqueKey(base: string, fields: BuilderField[]) {
  let key = base;
  let n = 2;
  while (fields.some((f) => f.key === key)) key = `${base}${n++}`;
  return key;
}

type Props = { text: ModelsText; fieldTypes: FieldTypeInfo; model?: ContentModel };

export default function ModelBuilder({ text, fieldTypes, model }: Props) {
  const router = useRouter();
  const isNew = !model;

  const [name, setName] = useState(model?.name ?? '');
  const [key, setKey] = useState(model?.key ?? '');
  const [keyEdited, setKeyEdited] = useState(!isNew);
  const [description, setDescription] = useState(model?.description ?? '');
  const [fields, setFields] = useState<BuilderField[]>(() =>
    (model?.fields ?? []).map((field, index) => ({ ...field, id: `existing-${index}`, keyEdited: true }))
  );
  const [draggingType, setDraggingType] = useState<FieldType | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function changeName(value: string) {
    setName(value);
    if (!keyEdited) setKey(toSlug(value));
  }

  function addField(type: FieldType, index?: number) {
    setFields((current) => {
      const label = fieldTypes[type].label;
      const field: BuilderField = {
        id: crypto.randomUUID(),
        key: uniqueKey(toFieldKey(label), current),
        label,
        type,
        required: false,
        help: '',
        keyEdited: false,
      };
      const next = [...current];
      next.splice(index ?? current.length, 0, field);
      return next;
    });
  }

  function updateField(id: string, changes: Partial<BuilderField>) {
    setFields((current) => current.map((f) => (f.id === id ? { ...f, ...changes } : f)));
  }

  function changeLabel(id: string, label: string) {
    setFields((current) =>
      current.map((f) => {
        if (f.id !== id) return f;
        const others = current.filter((o) => o.id !== id);
        return { ...f, label, key: f.keyEdited ? f.key : uniqueKey(toFieldKey(label), others) };
      })
    );
  }

  function removeField(id: string) {
    setFields((current) => current.filter((f) => f.id !== id));
  }

  function handleDragStart({ active }: DragStartEvent) {
    if (active.data.current?.from === 'palette') setDraggingType(active.data.current.type);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setDraggingType(null);
    if (!over) return;

    if (active.data.current?.from === 'palette') {
      const overIndex = fields.findIndex((f) => f.id === over.id);
      addField(active.data.current.type, overIndex === -1 ? undefined : overIndex);
      return;
    }

    if (active.id !== over.id) {
      setFields((current) => {
        const from = current.findIndex((f) => f.id === active.id);
        const to = current.findIndex((f) => f.id === over.id);
        return from === -1 || to === -1 ? current : arrayMove(current, from, to);
      });
    }
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setStatus('');
    setSaving(true);

    const payloadFields = fields.map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
      required: f.required,
      help: f.help,
    }));
    const result = isNew
      ? await postJson<ContentModel>('/content-models', { key, name, description, fields: payloadFields })
      : await patchJson<ContentModel>(`/content-models/${model.id}`, { name, description, fields: payloadFields });
    setSaving(false);

    if (!result.ok) return setError(result.error ?? text.errorFallback);
    if (isNew) {
      router.push(`/models/${result.data.id}`);
      return;
    }
    setStatus(text.saved);
    router.refresh();
  }

  async function removeModel() {
    if (!model || !confirm(text.deleteConfirm)) return;
    const result = await deleteJson(`/content-models/${model.id}`);
    if (!result.ok) return setError(result.error ?? text.errorFallback);
    router.push('/models');
    router.refresh();
  }

  return (
    <form onSubmit={save} noValidate className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900">
        {isNew ? text.newTitle : fill(text.editTitle, { name: model.name })}
      </h1>

      <div className="grid gap-4 rounded-xl bg-white p-6 ring-1 ring-zinc-200 sm:grid-cols-2">
        <Field id="model-name" label={text.nameLabel} value={name} onChange={changeName} autoComplete="off" />
        <Field
          id="model-key"
          label={text.keyLabel}
          value={key}
          onChange={(value) => {
            setKey(value);
            setKeyEdited(true);
          }}
          hint={text.keyHelp}
          disabled={!isNew}
          autoComplete="off"
        />
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="model-description" className="text-sm font-medium text-zinc-700">
            {text.descriptionLabel}
          </label>
          <textarea
            id="model-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
          />
        </div>
      </div>

      <DndContext
        id="model-builder"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggingType(null)}
      >
        <div className="grid items-start gap-6 lg:grid-cols-[16rem_1fr]">
          <section aria-labelledby="palette-heading" className="space-y-3 lg:sticky lg:top-6">
            <div>
              <h2 id="palette-heading" className="font-semibold text-zinc-900">
                {text.paletteTitle}
              </h2>
              <p className="text-sm text-zinc-500">{text.paletteHelp}</p>
            </div>
            <ul className="space-y-2">
              {(Object.keys(fieldTypes) as FieldType[]).map((type) => (
                <PaletteItem
                  key={type}
                  type={type}
                  info={fieldTypes[type]}
                  addLabel={fill(text.addLabel, { type: fieldTypes[type].label })}
                  onAdd={() => addField(type)}
                />
              ))}
            </ul>
          </section>

          <FieldList
            fields={fields}
            fieldTypes={fieldTypes}
            text={text}
            onLabel={changeLabel}
            onChange={updateField}
            onRemove={removeField}
          />
        </div>

        <DragOverlay>
          {draggingType && (
            <div className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-lg ring-1 ring-zinc-300">
              {fieldTypes[draggingType].label}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <FormError message={error} />
      {status && (
        <p role="status" className="text-sm text-green-700">
          {status}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {saving ? text.saving : text.save}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={removeModel}
            className="rounded-lg px-4 py-2.5 text-sm text-red-700 ring-1 ring-red-200 hover:bg-red-50"
          >
            {text.deleteModel}
          </button>
        )}
      </div>
    </form>
  );
}

function PaletteItem({
  type,
  info,
  addLabel,
  onAdd,
}: {
  type: FieldType;
  info: { label: string; description: string };
  addLabel: string;
  onAdd: () => void;
}) {
  const { listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { from: 'palette', type },
  });

  return (
    <li
      className={`flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div ref={setNodeRef} {...listeners} className="min-w-0 flex-1 cursor-grab touch-none">
        <p className="text-sm font-medium text-zinc-900">{info.label}</p>
        <p className="truncate text-xs text-zinc-500">{info.description}</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        aria-label={addLabel}
        className="rounded-md p-1.5 text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100"
      >
        <Plus size={16} aria-hidden />
      </button>
    </li>
  );
}

type FieldListProps = {
  fields: BuilderField[];
  fieldTypes: FieldTypeInfo;
  text: ModelsText;
  onLabel: (id: string, label: string) => void;
  onChange: (id: string, changes: Partial<BuilderField>) => void;
  onRemove: (id: string) => void;
};

function FieldList({ fields, fieldTypes, text, onLabel, onChange, onRemove }: FieldListProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  return (
    <section aria-labelledby="fields-heading" className="space-y-3">
      <h2 id="fields-heading" className="font-semibold text-zinc-900">
        {text.fieldsTitle}
      </h2>
      <div
        ref={setNodeRef}
        className={`min-h-40 rounded-xl border-2 border-dashed p-3 ${
          isOver ? 'border-zinc-900 bg-zinc-100' : 'border-zinc-300'
        }`}
      >
        {fields.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">{text.dropHere}</p>
        ) : (
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-3">
              {fields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  typeLabel={fieldTypes[field.type].label}
                  text={text}
                  onLabel={(label) => onLabel(field.id, label)}
                  onChange={(changes) => onChange(field.id, changes)}
                  onRemove={() => onRemove(field.id)}
                />
              ))}
            </ul>
          </SortableContext>
        )}
      </div>
    </section>
  );
}

type SortableFieldProps = {
  field: BuilderField;
  typeLabel: string;
  text: ModelsText;
  onLabel: (label: string) => void;
  onChange: (changes: Partial<BuilderField>) => void;
  onRemove: () => void;
};

function SortableField({ field, typeLabel, text, onLabel, onChange, onRemove }: SortableFieldProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });
  const name = field.label || typeLabel;
  const prefix = `field-${field.id}`;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl bg-white p-4 ring-1 ring-zinc-200 ${isDragging ? 'relative z-10 shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={fill(text.moveLabel, { label: name })}
          className="mt-6 cursor-grab touch-none rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <GripVertical size={18} aria-hidden />
        </button>

        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 sm:col-span-2">{typeLabel}</span>
          <Field id={`${prefix}-label`} label={text.fieldLabelLabel} value={field.label} onChange={onLabel} autoComplete="off" />
          <Field
            id={`${prefix}-key`}
            label={text.fieldKeyLabel}
            value={field.key}
            onChange={(key) => onChange({ key, keyEdited: true })}
            autoComplete="off"
          />
          <div className="sm:col-span-2">
            <Field
              id={`${prefix}-help`}
              label={text.fieldHelpLabel}
              value={field.help}
              onChange={(help) => onChange({ help })}
              autoComplete="off"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onChange({ required: e.target.checked })}
              className="h-4 w-4"
            />
            {text.requiredLabel}
          </label>
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label={fill(text.removeLabel, { label: name })}
          className="mt-6 rounded-md p-1.5 text-zinc-500 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 size={18} aria-hidden />
        </button>
      </div>
    </li>
  );
}