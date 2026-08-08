import RoutineExperienceBuilder from "../../modules/experiences/components/RoutineExperienceBuilder";
import RoutineExperienceLibrary from "../../modules/experiences/components/RoutineExperienceLibrary";
import ExperienceTemplateDetail from "../../modules/experiences/components/ExperienceTemplateDetail";

const RoutineExperienceFlow = ({
  canCreateOrEditRoutines,
  editingId,
  experienceView,
  selectedTemplateId,
  selectedTemplate,
  childId,
  onOpenLibrary,
  onSelectTemplate,
  onBackToLibrary,
  onUseTemplate,
  onCreated,
}) => {
  return (
    <>
      {canCreateOrEditRoutines && !editingId && experienceView === null && (
        <div className="mb-8 flex justify-center">
          <button
            type="button"
            onClick={onOpenLibrary}
            className="rounded-3xl bg-[#9B7BE8] px-7 py-4 text-lg font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#8768D6]"
          >
            ✨ Crear nueva experiencia
          </button>
        </div>
      )}

      {experienceView === "library" && !editingId && (
        <div className="mb-10">
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
          onUse={onUseTemplate}
        />
      )}

      {experienceView === "builder" && selectedTemplateId && !editingId && (
        <div className="mb-10">
          <RoutineExperienceBuilder
            templateId={selectedTemplateId}
            onCancel={onBackToLibrary}
            onCreated={onCreated}
          />
        </div>
      )}
    </>
  );
};

export default RoutineExperienceFlow;
