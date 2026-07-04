import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import InformeInteligenteObservaciones from "./InformeInteligenteObservaciones";

import api from "../services/api";

const getChildFullName = (child) => {
  return (
    `${child.firstName || ""} ${child.lastName || ""}`.trim() ||
    child.email ||
    "Niño/a sin nombre"
  );
};

const InformeInteligentePage = () => {
  const [children, setChildren] = useState([]);
  const [searchParams] = useSearchParams();
  const childIdFromUrl = Number(searchParams.get("childId"));
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadChildren = async () => {
    try {
      setLoading(true);

      const response = await api.get("/parent-child/me/children");

      const rawChildren = Array.isArray(response.data)
        ? response.data
        : response.data.children || [];

      const childrenData = rawChildren.map((child) => ({
        ...child,
        id: child.child_id || child.childId || child.id,
        firstName:
          child.firstName ||
          child.first_name ||
          child.child_first_name ||
          child.childFirstName ||
          "",
        lastName:
          child.lastName ||
          child.last_name ||
          child.child_last_name ||
          child.childLastName ||
          "",
        email: child.email || child.child_email || child.childEmail || "",
      }));

      setChildren(childrenData);

      if (childrenData.length > 0) {
        const childFromUrl = childrenData.find(
          (child) => Number(child.id) === childIdFromUrl,
        );

        setSelectedChild(childFromUrl || childrenData[0]);
      }
    } catch (error) {
      console.error("Error cargando niños asociados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, [childIdFromUrl]);

  const handleChildChange = (e) => {
    const childId = Number(e.target.value);
    const child = children.find((item) => Number(item.id) === childId);
    setSelectedChild(child || null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-violet-50 to-teal-50 px-5 py-8">
      <section className="max-w-6xl mx-auto">
        <section className="bg-white/90 rounded-[2rem] shadow-md border border-purple-100 p-6 md:p-8 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-100 rounded-full blur-3xl opacity-70 -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-70 -ml-16 -mb-16" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
            <div>
              <p className="text-sm font-bold text-teal-600 mb-2">
                🧠 Módulo para padres y cuidadores
              </p>

              <h1 className="text-3xl md:text-5xl font-extrabold text-purple-700 leading-tight">
                Informe Inteligente de Observaciones
              </h1>

              <p className="text-gray-600 mt-4 text-lg leading-relaxed">
                Reúne perfil sensorial, emociones, rutinas, lugares,
                conversaciones y avances registrados en FloFlo para entregar una
                mirada clara y respetuosa del período analizado.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold">
                  Sin diagnóstico
                </span>

                <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-bold">
                  Basado en registros
                </span>

                <span className="bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-bold">
                  Descargable en PDF
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm">
              <label className="block text-sm font-bold text-purple-700 mb-3">
                Niño/a seleccionado/a
              </label>

              {loading ? (
                <p className="text-gray-500">Cargando niños asociados...</p>
              ) : children.length > 0 ? (
                <>
                  <select
                    value={selectedChild?.id || ""}
                    onChange={handleChildChange}
                    className="bg-white border border-purple-200 rounded-2xl px-4 py-3 text-gray-700 font-bold shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {getChildFullName(child)}
                      </option>
                    ))}
                  </select>

                  <p className="text-sm text-gray-500 mt-3">
                    El informe se generará usando los registros asociados a este
                    niño/a.
                  </p>
                </>
              ) : (
                <p className="text-gray-500">
                  Este cuidador todavía no tiene niños asociados.
                </p>
              )}
            </div>
          </div>
        </section>

        {selectedChild ? (
          <InformeInteligenteObservaciones selectedChild={selectedChild} />
        ) : (
          <section className="bg-white rounded-3xl p-6 shadow-md border border-purple-100">
            <p className="text-gray-600">
              Selecciona o asocia un niño/a para generar el informe inteligente.
            </p>
          </section>
        )}
      </section>
    </main>
  );
};

export default InformeInteligentePage;