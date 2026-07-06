import { useEffect, useMemo, useState } from "react";
import {
  generateIntelligentObservation,
  getLatestIntelligentObservation,
  getIntelligentObservationHistory,
  downloadLatestIntelligentObservationPdf,
  getIntelligentObservationById,
  downloadIntelligentObservationPdfById,
} from "../services/intelligentObservationService";

const formatDate = (dateValue) => {
  if (!dateValue) return "Sin fecha";

  return new Date(dateValue).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getChildFullName = (child) => {
  return (
    `${child?.firstName || ""} ${child?.lastName || ""}`.trim() ||
    child?.email ||
    "niño/a seleccionado/a"
  );
};

const getSectionIcon = (title) => {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("resumen")) return "🌿";
  if (lowerTitle.includes("patrones")) return "🔎";
  if (lowerTitle.includes("sensorial")) return "🧩";
  if (lowerTitle.includes("fortalezas")) return "✨";
  if (lowerTitle.includes("atención")) return "💜";
  if (lowerTitle.includes("recomendaciones")) return "🛠️";
  if (lowerTitle.includes("evolución")) return "📈";
  if (lowerTitle.includes("conclusión")) return "📝";

  return "📌";
};

const parseReportSections = (report) => {
  if (!report) return [];

  const lines = report.split("\n");
  const sections = [];
  let currentSection = null;

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (line.startsWith("# ")) {
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        title: line.replace("# ", "").trim(),
        content: [],
      };

      return;
    }

    if (!currentSection) return;

    if (line === "---") return;

    currentSection.content.push(rawLine);
  });

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
};

const RenderSectionContent = ({ content }) => {
  return (
    <div className="space-y-3 text-slate-700 leading-relaxed">
      {content.map((rawLine, index) => {
        const line = rawLine.trim();

        if (!line) {
          return <div key={index} className="h-1" />;
        }

        if (line.startsWith("- ")) {
          return (
            <div key={index} className="flex gap-3 pl-1">
              <span className="text-purple-400 mt-1">•</span>
              <p>{line.replace("- ", "")}</p>
            </div>
          );
        }

        return <p key={index}>{line}</p>;
      })}
    </div>
  );
};

const ReportSectionCard = ({ section }) => {
  return (
    <article className="bg-white rounded-3xl border border-purple-100 shadow-sm p-5 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-100 to-teal-100 flex items-center justify-center text-xl">
          {getSectionIcon(section.title)}
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-purple-700">
          {section.title}
        </h3>
      </div>

      <RenderSectionContent content={section.content} />
    </article>
  );
};

const DataSummaryCard = ({ label, value, emoji }) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-3xl p-4 border border-purple-100 shadow-sm">
      <p className="text-2xl mb-2">{emoji}</p>
      <p className="text-sm font-semibold text-purple-500">{label}</p>
      <p className="text-3xl font-extrabold text-purple-800 mt-1">
        {value ?? 0}
      </p>
    </div>
  );
};

