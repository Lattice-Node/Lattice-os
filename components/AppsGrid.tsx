"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { nativeFetch } from "@/lib/native-fetch";
import { hapticImpact } from "@/lib/native";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface AppItem {
  id: string;
  name: string;
  icon: string;
  route: string;
  color: string;
  color1?: string;
  color2?: string;
  position: number;
}

function SortableApp({
  app,
  editMode,
  onDelete,
  onTap,
}: {
  app: AppItem;
  editMode: boolean;
  onDelete: (id: string) => void;
  onTap: (route: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, display: "flex", flexDirection: "column" as const, alignItems: "center", width: "100%" }}
      {...(editMode ? { ...attributes, ...listeners } : {})}
    >
      <div
        className={editMode ? "app-cell edit-mode" : "app-cell"}
        onClick={(e) => {
          if (editMode) {
            e.stopPropagation();
            return;
          }
          onTap(app.route);
        }}
        style={{
          background: app.color1 && app.color2
            ? `linear-gradient(135deg, ${app.color1} 0%, ${app.color2} 100%)`
            : app.color,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
          position: "relative",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>
          <path d={app.icon} />
        </svg>
        {editMode && (
          <button
            className="app-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(app.id);
            }}
          >
            ×
          </button>
        )}
      </div>
      <span className="app-grid-label">{app.name}</span>
    </div>
  );
}

export default function AppsGrid() {
  const router = useRouter();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [available, setAvailable] = useState<AppItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  useEffect(() => {
    nativeFetch("/api/apps")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setApps(d.visible || []);
          setAvailable(d.available || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveLayout = useCallback(
    (newApps: AppItem[], newHidden: string[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        nativeFetch("/api/apps", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apps: newApps.map((a, i) => ({ id: a.id, position: i })),
            hiddenApps: newHidden,
          }),
        }).catch(() => {});
      }, 500);
    },
    []
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = apps.findIndex((a) => a.id === active.id);
    const newIndex = apps.findIndex((a) => a.id === over.id);
    const newApps = arrayMove(apps, oldIndex, newIndex);
    setApps(newApps);
    hapticImpact("light");
    saveLayout(
      newApps,
      available.map((a) => a.id)
    );
  };

  const handleDelete = (id: string) => {
    const app = apps.find((a) => a.id === id);
    if (!app) return;
    hapticImpact("medium");
    const newApps = apps.filter((a) => a.id !== id);
    const newAvailable = [...available, app];
    setApps(newApps);
    setAvailable(newAvailable);
    saveLayout(
      newApps,
      newAvailable.map((a) => a.id)
    );
  };

  const handleAdd = (id: string) => {
    const app = available.find((a) => a.id === id);
    if (!app) return;
    hapticImpact("light");
    const newApps = [...apps, { ...app, position: apps.length }];
    const newAvailable = available.filter((a) => a.id !== id);
    setApps(newApps);
    setAvailable(newAvailable);
    setShowAddModal(false);
    saveLayout(
      newApps,
      newAvailable.map((a) => a.id)
    );
  };

  const handleTap = (route: string) => {
    if (editMode) return;
    hapticImpact("light");
    router.push(route);
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setEditMode(true);
      hapticImpact("medium");
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, color: "var(--text-secondary)" }}>
        読み込み中...
      </div>
    );
  }

  return (
    <div
      onPointerDown={!editMode ? handleLongPressStart : undefined}
      onPointerUp={handleLongPressEnd}
      onPointerCancel={handleLongPressEnd}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={apps.map((a) => a.id)} strategy={rectSortingStrategy}>
          <div className="apps-grid">
            {apps.map((app) => (
              <SortableApp
                key={app.id}
                app={app}
                editMode={editMode}
                onDelete={handleDelete}
                onTap={handleTap}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Edit mode controls */}
      {editMode && (
        <div style={{ display: "flex", gap: 10, padding: "16px 20px" }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "1px dashed var(--border-visible)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            + 追加
          </button>
          <button
            onClick={() => setEditMode(false)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: "var(--btn-bg)",
              color: "var(--btn-text)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            完了
          </button>
        </div>
      )}

      {/* Add modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 200,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "var(--surface)",
              borderRadius: "16px 16px 0 0",
              padding: "20px 20px calc(20px + env(safe-area-inset-bottom, 0px))",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <p
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text-display)",
                margin: "0 0 16px",
              }}
            >
              追加するアプリ
            </p>
            {available.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--text-secondary)", textAlign: "center", padding: "20px 0" }}>
                追加できるアプリはありません
              </p>
            ) : (
              <div className="apps-grid" style={{ padding: 0 }}>
                {available.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleAdd(app.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div className="app-cell" style={{
                      background: app.color1 && app.color2
                        ? `linear-gradient(135deg, ${app.color1} 0%, ${app.color2} 100%)`
                        : app.color,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                    }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>
                        <path d={app.icon} />
                      </svg>
                    </div>
                    <span className="app-grid-label">{app.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
