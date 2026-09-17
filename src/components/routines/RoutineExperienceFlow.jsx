import RoutineExperienceBuilder from "../../modules/experiences/components/RoutineExperienceBuilder";
import RoutineExperienceLibrary from "../../modules/experiences/components/RoutineExperienceLibrary";
import ExperienceTemplateDetail from "../../modules/experiences/components/ExperienceTemplateDetail";

const RoutineExperienceFlow = ({
  canCreateOrEditRoutines,
  editingId,
  editingRoutine,
  experienceView,
  selectedTemplateId,
  selectedTemplate,
  childId,
  onOpenLibrary,
  onCreateBlank,
  onSelectTemplate,
  onBackToLibrary,
  onCancelEdit,
  onUseTemplate,
  onCreated,
  onBackToRoutines,
}) => {
  return (
    <>
      {canCreateOrEditRoutines && !editingId && experienceView === null && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onOpenLibrary}
            className="rounded-3xl bg-[#9B7BE8] px-7 py-4 text-lg font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#8768D6]"
          >
            ✨ Usar experiencia FloFlo
          </button>

          <button
            type="button"
            onClick={onCreateBlank}
            className="rounded-3xl border-2 border-[#DCCCF8] bg-white px-7 py-4 text-lg font-extrabold text-[#5F4A8B] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F7F3FF]"
          >
            ＋ Crear desde cero
          </button>
        </div>
      )}

      {experienceView === "library" && !editingId && (
        <div className="mb-10">
          <button
            type="button"
            onClick={onBackToRoutines}
            className="mb-6 rounded-2xl border-2 border-[#DCCCF8] bg-white px-5 py-3 font-extrabold text-[#5F4A8B] shadow-sm transition hover:bg-[#F7F3FF]"
          >
            ← Volver a rutinas activas
          </button>

          <RoutineExperienceLibrary
            onSelect={onSelectTemplate}
            childId={childId}
          />
        </div>
      )}

      {experienceView === "detail" && selectedTemplate && !editingId && (
        <ExperienceTemplateDetail
          template={selectedTemplate}
          onBack={onBackToLibrary}
          onBackToRoutines={onBackToRoutines}
          onUse={onUseTemplate}
        />
      )}

      {experienceView === "builder" && (
        <div className="mb-10">
          <RoutineExperienceBuilder
            templateId={selectedTemplateId ?? null}
            editingRoutine={editingRoutine}
            onCancel={editingRoutine ? onCancelEdit : onBackToLibrary}
            onCreated={onCreated}
          />
        </div>
      )}
    </>
  );
};

export default RoutineExperienceFlow;