const formatReportDate = (date) => {
  if (!date) return "Fecha no disponible";

  return new Date(date).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatReportDateTime = (date) => {
  if (!date) return "Fecha no disponible";

  return new Date(date).toLocaleString("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getReportCreatedAt = (report) => {
  return report?.createdAt || report?.created_at || null;
};

const getReportPeriodDays = (report) => {
  return report?.periodDays || report?.period_days || 30;
};

const InformeInteligenteObservaciones = ({ selectedChild }) => {
  const [latestReport, setLatestReport] = useState(null);
  const [selectedReportData, setSelectedReportData] = useState(null);
  const [history, setHistory] = useState([]);
  const [periodDays, setPeriodDays] = useState(30);

  const [loadingLatest, setLoadingLatest] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [downloadingHistoryId, setDownloadingHistoryId] = useState(null);
  const [showFullReport, setShowFullReport] = useState(false);

  const selectedReport = selectedReportData || latestReport;

  const selectedReportCreatedAt = getReportCreatedAt(selectedReport);

  const selectedReportIsLatest =
    latestReport?.id &&
    selectedReport?.id &&
    Number(latestReport.id) === Number(selectedReport.id);

  const childId = selectedChild?.id;
  const childName = getChildFullName(selectedChild);
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  const getReportCreatorName = (report) => {
    return report?.generatedByName || report?.generated_by_name || "Cuidador/a";
  };

  const latestReportDate =
    latestReport?.createdAt || latestReport?.generatedAt || null;

  const nextAvailableAt = latestReportDate
    ? new Date(new Date(latestReportDate).getTime() + TWENTY_FOUR_HOURS_MS)
    : null;

  const canGenerateReport =
    !nextAvailableAt || Date.now() >= nextAvailableAt.getTime();

  const formattedNextAvailableAt = nextAvailableAt
    ? nextAvailableAt.toLocaleString("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const reportSections = useMemo(() => {
    return parseReportSections(selectedReport?.report);
  }, [selectedReport?.report]);

  const visibleSections = showFullReport
    ? reportSections
    : reportSections.slice(0, 3);

  const loadLatestReport = async () => {
    if (!childId) return;

    try {
      setLoadingLatest(true);
      setError("");

      const data = await getLatestIntelligentObservation(childId);

      setLatestReport(data);
      setSelectedReportData(null);
      setSelectedReportId(data.id || null);
      setShowFullReport(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setLatestReport(null);
        setSelectedReportData(null);
        setSelectedReportId(null);
        return;
      }

      console.error("Error cargando último informe inteligente:", error);
      setError("No se pudo cargar el último informe inteligente.");
    } finally {
      setLoadingLatest(false);
    }
  };

  const loadHistory = async () => {
    if (!childId) return;

    try {
      const data = await getIntelligentObservationHistory(childId);
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando historial de informes:", error);
    }
  };

  useEffect(() => {
    if (childId) {
      loadLatestReport();
      loadHistory();
    }
  }, [childId]);

  const handleGenerateReport = async () => {
    if (!childId) {
      setError("Selecciona un niño antes de generar el informe.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setSuccessMessage("");

      const data = await generateIntelligentObservation(childId, periodDays);

      setLatestReport(data);
      setSelectedReportData(null);
      setSelectedReportId(data.id || null);
      setShowFullReport(false);

      await loadHistory();

      setSuccessMessage(
        "Informe inteligente generado y guardado correctamente.",
      );
    } catch (error) {
      console.error("Error generando informe inteligente:", error);
      const apiMessage =
        error.response?.data?.message ||
        "No se pudo generar el informe inteligente.";

      const nextAvailable = error.response?.data?.nextAvailableAt
        ? new Date(error.response.data.nextAvailableAt).toLocaleString(
            "es-CL",
            {
              dateStyle: "medium",
              timeStyle: "short",
            },
          )
        : null;

      setError(
        nextAvailable
          ? `${apiMessage} Disponible nuevamente desde: ${nextAvailable}.`
          : apiMessage,
      );

      await loadLatestReport();
      await loadHistory();
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!childId) {
      setError("Selecciona un niño antes de descargar el informe.");
      return;
    }

    try {
      setDownloading(true);
      setError("");
      
      if (selectedReportId) {
        await downloadIntelligentObservationPdfById(childId, selectedReportId);
      } else {
        await downloadLatestIntelligentObservationPdf(childId);
      }
    } catch (error) {
      console.error("Error descargando PDF:", error);
      setError(
        error.response?.data?.message ||
          "No se pudo descargar el informe inteligente.",
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleViewHistoryReport = async (reportId) => {
    if (!childId) return;

    try {
      setError("");
      setSuccessMessage("");
      setSelectedReportId(reportId);

      const data = await getIntelligentObservationById(childId, reportId);

      setSelectedReportData(data);
      setSelectedReportId(data.id || reportId);
      setShowFullReport(false);

      setSuccessMessage("Informe histórico cargado correctamente.");
    } catch (error) {
      console.error("Error cargando informe histórico:", error);
      setError(
        error.response?.data?.message ||
          "No se pudo cargar el informe histórico.",
      );
    }
  };

  const handleDownloadHistoryPdf = async (reportId) => {
    if (!childId) return;

    try {
      setError("");
      setDownloadingHistoryId(reportId);
      const historyItem = history.find(
        (item) => Number(item.id) === Number(reportId),
      );

      await downloadIntelligentObservationPdfById(childId, reportId, {
        childName: latestReport?.childName || childName,
        createdAt: historyItem?.createdAt || latestReport?.createdAt,
      });
    } catch (error) {
      console.error("Error descargando PDF histórico:", error);
      setError(
        error.response?.data?.message ||
          "No se pudo descargar el informe histórico.",
      );
    } finally {
      setDownloadingHistoryId(null);
    }
  };

  return (
    <section className="space-y-8">
      <section className="bg-white rounded-[2rem] shadow-md border border-purple-100 p-6 md:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div>
            <p className="text-sm font-bold text-purple-500 mb-2">
              Observaciones automáticas
            </p>

            <h2 className="text-2xl md:text-3xl font-extrabold text-purple-800">
              Informe de {childName}
            </h2>

            <p className="text-slate-600 mt-3 leading-relaxed">
              Este informe cruza la información disponible en FloFlo para
              entregar observaciones útiles a padres, cuidadores y
              profesionales. No reemplaza una evaluación profesional.
            </p>

            <div className="mt-5 bg-purple-50 border border-purple-100 rounded-3xl p-4">
              <p className="text-sm font-bold text-purple-700 mb-1">
                Antes de generar
              </p>

              <p className="text-sm text-slate-600">
                Mientras más registros existan en emociones, rutinas, perfil
                sensorial y lugares, más completo será el informe.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-teal-50 rounded-3xl border border-purple-100 p-5">
            <label className="block text-sm font-bold text-purple-700 mb-2">
              Período analizado
            </label>

            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              className="w-full border border-purple-200 rounded-2xl px-4 py-3 bg-white text-purple-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value={7}>Últimos 7 días</option>
              <option value={30}>Últimos 30 días</option>
              <option value={60}>Últimos 60 días</option>
              <option value={90}>Últimos 90 días</option>
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={generating || !canGenerateReport}
                className="bg-violet-200 text-violet-800 border border-violet-300 rounded-2xl px-5 py-3 font-bold hover:bg-violet-300 disabled:opacity-60 shadow-sm transition"
              >
                {generating
                  ? "Generando..."
                  : canGenerateReport
                    ? "Generar informe"
                    : "Disponible en 24 h"}
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading || !latestReport}
                className="bg-teal-100 text-teal-800 border border-teal-200 rounded-2xl px-5 py-3 font-bold hover:bg-teal-200 disabled:opacity-60 shadow-sm transition"
              >
                {downloading ? "Descargando..." : "Descargar PDF"}
              </button>
              {!canGenerateReport && formattedNextAvailableAt && (
                <div className="mt-4 bg-violet-50 border border-violet-100 rounded-2xl p-4 text-sm text-violet-800">
                  Ya existe un informe generado durante las últimas 24 horas.
                  Podrás generar uno nuevo desde:{" "}
                  <span className="font-bold">{formattedNextAvailableAt}</span>.
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-5 bg-green-50 border border-green-100 text-green-700 rounded-2xl p-4">
            {successMessage}
          </div>
        )}
      </section>

      {loadingLatest ? (
        <section className="bg-white rounded-[2rem] shadow-md border border-purple-100 p-8 text-purple-600 font-semibold">
          Cargando informe...
        </section>
      ) : latestReport ? (
        <>
          <section className="bg-white rounded-[2rem] shadow-md border border-purple-100 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm font-bold text-purple-500">
                  Informe seleccionado
                </p>
                <h3 className="text-2xl font-extrabold text-purple-800 mt-1">
                  {formatDate(getReportCreatedAt(selectedReport))}
                </h3>

                <p className="text-slate-600 mt-1">
                  Período analizado: últimos{" "}
                  {getReportPeriodDays(selectedReport)} días
                </p>
              </div>

              <span className="bg-teal-100 text-teal-700 border border-teal-200 rounded-full px-4 py-2 text-sm font-bold w-fit">
                Guardado en FloFlo
              </span>
            </div>

            {selectedReport?.dataSummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DataSummaryCard
                  emoji="😊"
                  label="Emociones"
                  value={selectedReport.dataSummary.moodsCount}
                />

                <DataSummaryCard
                  emoji="🕒"
                  label="Rutinas"
                  value={selectedReport.dataSummary.routinesCount}
                />

                <DataSummaryCard
                  emoji="📍"
                  label="Lugares"
                  value={selectedReport.dataSummary.placesCount}
                />

                <DataSummaryCard
                  emoji="💬"
                  label="Conversaciones"
                  value={selectedReport.dataSummary.contactConversationsCount}
                />
              </div>
            )}
          </section>

          {selectedReport && (
            <div className="bg-white border border-violet-100 rounded-3xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-violet-500 uppercase tracking-wide">
                    {selectedReportIsLatest
                      ? "Informe actual"
                      : "Informe histórico"}
                  </p>

                  <h3 className="text-lg md:text-xl font-extrabold text-gray-800 mt-1">
                    Estás viendo el informe del{" "}
                    {formatReportDate(selectedReportCreatedAt)}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Período analizado: últimos{" "}
                    {getReportPeriodDays(selectedReport)} días
                  </p>

                  <p className="text-sm text-gray-500">
                    Generado por: {getReportCreatorName(selectedReport)}
                  </p>
                </div>

                {selectedReportIsLatest ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-full text-sm font-bold w-fit">
                    Actual
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReportData(null);
                      setSelectedReportId(latestReport?.id || null);
                      setShowFullReport(false);
                    }}
                    className="bg-violet-50 text-violet-700 border border-violet-100 px-4 py-2 rounded-full text-sm font-bold hover:bg-violet-100 transition w-fit"
                  >
                    Volver al informe actual
                  </button>
                )}
              </div>
            </div>
          )}

          <section className="space-y-5">
            {visibleSections.map((section) => (
              <ReportSectionCard key={section.title} section={section} />
            ))}

            {reportSections.length > 3 && (
              <button
                type="button"
                onClick={() => setShowFullReport((prev) => !prev)}
                className="w-full bg-white border border-purple-200 text-purple-700 rounded-2xl py-4 font-bold shadow-sm hover:bg-purple-50 transition"
              >
                {showFullReport
                  ? "Mostrar menos"
                  : `Ver informe completo (${reportSections.length} secciones)`}
              </button>
            )}
          </section>

          {history.length > 0 && (
            <section className="bg-white rounded-[2rem] shadow-md border border-purple-100 p-6 md:p-8">
              <div className="mb-5">
                <p className="text-sm font-bold text-purple-500">
                  Historial guardado
                </p>

                <h3 className="text-2xl font-extrabold text-purple-800">
                  Informes anteriores
                </h3>

                <p className="text-slate-600 mt-1">
                  Puedes revisar o descargar informes generados anteriormente,
                  sin volver a usar IA.
                </p>
              </div>

              <div className="space-y-3">
                {history.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-2xl p-4 border transition ${
                      Number(selectedReportId) === Number(item.id)
                        ? "bg-violet-50 border-violet-200 shadow-sm"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <p className="font-bold text-purple-700">
                          {formatDate(getReportCreatedAt(item))}
                        </p>

                        <p className="text-sm text-slate-500">
                          Período: últimos {getReportPeriodDays(item)} días
                        </p>

                        {item.reportPreview && (
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                            {item.reportPreview}...
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewHistoryReport(item.id)}
                          className="bg-violet-100 text-violet-800 border border-violet-200 rounded-xl px-4 py-2 text-sm font-bold hover:bg-violet-200 transition"
                        >
                          {Number(selectedReportId) === Number(item.id)
                            ? "Viendo"
                            : "Ver informe"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadHistoryPdf(item.id)}
                          disabled={downloadingHistoryId === item.id}
                          className="bg-teal-100 text-teal-800 border border-teal-200 rounded-xl px-4 py-2 text-sm font-bold hover:bg-teal-200 disabled:opacity-60 transition"
                        >
                          {downloadingHistoryId === item.id
                            ? "Descargando..."
                            : "Descargar PDF"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <section className="bg-white rounded-[2rem] shadow-md border border-purple-100 p-6 md:p-8">
          <div className="bg-purple-50 rounded-3xl p-6 border border-purple-100">
            <p className="font-bold text-purple-800 text-xl">
              Todavía no hay informe inteligente guardado.
            </p>

            <p className="text-slate-600 mt-2">
              Presiona “Generar informe” para crear el primer informe
              inteligente de este niño/a.
            </p>
          </div>
        </section>
      )}
    </section>
  );
};

export default InformeInteligenteObservaciones;
